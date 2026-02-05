import { Response } from "express";
import { Vacancy, VacancyStatus } from "../models/Vacancy";
import { Application, ApplicationStatus } from "../models/Application";
import { User, UserRole } from "../models/User";
import { AuthRequest } from "../middleware/auth";

// Helper function para determinar o status da vaga
const getVacancyStatus = (vacancyData: any, filledSpots: number): string => {
  const now = new Date();
  if (now > vacancyData.endTime) {
    return VacancyStatus.EXPIRED;
  }
  if (filledSpots >= vacancyData.totalSpots) {
    return VacancyStatus.FILLED;
  }
  return vacancyData.status;
};

export const getVacancies = async (req: AuthRequest, res: Response) => {
  try {
    const vacancies = await Vacancy.find().sort({ startTime: 1 });

    // Contar candidaturas aprovadas/pendentes para cada vaga
    const vacanciesWithCounts = await Promise.all(
      vacancies.map(async (v: any) => {
        const count = await Application.countDocuments({
          vacancyId: v._id,
          status: {
            $in: [ApplicationStatus.APPROVED, ApplicationStatus.PENDING],
          },
        });
        const status = getVacancyStatus(v, count);
        return {
          id: v._id.toString(),
          title: v.title,
          description: v.description,
          startTime: v.startTime,
          endTime: v.endTime,
          value: v.value,
          totalSpots: v.totalSpots,
          creatorId: v.creatorId,
          creatorName: v.creatorName,
          filledSpots: count,
          status,
        };
      }),
    );

    res.json(vacanciesWithCounts);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createVacancy = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, startTime, endTime, value, totalSpots } =
      req.body;
    const creator = req.user;

    // Validação: apenas ADMIN e LEADER podem criar vagas
    if (creator.role === UserRole.INTERMITTENT) {
      return res.status(403).json({
        message: "Apenas Administradores e Líderes podem criar vagas",
      });
    }

    const creatorUser = await User.findById(creator.userId);
    if (!creatorUser) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    const newVacancy = new Vacancy({
      title,
      description,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      value,
      totalSpots,
      creatorId: creator.userId,
      creatorName: creatorUser.name,
      status: VacancyStatus.OPEN,
    });

    await newVacancy.save();

    // Retornar com id como string
    const vacancyObject = newVacancy.toObject();
    res.status(201).json({
      id: newVacancy._id.toString(),
      title: vacancyObject.title,
      description: vacancyObject.description,
      startTime: vacancyObject.startTime,
      endTime: vacancyObject.endTime,
      value: vacancyObject.value,
      totalSpots: vacancyObject.totalSpots,
      filledSpots: 0,
      status: vacancyObject.status,
      creatorId: vacancyObject.creatorId,
      creatorName: vacancyObject.creatorName,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteVacancy = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const vacancy = await Vacancy.findById(id);
    if (!vacancy) {
      return res.status(404).json({ message: "Vaga não encontrada" });
    }

    // Validação: apenas ADMIN pode deletar qualquer vaga, LEADER apenas suas vagas
    if (
      user.role === UserRole.LEADER &&
      String(vacancy.creatorId) !== String(user.userId)
    ) {
      return res
        .status(403)
        .json({ message: "Você só pode deletar vagas que criou" });
    }

    if (user.role === UserRole.INTERMITTENT) {
      return res
        .status(403)
        .json({ message: "Você não tem permissão para deletar vagas" });
    }

    // Cancelar todas as candidaturas associadas
    await Application.updateMany(
      { vacancyId: id },
      { status: ApplicationStatus.CANCELED },
    );

    await Vacancy.findByIdAndDelete(id);
    res.json({ message: "Vaga deletada com sucesso" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateVacancy = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, startTime, endTime, value, totalSpots } =
      req.body;
    const user = req.user;

    const vacancy = await Vacancy.findById(id);
    if (!vacancy) {
      return res.status(404).json({ message: "Vaga não encontrada" });
    }

    // Validação: apenas ADMIN pode editar qualquer vaga, LEADER apenas suas vagas
    if (
      user.role === UserRole.LEADER &&
      String(vacancy.creatorId) !== String(user.userId)
    ) {
      return res
        .status(403)
        .json({ message: "Você só pode editar vagas que criou" });
    }

    if (user.role === UserRole.INTERMITTENT) {
      return res
        .status(403)
        .json({ message: "Você não tem permissão para editar vagas" });
    }

    // Atualizar vaga
    const updatedVacancy = await Vacancy.findByIdAndUpdate(
      id,
      {
        title,
        description,
        startTime,
        endTime,
        value,
        totalSpots,
      },
      { new: true },
    );

    res.json({
      id: updatedVacancy!._id.toString(),
      title: updatedVacancy!.title,
      description: updatedVacancy!.description,
      startTime: updatedVacancy!.startTime,
      endTime: updatedVacancy!.endTime,
      value: updatedVacancy!.value,
      totalSpots: updatedVacancy!.totalSpots,
      creatorId: updatedVacancy!.creatorId,
      creatorName: updatedVacancy!.creatorName,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyVacancies = async (req: AuthRequest, res: Response) => {
  try {
    const vacancies = await Vacancy.find({ creatorId: req.userId }).sort({
      startTime: 1,
    });
    res.json(vacancies);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getApplicationsForVacancy = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const { vacancyId } = req.params;

    // Mostrar todas as candidaturas (exceto canceladas pelo usuário)
    // Isso inclui aprovadas, rejeitadas e pendentes para histórico completo
    const applications = await Application.find({
      vacancyId,
      status: { $ne: ApplicationStatus.CANCELED },
    }).sort({ createdAt: -1 }); // Mais recentes primeiro

    // Normalize _id to id for frontend
    const normalized = applications.map((app: any) => ({
      id: app._id.toString(),
      vacancyId: app.vacancyId.toString(),
      userId: app.userId.toString(),
      userName: app.userName,
      userPhone: app.userPhone,
      userProfilePic: app.userProfilePic,
      status: app.status,
      insertedManually: app.insertedManually,
      insertedByUserName: app.insertedByUserName,
      processedByUserName: app.processedByUserName,
      processedAt: app.processedAt,
      createdAt: app.createdAt,
    }));

    res.json(normalized);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateApplicationStatus = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const requester = req.user;

    // Only ADMIN and LEADER can update application status
    if (requester.role === UserRole.INTERMITTENT) {
      return res.status(403).json({
        message:
          "Apenas Administradores e Líderes podem alterar status de candidaturas",
      });
    }

    // Find the application
    const app = await Application.findById(id);
    if (!app) {
      return res.status(404).json({ message: "Candidatura não encontrada" });
    }

    // Find the vacancy to check permissions
    const vacancy = await Vacancy.findById(app.vacancyId);
    if (!vacancy) {
      return res.status(404).json({ message: "Vaga não encontrada" });
    }

    // LEADER can only update applications in their own vacancies
    if (requester.role === UserRole.LEADER) {
      const creatorIdStr = String(vacancy.creatorId);
      const requesterIdStr = String(requester.userId);

      if (creatorIdStr !== requesterIdStr) {
        return res.status(403).json({
          message: "Você só pode alterar candidaturas em vagas que você criou",
        });
      }
    }

    // Update the application with status and history
    const updatedApp = await Application.findByIdAndUpdate(
      id,
      {
        status,
        processedByUserId: requester.userId,
        processedByUserName: requester.name,
        processedAt: new Date(),
      },
      { new: true },
    );

    if (!updatedApp) {
      return res.status(404).json({ message: "Erro ao atualizar candidatura" });
    }

    // Normalize response for frontend
    res.json({
      id: updatedApp._id.toString(),
      vacancyId: updatedApp.vacancyId.toString(),
      userId: updatedApp.userId.toString(),
      userName: updatedApp.userName,
      userPhone: updatedApp.userPhone,
      userProfilePic: updatedApp.userProfilePic,
      status: updatedApp.status,
      insertedManually: updatedApp.insertedManually,
      insertedByUserName: updatedApp.insertedByUserName,
      createdAt: updatedApp.createdAt,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Novo endpoint: adicionar usuário manualmente a uma vaga
export const addUserToVacancy = async (req: AuthRequest, res: Response) => {
  try {
    const { vacancyId, userId } = req.body;
    const requester = req.user;

    // Validação: apenas ADMIN e LEADER podem adicionar usuários manualmente
    if (requester.role === UserRole.INTERMITTENT) {
      return res.status(403).json({
        message:
          "Apenas Administradores e Líderes podem adicionar usuários manualmente",
      });
    }

    // Buscar a vaga
    const vacancy = await Vacancy.findById(vacancyId);
    if (!vacancy) {
      return res.status(404).json({ message: "Vaga não encontrada" });
    }

    // Tanto ADMIN quanto LEADER podem adicionar em qualquer vaga (removida restrição)

    // Buscar o usuário a ser adicionado
    const userToAdd = await User.findById(userId);
    if (!userToAdd) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    // Apenas intermitentes podem ser adicionados manualmente
    if (userToAdd.role !== UserRole.INTERMITTENT) {
      return res.status(400).json({
        message: "Apenas usuários do tipo Intermitente podem ser adicionados",
      });
    }

    // Verificar se o usuário já está candidatado a esta vaga
    const existingApp = await Application.findOne({
      vacancyId,
      userId,
    });

    if (existingApp) {
      return res.status(400).json({
        message: "Este usuário já está candidatado para esta vaga",
      });
    }

    // Criar a candidatura com status APPROVED (manual) e já marcada como inserida manualmente
    const newApplication = new Application({
      vacancyId,
      userId,
      userName: userToAdd.name,
      userPhone: userToAdd.phone,
      userProfilePic: userToAdd.profilePic,
      status: ApplicationStatus.APPROVED,
      insertedManually: true,
      insertedByUserId: requester.userId,
      insertedByUserName: requester.name || "Admin",
    });

    await newApplication.save();

    res.status(201).json({
      message: "Usuário adicionado à vaga com sucesso",
      application: newApplication,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Novo endpoint: obter vagas expiradas
export const getExpiredVacancies = async (req: AuthRequest, res: Response) => {
  try {
    const now = new Date();
    const vacancies = await Vacancy.find({ endTime: { $lt: now } }).sort({
      endTime: -1,
    });

    const vacanciesWithCounts = await Promise.all(
      vacancies.map(async (v: any) => {
        const count = await Application.countDocuments({
          vacancyId: v._id,
          status: {
            $in: [ApplicationStatus.APPROVED, ApplicationStatus.PENDING],
          },
        });
        return {
          id: v._id.toString(),
          title: v.title,
          description: v.description,
          startTime: v.startTime,
          endTime: v.endTime,
          value: v.value,
          totalSpots: v.totalSpots,
          creatorId: v.creatorId,
          creatorName: v.creatorName,
          filledSpots: count,
          status: VacancyStatus.EXPIRED,
        };
      }),
    );

    res.json(vacanciesWithCounts);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
