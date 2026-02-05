import { Response } from "express";
import mongoose from "mongoose";
import { Application, ApplicationStatus } from "../models/Application";
import { Vacancy, VacancyStatus } from "../models/Vacancy";
import { AuthRequest } from "../middleware/auth";

export const applyToVacancy = async (req: AuthRequest, res: Response) => {
  try {
    const { vacancyId } = req.body;

    console.log(
      "Apply to vacancy - vacancyId:",
      vacancyId,
      "type:",
      typeof vacancyId,
    );

    // Validar dados
    if (!vacancyId) {
      return res.status(400).json({ message: "ID da vaga é obrigatório" });
    }

    if (!req.userId || !req.user) {
      return res.status(401).json({ message: "Usuário não autenticado" });
    }

    // Converter para ObjectId
    let objectId;
    try {
      // Se já é um ObjectId válido, usa direto
      if (mongoose.Types.ObjectId.isValid(vacancyId)) {
        objectId = new mongoose.Types.ObjectId(vacancyId);
      } else {
        console.error("ID inválido:", vacancyId);
        return res.status(400).json({ message: "ID da vaga inválido" });
      }
    } catch (err) {
      console.error("Erro ao converter ID:", vacancyId, err);
      return res.status(400).json({ message: "ID da vaga inválido" });
    }

    console.log("Procurando vaga com ObjectId:", objectId.toString());

    // Verificar se vaga existe
    const vacancy = await Vacancy.findById(objectId);
    console.log("Vaga encontrada:", vacancy ? "sim" : "não");

    if (!vacancy) {
      console.error("Vaga não encontrada com ID:", objectId.toString());
      return res.status(404).json({ message: "Vaga não encontrada" });
    }

    // Verificar se vaga está expirada
    const now = new Date();
    if (now > vacancy.endTime) {
      return res.status(400).json({ message: "Esta vaga já expirou" });
    }

    // Verificar se ainda há tempo para se candidatar (mínimo 30 minutos antes do início)
    const timeUntilStart = vacancy.startTime.getTime() - now.getTime();
    const minutesUntilStart = timeUntilStart / (1000 * 60);

    if (minutesUntilStart < 30) {
      return res.status(400).json({
        message:
          "Faltam menos de 30 minutos para o início da vaga. Não é possível se candidatar. Apenas líderes e administradores podem adicionar usuários manualmente.",
        timeRemaining: minutesUntilStart,
      });
    }

    // Verificar se já aplicou
    const existingApp = await Application.findOne({
      vacancyId: objectId,
      userId: req.userId,
      status: { $ne: ApplicationStatus.CANCELED },
    });

    if (existingApp) {
      return res
        .status(400)
        .json({ message: "Você já se candidatou para esta vaga" });
    }

    // Contar vagas preenchidas
    const filledCount = await Application.countDocuments({
      vacancyId: objectId,
      status: { $in: [ApplicationStatus.APPROVED, ApplicationStatus.PENDING] },
    });

    if (filledCount >= vacancy.totalSpots) {
      return res.status(400).json({ message: "Vaga lotada" });
    }

    const application = new Application({
      vacancyId: objectId,
      userId: req.userId,
      userName: req.user.name,
      userPhone: req.user.phone,
      userProfilePic: req.user.profilePic,
      status: ApplicationStatus.PENDING,
      insertedManually: false,
    });

    await application.save();

    // Retornar com id como string
    res.status(201).json({
      id: application._id.toString(),
      vacancyId: application.vacancyId.toString(),
      userId: application.userId.toString(),
      userName: application.userName,
      userPhone: application.userPhone,
      userProfilePic: application.userProfilePic,
      status: application.status,
      createdAt: application.createdAt,
    });
  } catch (error: any) {
    console.error("Erro ao aplicar para vaga:", error);
    res
      .status(500)
      .json({ message: error.message || "Erro ao aplicar para vaga" });
  }
};

export const getMyApplications = async (req: AuthRequest, res: Response) => {
  try {
    const applications = await Application.find({ userId: req.userId })
      .populate("vacancyId")
      .sort({ createdAt: -1 });

    // Transformar para o formato esperado pelo frontend
    const formattedApps = applications.map((app: any) => ({
      id: app._id.toString(),
      vacancyId: app.vacancyId?._id?.toString(),
      userId: app.userId.toString(),
      userName: app.userName,
      userPhone: app.userPhone,
      userProfilePic: app.userProfilePic,
      status: app.status,
      insertedManually: app.insertedManually || false,
      insertedByUserName: app.insertedByUserName || null,
      createdAt: app.createdAt,
      vacancySnapshot: app.vacancyId
        ? {
            title: app.vacancyId.title,
            startTime: app.vacancyId.startTime,
            endTime: app.vacancyId.endTime,
            value: app.vacancyId.value,
          }
        : null,
    }));

    res.json(formattedApps);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const cancelApplication = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const app = await Application.findById(id);
    if (!app) {
      return res.status(404).json({ message: "Candidatura não encontrada" });
    }

    // Verificar se pertence ao usuário
    if (String(app.userId) !== String(req.userId)) {
      return res
        .status(403)
        .json({ message: "Você não pode cancelar esta candidatura" });
    }

    // Regra: não pode cancelar com menos de 4 horas de antecedência
    const vacancy = await Vacancy.findById(app.vacancyId);
    if (vacancy) {
      const startTime = new Date(vacancy.startTime).getTime();
      const now = new Date().getTime();
      const hoursUntilStart = (startTime - now) / (1000 * 60 * 60);

      if (hoursUntilStart < 4) {
        return res.status(400).json({
          message:
            "Não é possível cancelar. Faltam menos de 4 horas para o início",
        });
      }
    }

    app.status = ApplicationStatus.CANCELED;
    await app.save();

    res.json({ message: "Candidatura cancelada com sucesso" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Delete application (for leaders/admins to remove users from vacancy)
export const deleteApplication = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const app = await Application.findById(id);
    if (!app) {
      return res.status(404).json({ message: "Candidatura não encontrada" });
    }

    // Verificar se quem está removendo é líder/admin e tem permissão
    const vacancy = await Vacancy.findById(app.vacancyId);
    if (!vacancy) {
      return res.status(404).json({ message: "Vaga não encontrada" });
    }

    // ADMIN pode remover qualquer candidato
    // LEADER pode remover candidatos das suas próprias vagas
    const isAdmin = req.user?.role === "administrador";
    const isVacancyOwner = String(vacancy.creatorId) === String(req.userId);

    if (!isAdmin && !isVacancyOwner) {
      return res.status(403).json({
        message: "Você não tem permissão para remover este candidato",
      });
    }

    // Deletar a aplicação
    await Application.findByIdAndDelete(id);

    res.json({ message: "Candidato removido da vaga com sucesso" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
