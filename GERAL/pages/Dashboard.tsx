import React, { useEffect, useState } from "react";
import {
  User,
  Vacancy,
  VacancyStatus,
  Language,
  Application,
  UserRole,
} from "../types";
import {
  apiGetVacancies,
  apiApplyToVacancy,
  apiGetMyApplications,
  apiDeleteVacancy,
  apiCreateVacancy,
} from "../src/services/api";
import {
  Calendar,
  DollarSign,
  Clock,
  Users,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Briefcase,
  History,
  Sparkles,
  Trash2,
  Plus,
} from "lucide-react";
import { getTranslation } from "../translations";

interface DashboardProps {
  user: User;
  currentLang: Language;
  onNavigate: (page: string) => void;
}

type Tab = "available" | "expired";

export const Dashboard: React.FC<DashboardProps> = ({
  user,
  currentLang,
  onNavigate,
}) => {
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [myApplications, setMyApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("available");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creatingVacancy, setCreatingVacancy] = useState(false);
  const [newVacancy, setNewVacancy] = useState({
    title: "",
    description: "",
    startTime: "",
    duration: 8,
    value: 0,
    totalSpots: 1,
  });

  const t = getTranslation(currentLang);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    const data = await apiGetVacancies();
    const myApps = await apiGetMyApplications();

    setMyApplications(
      myApps.filter((a: any) => a.status !== ("cancelado_pelo_usuario" as any)),
    );

    // Initial fetch gets all. Filtering happens in Render for this specific UI requirement.
    // In a real API, we would pass ?expired=true/false
    setVacancies(data);
    setLoading(false);
  };

  const handleApply = async (vacancyId: number) => {
    // Validar se é ADMIN ou LEADER
    if (user.role === UserRole.ADMIN) {
      alert("Você não pode se candidatar a vagas, visto que você é um Admin.");
      return;
    }

    if (user.role === UserRole.LEADER) {
      alert("Você não pode se candidatar a vagas, visto que você é um Líder.");
      return;
    }

    setApplying(vacancyId);
    try {
      await apiApplyToVacancy(vacancyId);
      onNavigate("my-applications");
    } catch (error: any) {
      if (error.message === "PROFILE_INCOMPLETE") {
        alert(t.completeProfileFirst);
        onNavigate("profile");
      } else {
        alert(error.message);
      }
    } finally {
      setApplying(null);
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
      loadData();
    } catch (error: any) {
      alert(error.message || "Erro ao deletar vaga");
    }
  };

  const handleCreateVacancy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !newVacancy.title ||
      !newVacancy.description ||
      !newVacancy.startTime ||
      !newVacancy.duration
    ) {
      alert("Por favor, preencha todos os campos.");
      return;
    }

    setCreatingVacancy(true);
    try {
      // Calculate endTime from startTime + duration
      const startDate = new Date(newVacancy.startTime);
      const endDate = new Date(
        startDate.getTime() + newVacancy.duration * 60 * 60 * 1000,
      );
      const endTimeIso = endDate.toISOString().slice(0, 16);

      await apiCreateVacancy({
        title: newVacancy.title,
        description: newVacancy.description,
        startTime: newVacancy.startTime,
        endTime: endTimeIso,
        value: newVacancy.value,
        totalSpots: newVacancy.totalSpots,
      });
      setNewVacancy({
        title: "",
        description: "",
        startTime: "",
        duration: 8,
        value: 0,
        totalSpots: 1,
      });
      setShowCreateModal(false);
      loadData();
      alert("Vaga criada com sucesso!");
    } catch (error: any) {
      alert(error.message || "Erro ao criar vaga");
    } finally {
      setCreatingVacancy(false);
    }
  };
  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString(
      currentLang === "pt" ? "pt-BR" : "en-US",
      { day: "2-digit", month: "2-digit", year: "numeric" },
    );
  };

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString(
      currentLang === "pt" ? "pt-BR" : "en-US",
      { hour: "2-digit", minute: "2-digit" },
    );
  };

  const getUrgencyClass = (filled: number, total: number) => {
    const ratio = filled / total;
    if (ratio >= 0.8) return "from-red-500 to-red-600 shadow-red-500/20";
    if (ratio >= 0.5)
      return "from-orange-400 to-orange-500 shadow-orange-500/20";
    return "from-blue-500 to-blue-600 shadow-blue-500/20";
  };

  const getUrgencyText = (filled: number, total: number) => {
    const ratio = filled / total;
    if (ratio >= 0.8) return t.fewSpotsLeft;
    return null;
  };

  // --- Filtering Logic ---
  const now = new Date();

  const filteredVacancies = vacancies.filter((v) => {
    const startDate = new Date(v.startTime);
    const isExpired = startDate < now;

    // Basic Active/Expired Tab Logic
    if (activeTab === "available") {
      if (isExpired) return false; // Don't show old stuff in available
      if (v.status === VacancyStatus.CANCELED) return false;

      // Intermittent 14-day rule
      if (user.role === UserRole.INTERMITTENT) {
        const fourteenDaysFromNow = new Date();
        fourteenDaysFromNow.setDate(now.getDate() + 14);
        // Show if within 14 days OR if user has applied (keep visible)
        const isWithinWindow = startDate <= fourteenDaysFromNow;
        const isMyApplication = myApplications.some(
          (a) => a.vacancyId === v.id,
        );
        return isWithinWindow || isMyApplication;
      }
      return true;
    } else {
      // Expired Tab
      return isExpired;
    }
  });

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-slate-500 dark:text-slate-400">{t.loading}</p>
      </div>
    );

  return (
    <div>
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h3 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            {activeTab === "available" ? t.availableSpots : t.expiredSpots}
          </h3>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">
            {t.findOpportunities}
          </p>
        </div>
        {(user.role === UserRole.ADMIN || user.role === UserRole.LEADER) && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
          >
            <Plus size={18} />
            Criar Vaga
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b border-slate-200 dark:border-slate-700">
        <button
          onClick={() => setActiveTab("available")}
          className={`pb-3 px-1 font-medium text-sm flex items-center gap-2 transition-colors relative ${activeTab === "available" ? "text-blue-600 dark:text-blue-400" : "text-slate-500 hover:text-slate-700 dark:text-slate-400"}`}
        >
          <Sparkles size={16} />
          {t.availableSpots}
          {activeTab === "available" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-t-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab("expired")}
          className={`pb-3 px-1 font-medium text-sm flex items-center gap-2 transition-colors relative ${activeTab === "expired" ? "text-blue-600 dark:text-blue-400" : "text-slate-500 hover:text-slate-700 dark:text-slate-400"}`}
        >
          <History size={16} />
          {t.expiredSpots}
          {activeTab === "expired" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-t-full" />
          )}
        </button>
      </div>

      {filteredVacancies.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
          <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-full mb-4">
            <Briefcase className="text-slate-400" size={32} />
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            {t.noVacancies}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredVacancies.map((vacancy) => {
            const spotsLeft = vacancy.totalSpots - vacancy.filledSpots;
            const isCritical = vacancy.filledSpots / vacancy.totalSpots >= 0.8;

            // Check if user has applied to this specific vacancy
            const isApplied = myApplications.some(
              (a) => a.vacancyId === vacancy.id,
            );
            const isFull =
              vacancy.filledSpots >= vacancy.totalSpots && !isApplied;
            const isExpired = activeTab === "expired";
            const isAdminOrLeader =
              user.role === UserRole.ADMIN || user.role === UserRole.LEADER;

            return (
              <div
                key={vacancy.id}
                className={`group relative bg-white dark:bg-slate-900 rounded-2xl border p-0 transition-all duration-300 overflow-hidden flex flex-col ${isExpired ? "border-slate-100 dark:border-slate-800 opacity-75 grayscale-[0.5]" : "border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-black/50"}`}
              >
                <div className="p-5 pb-0 flex justify-between items-start group/header">
                  <div>
                    <h4 className="text-lg font-bold text-slate-800 dark:text-white leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {vacancy.title}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">
                      {t.createdBy}: {vacancy.creatorName}
                    </p>
                  </div>
                  <div className="flex gap-2 items-start">
                    {(user.role === UserRole.ADMIN ||
                      user.role === UserRole.LEADER) && (
                      <button
                        onClick={() => handleDeleteVacancy(vacancy.id)}
                        className="p-1.5 text-red-500 opacity-0 group-hover/header:opacity-100 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-all"
                        title="Deletar vaga"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                    <div>
                      {getUrgencyText(
                        vacancy.filledSpots,
                        vacancy.totalSpots,
                      ) &&
                        !isApplied &&
                        !isFull &&
                        !isExpired && (
                          <div className="flex items-center gap-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider animate-pulse">
                            <AlertCircle size={10} />
                            {t.fewSpotsLeft}
                          </div>
                        )}
                      {isApplied && (
                        <div className="flex items-center gap-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
                          <CheckCircle2 size={10} />
                          {t.alreadyApplied}
                        </div>
                      )}
                      {isExpired && (
                        <div className="flex items-center gap-1 bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
                          <History size={10} />
                          {t.expired}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-5 flex-1">
                  <p className="text-slate-600 dark:text-slate-300 text-sm mb-4 line-clamp-2 min-h-[40px]">
                    {vacancy.description}
                  </p>

                  <div className="space-y-2.5">
                    <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                      <Calendar
                        size={16}
                        className="mr-2.5 text-slate-400 dark:text-slate-500"
                      />
                      <span className="font-medium">
                        {formatDate(vacancy.startTime)}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                      <Clock
                        size={16}
                        className="mr-2.5 text-slate-400 dark:text-slate-500"
                      />
                      <span>
                        {formatTime(vacancy.startTime)} -{" "}
                        {formatTime(vacancy.endTime)}
                      </span>
                    </div>

                    <div className="flex items-center mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-3 py-1 rounded-lg text-sm font-bold flex items-center">
                        <DollarSign size={14} className="mr-1" />
                        R$ {vacancy.value.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-5 py-2">
                  <div className="flex justify-between text-xs mb-1 font-medium">
                    <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Users size={12} /> {t.spots}
                    </span>
                    <span
                      className={
                        isCritical && !isFull && !isExpired
                          ? "text-red-500"
                          : "text-slate-700 dark:text-slate-300"
                      }
                    >
                      {isFull ? t.full : `${spotsLeft} ${t.spotsLeft}`}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isFull || isExpired
                          ? "bg-slate-300 dark:bg-slate-700"
                          : isCritical
                            ? "bg-red-500"
                            : vacancy.filledSpots / vacancy.totalSpots > 0.5
                              ? "bg-orange-400"
                              : "bg-blue-500"
                      }`}
                      style={{
                        width: `${(vacancy.filledSpots / vacancy.totalSpots) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div className="p-5 pt-2 mt-auto">
                  <button
                    onClick={() =>
                      !isApplied &&
                      !isFull &&
                      !isExpired &&
                      !isAdminOrLeader &&
                      handleApply(vacancy.id)
                    }
                    disabled={
                      applying === vacancy.id ||
                      isApplied ||
                      isFull ||
                      isExpired ||
                      isAdminOrLeader
                    }
                    className={`
                    w-full py-3 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center
                    ${
                      isAdminOrLeader
                        ? "bg-amber-50 text-amber-600 cursor-not-allowed dark:bg-amber-900/20 dark:text-amber-400"
                        : isApplied
                          ? "bg-green-600 text-white cursor-not-allowed opacity-90"
                          : isFull || isExpired
                            ? "bg-blue-100 text-blue-400 cursor-not-allowed dark:bg-slate-800 dark:text-slate-500"
                            : `bg-gradient-to-r text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95 active:translate-y-0 ${getUrgencyClass(vacancy.filledSpots, vacancy.totalSpots)}`
                    }
                  `}
                  >
                    {applying === vacancy.id ? (
                      <span className="flex items-center gap-2">
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />{" "}
                        {t.sending}
                      </span>
                    ) : isAdminOrLeader ? (
                      <span className="flex items-center gap-2">
                        {user.role === UserRole.ADMIN
                          ? "Admin não pode se candidatar"
                          : "Líder não pode se candidatar"}
                      </span>
                    ) : isApplied ? (
                      <span className="flex items-center gap-2">
                        <CheckCircle2 size={18} /> {t.spotGuaranteed}
                      </span>
                    ) : isFull ? (
                      <span className="flex items-center gap-2">{t.full}</span>
                    ) : isExpired ? (
                      <span className="flex items-center gap-2">
                        {t.expired}
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        {t.grabSpot}{" "}
                        <ArrowRight
                          size={16}
                          className="opacity-70 group-hover:translate-x-1 transition-transform"
                        />
                      </span>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Create Vacancy */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md p-6 border dark:border-slate-700">
            <h3 className="text-xl font-bold mb-4 text-slate-800 dark:text-white">
              Nova Vaga
            </h3>
            <form onSubmit={handleCreateVacancy} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Título
                </label>
                <input
                  required
                  className="w-full mt-1 border rounded-lg p-2 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                  value={newVacancy.title}
                  onChange={(e) =>
                    setNewVacancy({ ...newVacancy, title: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Descrição
                </label>
                <textarea
                  required
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
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Data e Horário Início
                  </label>
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
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Duração do Trabalho
                  </label>
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
                    <option value="4">4 horas</option>
                    <option value="5">5 horas</option>
                    <option value="6">6 horas</option>
                    <option value="7">7 horas</option>
                    <option value="8" selected>
                      8 horas
                    </option>
                    <option value="9">9 horas</option>
                    <option value="10">10 horas</option>
                    <option value="11">11 horas</option>
                    <option value="12">12 horas</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Valor (R$)
                  </label>
                  <input
                    type="number"
                    required
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
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Qtd. Vagas
                  </label>
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
                  disabled={creatingVacancy}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creatingVacancy ? "Publicando..." : "Publicar Vaga"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
