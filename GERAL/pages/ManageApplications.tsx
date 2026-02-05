import React, { useEffect, useState } from "react";
import {
  Application,
  ApplicationStatus,
  Vacancy,
  User,
  UserRole,
} from "../types";
import {
  apiGetVacancies,
  apiGetApplicationsForVacancy,
  apiUpdateApplicationStatus,
  apiCreateVacancy,
  apiUpdateVacancy,
  apiDeleteVacancy,
  apiGetUsers,
  apiAddUserToVacancy,
  apiRemoveUserFromVacancy,
} from "../src/services/api";
import {
  Check,
  X,
  Plus,
  MessageCircle,
  UserCircle,
  Trash2,
  UserPlus,
  Download,
  Clock,
  Users,
  Calendar,
  Info,
} from "lucide-react";
import { Badge } from "../components/Badge";

interface ManageApplicationsProps {
  user: User;
}

// Tooltip component for hover info
const Tooltip: React.FC<{ text: string; children: React.ReactNode }> = ({
  text,
  children,
}) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const [position, setPosition] = React.useState({ top: 0, left: 0 });
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const elementRef = React.useRef<HTMLDivElement>(null);

  const handleMouseMove = () => {
    if (elementRef.current) {
      const rect = elementRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const topY = rect.top - 40; // ~1.3cm acima do elemento

      setPosition({
        left: centerX,
        top: topY,
      });
    }
  };

  const handleMouseEnter = () => {
    handleMouseMove();
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, 1000); // 1 segundo de delay
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  return (
    <div
      ref={elementRef}
      className="relative inline-flex items-center"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
    >
      {children}
      {isVisible && (
        <div
          className="fixed max-w-xs px-3 py-1.5 bg-slate-900 dark:bg-slate-700 text-white text-xs rounded-lg whitespace-normal z-50 shadow-lg pointer-events-none break-words"
          style={{
            left: `${position.left}px`,
            top: `${position.top}px`,
            transform: "translateX(-50%)",
            maxWidth: "250px",
          }}
        >
          {text}
        </div>
      )}
    </div>
  );
};

// Duration options (4h to 12h)
const DURATION_OPTIONS = [
  { value: 4, label: "4 horas" },
  { value: 5, label: "5 horas" },
  { value: 6, label: "6 horas" },
  { value: 7, label: "7 horas" },
  { value: 8, label: "8 horas" },
  { value: 9, label: "9 horas" },
  { value: 10, label: "10 horas" },
  { value: 11, label: "11 horas" },
  { value: 12, label: "12 horas" },
];

export const ManageApplications: React.FC<ManageApplicationsProps> = ({
  user,
}) => {
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [selectedVacancy, setSelectedVacancy] = useState<number | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loadingApps, setLoadingApps] = useState(false);
  const [allUsers, setAllUsers] = useState<User[]>([]);

  // Create Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newVacancy, setNewVacancy] = useState({
    title: "",
    description: "",
    startTime: "",
    duration: 8, // Default 8 hours
    value: 0,
    totalSpots: 1,
  });

  // Add User Modal State
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [selectedUserToAdd, setSelectedUserToAdd] = useState<string>("");
  const [addingUser, setAddingUser] = useState(false);

  // Edit Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingVacancy, setEditingVacancy] = useState<Vacancy | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    startTime: "",
    duration: 8,
    value: 0,
    totalSpots: 1,
  });

  // Notifications
  const [notification, setNotification] = useState<{
    msg: string;
    type: "success" | "info" | "error";
  } | null>(null);

  useEffect(() => {
    loadVacancies();
    loadUsers();
  }, []);

  useEffect(() => {
    if (selectedVacancy) {
      loadApplications(selectedVacancy);
    } else {
      setApplications([]);
    }
  }, [selectedVacancy]);

  const loadVacancies = async () => {
    try {
      const data = await apiGetVacancies();
      // LEADERS and ADMINS see ALL vacancies
      // INTERMITTENT would never access this, but just in case
      setVacancies(data);
      if (data.length > 0 && !selectedVacancy) {
        setSelectedVacancy(data[0].id);
      }
    } catch (error: any) {
      console.error("Erro ao carregar vagas:", error);
      showNotification("Erro ao carregar vagas", "error");
      setVacancies([]);
    }
  };

  const loadUsers = async () => {
    try {
      const data = await apiGetUsers();
      // Filter only INTERMITTENT users
      const intermittentUsers = data.filter(
        (u: any) => u.role === UserRole.INTERMITTENT,
      );
      setAllUsers(intermittentUsers);
    } catch (error: any) {
      console.error("Erro ao carregar usuários:", error);
    }
  };

  const loadApplications = async (id: number) => {
    setLoadingApps(true);
    try {
      const apps = await apiGetApplicationsForVacancy(id);
      setApplications(apps);
    } catch (error: any) {
      console.error("Erro ao carregar aplicações:", error);
    }
    setLoadingApps(false);
  };

  const showNotification = (
    msg: string,
    type: "success" | "info" | "error",
  ) => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleStatusChange = async (
    appId: number,
    status: ApplicationStatus,
  ) => {
    try {
      await apiUpdateApplicationStatus(appId.toString(), status);

      // Refresh list locally
      setApplications((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, status } : a)),
      );

      // Refresh vacancies to update counters
      loadVacancies();

      if (status === ApplicationStatus.APPROVED) {
        showNotification("Candidato APROVADO com sucesso!", "success");
      } else if (status === ApplicationStatus.REJECTED) {
        showNotification("Candidato rejeitado", "info");
      }
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Erro ao atualizar status");
    }
  };

  const handleRemoveUser = async (appId: number, userName: string) => {
    if (
      !window.confirm(
        `Tem certeza que deseja remover "${userName}" desta vaga?`,
      )
    ) {
      return;
    }

    try {
      await apiRemoveUserFromVacancy(appId.toString());
      setApplications((prev) => prev.filter((a) => a.id !== appId));
      loadVacancies();
      showNotification(`${userName} removido da vaga`, "success");
    } catch (error: any) {
      alert(error.message || "Erro ao remover usuário");
    }
  };

  const handleCreateVacancy = async (e: React.FormEvent) => {
    e.preventDefault();

    // Calculate end time based on duration
    const startDate = new Date(newVacancy.startTime);
    const endDate = new Date(
      startDate.getTime() + newVacancy.duration * 60 * 60 * 1000,
    );
    const endTime = endDate.toISOString();

    try {
      await apiCreateVacancy({
        title: newVacancy.title,
        description: newVacancy.description,
        startTime: newVacancy.startTime,
        endTime: endTime,
        duration: newVacancy.duration,
        value: newVacancy.value,
        totalSpots: newVacancy.totalSpots,
        creatorId: user.id,
      });
      setShowCreateModal(false);
      setNewVacancy({
        title: "",
        description: "",
        startTime: "",
        duration: 8,
        value: 0,
        totalSpots: 1,
      });
      loadVacancies();
      showNotification("Vaga publicada com sucesso!", "success");
    } catch (err: any) {
      alert(err.message || "Erro ao criar vaga");
    }
  };

  const handleEditVacancy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVacancy) return;

    // Calculate end time based on duration
    const startDate = new Date(editForm.startTime);
    const endDate = new Date(
      startDate.getTime() + editForm.duration * 60 * 60 * 1000,
    );
    const endTime = endDate.toISOString();

    try {
      await apiUpdateVacancy(editingVacancy.id, {
        title: editForm.title,
        description: editForm.description,
        startTime: editForm.startTime,
        endTime: endTime,
        duration: editForm.duration,
        value: editForm.value,
        totalSpots: editForm.totalSpots,
      });
      setShowEditModal(false);
      setEditingVacancy(null);
      loadVacancies();
      showNotification("Vaga atualizada com sucesso!", "success");
    } catch (err: any) {
      alert(err.message || "Erro ao atualizar vaga");
    }
  };

  const openEditModal = (vacancy: Vacancy) => {
    setEditingVacancy(vacancy);

    // Calculate duration from startTime and endTime
    const start = new Date(vacancy.startTime);
    const end = new Date(vacancy.endTime);
    const durationHours = Math.round(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60),
    );

    setEditForm({
      title: vacancy.title,
      description: vacancy.description,
      startTime: new Date(vacancy.startTime).toISOString().slice(0, 16),
      duration: durationHours,
      value: vacancy.value,
      totalSpots: vacancy.totalSpots,
    });
    setShowEditModal(true);
  };

  const handleAddUserToVacancy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserToAdd || !selectedVacancy) {
      alert("Por favor selecione um usuário e uma vaga");
      return;
    }

    setAddingUser(true);
    try {
      await apiAddUserToVacancy(selectedVacancy.toString(), selectedUserToAdd);
      loadApplications(selectedVacancy);
      setShowAddUserModal(false);
      setSelectedUserToAdd("");
      showNotification("Usuário adicionado à vaga!", "success");
    } catch (err: any) {
      alert(err.message || "Erro ao adicionar usuário");
    } finally {
      setAddingUser(false);
    }
  };

  const handleDeleteVacancy = async (vacancyId: number) => {
    if (
      !window.confirm(
        "Tem certeza que deseja deletar esta vaga? Todas as candidaturas serão canceladas.",
      )
    ) {
      return;
    }

    try {
      await apiDeleteVacancy(vacancyId);
      loadVacancies();
      setSelectedVacancy(null);
      showNotification("Vaga deletada com sucesso!", "success");
    } catch (error: any) {
      alert(error.message || "Erro ao deletar vaga");
    }
  };

  // Export CSV function
  const handleExportCSV = () => {
    if (vacancies.length === 0) {
      showNotification("Nenhuma vaga para exportar", "info");
      return;
    }

    // Build CSV content
    const headers = [
      "ID",
      "Nome da Vaga",
      "Data",
      "Horário Início",
      "Duração (h)",
      "Horário Fim",
      "Valor (R$)",
      "Vagas Totais",
      "Vagas Preenchidas",
      "Status",
      "Candidatos Aprovados",
      "Candidatos Pendentes",
    ];

    const rows = vacancies.map((v) => {
      const startDate = new Date(v.startTime);
      const endDate = new Date(v.endTime);
      const durationHours = Math.round(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60),
      );

      return [
        v.id,
        `"${v.title}"`,
        startDate.toLocaleDateString("pt-BR"),
        startDate.toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        durationHours,
        endDate.toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        v.value,
        v.totalSpots,
        v.filledSpots,
        v.status,
        v.approvedCount || 0,
        v.pendingCount || 0,
      ];
    });

    const csvContent =
      "\uFEFF" + // BOM for Excel UTF-8
      headers.join(";") +
      "\n" +
      rows.map((row) => row.join(";")).join("\n");

    // Download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `vagas_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    showNotification("CSV exportado com sucesso!", "success");
  };

  // Helper to format WhatsApp link
  const getWhatsAppLink = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, "");
    return `https://wa.me/${cleanPhone}`;
  };

  // Helper to check if vacancy is expired
  const isVacancyExpired = (vacancy: any): boolean => {
    return new Date() > new Date(vacancy.endTime);
  };

  // Helper to get users not already applied
  const getAvailableUsersForVacancy = (): User[] => {
    const appliedUserIds = applications.map((app) => app.userId);
    return allUsers.filter((u) => !appliedUserIds.includes(u.id));
  };

  // Helper to calculate duration from vacancy
  const getVacancyDuration = (vacancy: Vacancy): number => {
    const start = new Date(vacancy.startTime);
    const end = new Date(vacancy.endTime);
    return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60));
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-[calc(100vh-140px)]">
      {/* Show message if user doesn't have permission */}
      {user.role === UserRole.INTERMITTENT && (
        <div className="w-full bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-4 mb-4">
          <p className="text-orange-800 dark:text-orange-300 text-sm font-medium">
            ⚠️ Apenas Administradores e Líderes podem gerenciar e criar vagas.
          </p>
        </div>
      )}

      {/* Sidebar List of Vacancies */}
      <div className="w-full lg:w-1/3 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col transition-colors">
        <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 dark:text-white">
            Minhas Vagas
          </h3>
          <div className="flex items-center gap-2">
            <Tooltip text="Exportar todas as vagas para CSV/Excel">
              <button
                onClick={handleExportCSV}
                className="p-2 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors"
              >
                <Download size={18} />
              </button>
            </Tooltip>
            <Tooltip text="Criar nova vaga">
              <button
                onClick={() => setShowCreateModal(true)}
                className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
              >
                <Plus size={18} />
              </button>
            </Tooltip>
          </div>
        </div>
        <div className="overflow-y-auto flex-1 p-2 space-y-2">
          {vacancies.length === 0 && (
            <p className="text-center text-slate-400 mt-10">
              Nenhuma vaga criada.
            </p>
          )}
          {vacancies.map((v) => (
            <div
              key={v.id}
              onClick={() => setSelectedVacancy(v.id)}
              className={`p-4 rounded-lg cursor-pointer transition-all border group ${
                selectedVacancy === v.id
                  ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 shadow-sm"
                  : "bg-white dark:bg-slate-800 border-transparent hover:bg-slate-50 dark:hover:bg-slate-700/50"
              } ${isVacancyExpired(v) ? "opacity-60" : ""}`}
            >
              <div className="flex justify-between mb-1">
                <div className="flex-1">
                  <Tooltip text="Nome/título da vaga">
                    <span
                      className={`font-semibold ${selectedVacancy === v.id ? "text-blue-700 dark:text-blue-400" : "text-slate-700 dark:text-slate-200"}`}
                    >
                      {v.title}
                    </span>
                  </Tooltip>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    <Tooltip text="Quem criou esta vaga">
                      <span>{v.creatorName}</span>
                    </Tooltip>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Tooltip text="Editar vaga">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(v);
                      }}
                      className="p-1 text-blue-500 opacity-0 group-hover:opacity-100 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-all"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                    </button>
                  </Tooltip>
                  <Tooltip text="Deletar esta vaga">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteVacancy(v.id);
                      }}
                      className="p-1 text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </Tooltip>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mb-2">
                <Tooltip text="Data e horário de início">
                  <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
                    <Calendar size={12} />
                    {new Date(v.startTime).toLocaleDateString()}
                  </span>
                </Tooltip>
                <Tooltip text="Horário de início do trabalho">
                  <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
                    <Clock size={12} />
                    {new Date(v.startTime).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </Tooltip>
                <Tooltip text="Duração total do trabalho">
                  <span className="inline-flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30 px-2 py-1 rounded">
                    <Clock size={12} />
                    {getVacancyDuration(v)}h
                  </span>
                </Tooltip>
              </div>
              <div className="flex justify-between items-center">
                <Tooltip text="Vagas preenchidas / total de vagas">
                  <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                    <Users size={12} />
                    {v.filledSpots} / {v.totalSpots}
                  </span>
                </Tooltip>
                <Tooltip text="Status atual da vaga">
                  <span>
                    <Badge status={v.status} />
                  </span>
                </Tooltip>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Area: Candidates */}
      <div className="w-full lg:w-2/3 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col relative overflow-hidden transition-colors">
        {/* Toast Notification */}
        {notification && (
          <div
            className={`absolute top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium animate-bounce ${
              notification.type === "success"
                ? "bg-green-600 text-white"
                : notification.type === "error"
                  ? "bg-red-600 text-white"
                  : "bg-blue-600 text-white"
            }`}
          >
            {notification.msg}
          </div>
        )}

        <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 transition-colors flex justify-between items-center">
          <h3 className="font-bold text-slate-800 dark:text-white text-lg">
            {selectedVacancy
              ? `Candidatos: ${vacancies.find((v) => v.id === selectedVacancy)?.title}`
              : "Selecione uma vaga para ver os candidatos"}
          </h3>
          {selectedVacancy &&
            !isVacancyExpired(
              vacancies.find((v) => v.id === selectedVacancy)!,
            ) && (
              <Tooltip text="Adicionar intermitente manualmente à vaga">
                <button
                  onClick={() => setShowAddUserModal(true)}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors"
                >
                  <UserPlus size={16} />
                  Adicionar Usuário
                </button>
              </Tooltip>
            )}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loadingApps ? (
            <div className="flex justify-center mt-10 text-slate-400">
              Carregando candidatos...
            </div>
          ) : !selectedVacancy ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <UsersIconLarge />
              <p className="mt-4">Selecione uma vaga à esquerda.</p>
            </div>
          ) : applications.length === 0 ? (
            <p className="text-center text-slate-400 mt-10">
              Nenhum candidato para esta vaga ainda.
            </p>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                  <th className="pb-3 pl-2">
                    <Tooltip text="Nome e foto do candidato">
                      <span className="inline-flex items-center gap-1">
                        Candidato <Info size={12} />
                      </span>
                    </Tooltip>
                  </th>
                  <th className="pb-3">
                    <Tooltip text="Número de WhatsApp para contato">
                      <span className="inline-flex items-center gap-1">
                        WhatsApp <Info size={12} />
                      </span>
                    </Tooltip>
                  </th>
                  <th className="pb-3">
                    <Tooltip text="Data em que o candidato se inscreveu">
                      <span className="inline-flex items-center gap-1">
                        Inscrição <Info size={12} />
                      </span>
                    </Tooltip>
                  </th>
                  <th className="pb-3 text-center">
                    <Tooltip text="Status atual da candidatura">
                      <span className="inline-flex items-center gap-1">
                        Status <Info size={12} />
                      </span>
                    </Tooltip>
                  </th>
                  <th className="pb-3">
                    <Tooltip text="Líder/Admin que aprovou ou rejeitou">
                      <span className="inline-flex items-center gap-1">
                        Processado por <Info size={12} />
                      </span>
                    </Tooltip>
                  </th>
                  <th className="pb-3 text-right pr-2">
                    <Tooltip text="Aprovar, rejeitar ou remover candidato">
                      <span className="inline-flex items-center gap-1">
                        Ações <Info size={12} />
                      </span>
                    </Tooltip>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {applications.map((app) => (
                  <tr
                    key={app.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-700/50 group transition-colors"
                  >
                    <td className="py-4 pl-2 font-medium text-slate-700 dark:text-slate-200">
                      <div className="flex items-center gap-3">
                        {app.userProfilePic ? (
                          <img
                            src={app.userProfilePic}
                            alt={app.userName}
                            className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-600"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500">
                            <UserCircle size={20} />
                          </div>
                        )}
                        <div>
                          <span>{app.userName}</span>
                          {app.insertedManually && (
                            <Tooltip text="Este candidato foi adicionado manualmente pelo líder/admin">
                              <p className="text-xs text-blue-600 dark:text-blue-400">
                                ➕ Adicionado por: {app.insertedByUserName}
                              </p>
                            </Tooltip>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <Tooltip text="Clique para abrir conversa no WhatsApp">
                        <a
                          href={getWhatsAppLink(app.userPhone)}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors text-sm font-medium"
                        >
                          <MessageCircle size={14} />
                          {app.userPhone}
                        </a>
                      </Tooltip>
                    </td>
                    <td className="py-4 text-slate-500 dark:text-slate-400 text-sm">
                      <Tooltip text="Data e hora da inscrição">
                        <span>
                          {new Date(app.createdAt).toLocaleDateString()} às{" "}
                          {new Date(app.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </Tooltip>
                    </td>
                    <td className="py-4 text-center">
                      <Tooltip
                        text={
                          app.status === ApplicationStatus.APPROVED
                            ? "Candidato aprovado para esta vaga"
                            : app.status === ApplicationStatus.PENDING
                              ? "Aguardando aprovação"
                              : app.status === ApplicationStatus.REJECTED
                                ? "Candidatura rejeitada"
                                : "Status da candidatura"
                        }
                      >
                        <span>
                          <Badge status={app.status} />
                        </span>
                      </Tooltip>
                    </td>
                    <td className="py-4 text-slate-500 dark:text-slate-400 text-sm">
                      {app.processedByUserName ? (
                        <Tooltip
                          text={`${
                            app.status === ApplicationStatus.APPROVED
                              ? "Aprovado"
                              : "Rejeitado"
                          } em ${new Date(app.processedAt!).toLocaleDateString()} às ${new Date(app.processedAt!).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`}
                        >
                          <span className="text-xs">
                            👤 {app.processedByUserName}
                          </span>
                        </Tooltip>
                      ) : (
                        <span className="text-xs text-slate-400">-</span>
                      )}
                    </td>
                    <td className="py-4 text-right pr-2">
                      <div className="flex justify-end gap-2">
                        {app.status === ApplicationStatus.PENDING && (
                          <>
                            <Tooltip text="Rejeitar candidatura">
                              <button
                                onClick={() =>
                                  handleStatusChange(
                                    app.id,
                                    ApplicationStatus.REJECTED,
                                  )
                                }
                                className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                              >
                                <X size={18} />
                              </button>
                            </Tooltip>
                            {vacancies.find((v) => v.id === selectedVacancy)!
                              .filledSpots <
                            vacancies.find((v) => v.id === selectedVacancy)!
                              .totalSpots ? (
                              <Tooltip text="Aprovar candidato">
                                <button
                                  onClick={() =>
                                    handleStatusChange(
                                      app.id,
                                      ApplicationStatus.APPROVED,
                                    )
                                  }
                                  className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded transition-colors"
                                >
                                  <Check size={18} />
                                </button>
                              </Tooltip>
                            ) : (
                              <Tooltip text="Todas as vagas já foram preenchidas">
                                <span className="text-xs text-slate-400 font-medium px-2">
                                  Lotado
                                </span>
                              </Tooltip>
                            )}
                          </>
                        )}
                        {app.status === ApplicationStatus.APPROVED && (
                          <Tooltip text="Candidato confirmado para esta vaga">
                            <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                              ✓ Confirmado
                            </span>
                          </Tooltip>
                        )}
                        {/* Remove button - always visible */}
                        <Tooltip text="Remover candidato desta vaga">
                          <button
                            onClick={() =>
                              handleRemoveUser(app.id, app.userName)
                            }
                            className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 size={16} />
                          </button>
                        </Tooltip>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal Create Vacancy */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md p-6 border dark:border-slate-700">
            <h3 className="text-xl font-bold mb-4 text-slate-800 dark:text-white">
              Nova Vaga
            </h3>
            <form onSubmit={handleCreateVacancy} className="space-y-4">
              <div>
                <Tooltip text="Nome ou título que aparecerá para os intermitentes">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 cursor-help">
                    Título da Vaga
                  </label>
                </Tooltip>
                <input
                  required
                  placeholder="Ex: Auxiliar de Eventos"
                  className="w-full mt-1 border rounded-lg p-2 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                  value={newVacancy.title}
                  onChange={(e) =>
                    setNewVacancy({ ...newVacancy, title: e.target.value })
                  }
                />
              </div>
              <div>
                <Tooltip text="Detalhes sobre o trabalho, local, requisitos, etc.">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 cursor-help">
                    Descrição
                  </label>
                </Tooltip>
                <textarea
                  required
                  placeholder="Descreva o trabalho, local, requisitos..."
                  className="w-full mt-1 border rounded-lg p-2 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                  rows={3}
                  value={newVacancy.description}
                  onChange={(e) =>
                    setNewVacancy({
                      ...newVacancy,
                      description: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Tooltip text="Data e horário em que o trabalho começa">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 cursor-help">
                      📅 Data e Horário Início
                    </label>
                  </Tooltip>
                  <input
                    type="datetime-local"
                    required
                    className="w-full mt-1 border rounded-lg p-2 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    value={newVacancy.startTime}
                    onChange={(e) =>
                      setNewVacancy({
                        ...newVacancy,
                        startTime: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Tooltip text="Quantas horas de trabalho (4 a 12 horas)">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 cursor-help">
                      ⏱️ Duração do Trabalho
                    </label>
                  </Tooltip>
                  <select
                    required
                    className="w-full mt-1 border rounded-lg p-2 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    value={newVacancy.duration}
                    onChange={(e) =>
                      setNewVacancy({
                        ...newVacancy,
                        duration: Number(e.target.value),
                      })
                    }
                  >
                    {DURATION_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {/* Show calculated end time */}
              {newVacancy.startTime && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    <strong>Horário de término calculado:</strong>{" "}
                    {new Date(
                      new Date(newVacancy.startTime).getTime() +
                        newVacancy.duration * 60 * 60 * 1000,
                    ).toLocaleString("pt-BR", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Tooltip text="Valor a ser pago ao intermitente">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 cursor-help">
                      💰 Valor (R$)
                    </label>
                  </Tooltip>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    placeholder="150.00"
                    className="w-full mt-1 border rounded-lg p-2 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    value={newVacancy.value}
                    onChange={(e) =>
                      setNewVacancy({
                        ...newVacancy,
                        value: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div>
                  <Tooltip text="Quantidade de pessoas necessárias para esta vaga">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 cursor-help">
                      👥 Qtd. Vagas
                    </label>
                  </Tooltip>
                  <input
                    type="number"
                    min="1"
                    required
                    className="w-full mt-1 border rounded-lg p-2 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    value={newVacancy.totalSpots}
                    onChange={(e) =>
                      setNewVacancy({
                        ...newVacancy,
                        totalSpots: Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Publicar Vaga
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Vacancy */}
      {showEditModal && editingVacancy && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 border dark:border-slate-700">
            <h3 className="text-xl font-bold mb-4 text-slate-800 dark:text-white">
              Editar Vaga
            </h3>
            <form onSubmit={handleEditVacancy} className="space-y-4">
              <div>
                <Tooltip text="Título que aparecerá na lista de vagas">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 cursor-help">
                    📋 Título
                  </label>
                </Tooltip>
                <input
                  type="text"
                  required
                  placeholder="Ex: Carregamento de caminhão"
                  className="w-full mt-1 border rounded-lg p-2 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                  value={editForm.title}
                  onChange={(e) =>
                    setEditForm({ ...editForm, title: e.target.value })
                  }
                />
              </div>
              <div>
                <Tooltip text="Detalhes e instruções sobre o trabalho">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 cursor-help">
                    📝 Descrição
                  </label>
                </Tooltip>
                <textarea
                  required
                  rows={3}
                  placeholder="Descreva as atividades e requisitos..."
                  className="w-full mt-1 border rounded-lg p-2 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm({ ...editForm, description: e.target.value })
                  }
                ></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Tooltip text="Data e horário de início do trabalho">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 cursor-help">
                      📅 Início
                    </label>
                  </Tooltip>
                  <input
                    type="datetime-local"
                    required
                    className="w-full mt-1 border rounded-lg p-2 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    value={editForm.startTime}
                    onChange={(e) =>
                      setEditForm({ ...editForm, startTime: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Tooltip text="Quanto tempo durará o trabalho (em horas)">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 cursor-help">
                      ⏱️ Duração
                    </label>
                  </Tooltip>
                  <select
                    required
                    className="w-full mt-1 border rounded-lg p-2 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    value={editForm.duration}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        duration: Number(e.target.value),
                      })
                    }
                  >
                    {DURATION_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Tooltip text="Valor que será pago por este trabalho">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 cursor-help">
                      💰 Valor (R$)
                    </label>
                  </Tooltip>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    placeholder="150.00"
                    className="w-full mt-1 border rounded-lg p-2 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    value={editForm.value}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        value: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div>
                  <Tooltip text="Quantidade de pessoas necessárias para esta vaga">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 cursor-help">
                      👥 Qtd. Vagas
                    </label>
                  </Tooltip>
                  <input
                    type="number"
                    min="1"
                    required
                    className="w-full mt-1 border rounded-lg p-2 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    value={editForm.totalSpots}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        totalSpots: Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingVacancy(null);
                  }}
                  className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Add User to Vacancy */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md p-6 border dark:border-slate-700">
            <h3 className="text-xl font-bold mb-4 text-slate-800 dark:text-white">
              Adicionar Usuário à Vaga
            </h3>
            <form onSubmit={handleAddUserToVacancy} className="space-y-4">
              <div>
                <Tooltip text="Selecione um intermitente para adicionar diretamente à vaga">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 cursor-help">
                    Selecione um Intermitente
                  </label>
                </Tooltip>
                <select
                  required
                  value={selectedUserToAdd}
                  onChange={(e) => setSelectedUserToAdd(e.target.value)}
                  className="w-full mt-1 border rounded-lg p-2 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                >
                  <option value="">-- Escolha um usuário --</option>
                  {getAvailableUsersForVacancy().map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.email})
                    </option>
                  ))}
                </select>
              </div>
              {getAvailableUsersForVacancy().length === 0 && (
                <p className="text-sm text-orange-600 dark:text-orange-400">
                  Todos os usuários disponíveis já estão candidatados a esta
                  vaga.
                </p>
              )}
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddUserModal(false);
                    setSelectedUserToAdd("");
                  }}
                  className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={addingUser || !selectedUserToAdd}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {addingUser ? "Adicionando..." : "Adicionar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const UsersIconLarge = () => (
  <svg
    width="64"
    height="64"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-slate-300 dark:text-slate-600"
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
