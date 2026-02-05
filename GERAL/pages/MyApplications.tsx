import React, { useEffect, useState } from "react";
import { User, Application, Language, ApplicationStatus } from "../types";
import {
  apiGetMyApplications,
  apiCancelApplication,
} from "../src/services/api";
import { getTranslation } from "../translations";
import {
  Calendar,
  Trash2,
  AlertTriangle,
  History,
  Clock,
  DollarSign,
  Lock,
} from "lucide-react";
import { Badge } from "../components/Badge";

interface MyApplicationsProps {
  user: User;
  currentLang: Language;
}

type Tab = "active" | "expired" | "history";

export const MyApplications: React.FC<MyApplicationsProps> = ({
  user,
  currentLang,
}) => {
  const [applications, setApplications] = useState<Application[]>([]);

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("active");
  const [canceling, setCanceling] = useState<string | null>(null);
  const t = getTranslation(currentLang);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const appsData = await apiGetMyApplications();
      setApplications(appsData);
    } catch (error: any) {
      console.error("Erro ao carregar dados:", error);
      setApplications([]);
    }
    setLoading(false);
  };

  const handleCancel = async (appId: string) => {
    if (
      !window.confirm(
        "Tem certeza que deseja cancelar esta candidatura? Não será possível revertê-la.",
      )
    )
      return;

    setCanceling(appId.toString());
    try {
      await apiCancelApplication(appId.toString());
      loadData();
    } catch (e: any) {
      alert(e.message || "Erro ao cancelar candidatura");
    } finally {
      setCanceling(null);
    }
  };

  // Helper to check if vacancy is expired
  const isVacancyExpired = (app: Application): boolean => {
    if (!app.vacancySnapshot) return false;
    return new Date() > new Date(app.vacancySnapshot.endTime);
  };

  // Helper to check if user can still apply (30 minutes before start)
  const canStillApply = (app: Application): boolean => {
    if (!app.vacancySnapshot) return false;
    const now = new Date();
    const startTime = new Date(app.vacancySnapshot.startTime);
    const minutesUntilStart =
      (startTime.getTime() - now.getTime()) / (1000 * 60);
    return minutesUntilStart >= 30;
  };

  // Helper to get minutes until start
  const getMinutesUntilStart = (app: Application): number => {
    if (!app.vacancySnapshot) return 0;
    const now = new Date();
    const startTime = new Date(app.vacancySnapshot.startTime);
    return Math.round((startTime.getTime() - now.getTime()) / (1000 * 60));
  };

  const activeApps = applications.filter(
    (a) =>
      a.status !== ApplicationStatus.CANCELED &&
      a.status !== ApplicationStatus.REJECTED &&
      !isVacancyExpired(a),
  );

  const expiredApps = applications.filter((a) => isVacancyExpired(a));

  const historyApps = applications.filter(
    (a) =>
      a.status === ApplicationStatus.CANCELED ||
      a.status === ApplicationStatus.REJECTED,
  );

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-slate-500 dark:text-slate-400">{t.loading}</p>
      </div>
    );

  return (
    <div>
      <div className="mb-8">
        <h3 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
          Minhas Candidaturas
        </h3>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">
          Acompanhe suas inscrições nas vagas.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
        <button
          onClick={() => setActiveTab("active")}
          className={`pb-3 px-1 font-medium text-sm flex items-center gap-2 transition-colors relative whitespace-nowrap ${
            activeTab === "active"
              ? "text-blue-600 dark:text-blue-400"
              : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
          }`}
        >
          <Calendar size={16} />
          Ativas
          {activeTab === "active" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-t-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab("expired")}
          className={`pb-3 px-1 font-medium text-sm flex items-center gap-2 transition-colors relative whitespace-nowrap ${
            activeTab === "expired"
              ? "text-blue-600 dark:text-blue-400"
              : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
          }`}
        >
          <AlertTriangle size={16} />
          Expiradas ({expiredApps.length})
          {activeTab === "expired" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-t-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab("history")}
          className={`pb-3 px-1 font-medium text-sm flex items-center gap-2 transition-colors relative whitespace-nowrap ${
            activeTab === "history"
              ? "text-blue-600 dark:text-blue-400"
              : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
          }`}
        >
          <History size={16} />
          Histórico
          {activeTab === "history" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-t-full" />
          )}
        </button>
      </div>

      {/* Content */}
      {activeTab === "active" ? (
        <>
          {activeApps.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-16 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
              <Calendar className="text-slate-400 mb-4" size={32} />
              <p className="text-slate-500 dark:text-slate-400 font-medium">
                Você ainda não se candidatou a nenhuma vaga.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeApps.map((app) => {
                const isLocked =
                  app.status === ApplicationStatus.APPROVED &&
                  !canStillApply(app);
                const minutesLeft = getMinutesUntilStart(app);

                return (
                  <div
                    key={app.id}
                    className={`group relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-0 transition-all duration-300 overflow-hidden flex flex-col hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-black/50 ${
                      isLocked ? "opacity-75" : ""
                    }`}
                  >
                    {isLocked && (
                      <div className="absolute top-2 right-2 z-10 flex items-center gap-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 px-3 py-1.5 rounded-full text-xs font-medium">
                        <Lock size={12} />
                        Bloqueada
                      </div>
                    )}

                    <div className="p-5 pb-0">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="text-lg font-bold text-slate-800 dark:text-white leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {app.vacancySnapshot?.title || "Vaga"}
                          </h4>
                          <p className="text-xs text-slate-400 mt-1">
                            Inscrição:{" "}
                            {new Date(app.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge status={app.status} />
                      </div>

                      {app.vacancySnapshot && (
                        <>
                          <div className="flex items-center gap-2 mt-3 text-sm text-slate-600 dark:text-slate-300">
                            <Clock size={14} />
                            {new Date(
                              app.vacancySnapshot.startTime,
                            ).toLocaleDateString()}{" "}
                            às{" "}
                            {new Date(
                              app.vacancySnapshot.startTime,
                            ).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>

                          <div className="flex items-center gap-2 mt-2 text-sm font-semibold text-green-600 dark:text-green-400">
                            <DollarSign size={14} />
                            R$ {app.vacancySnapshot.value.toFixed(2)}
                          </div>

                          {app.status === ApplicationStatus.APPROVED && (
                            <div className="mt-2 p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                              <p className="text-xs text-blue-700 dark:text-blue-400">
                                {minutesLeft > 30
                                  ? `⏱️ ${minutesLeft} minutos para o início`
                                  : minutesLeft > 0
                                    ? `⚠️ Faltam ${minutesLeft} minutos (menos de 30 min)`
                                    : "❌ Vaga iniciada"}
                              </p>
                            </div>
                          )}

                          {app.insertedManually && (
                            <div className="mt-2 p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                              <p className="text-xs text-purple-700 dark:text-purple-400">
                                ✅ Adicionado por: {app.insertedByUserName}
                              </p>
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {app.status === ApplicationStatus.PENDING && (
                      <div className="p-5 pt-3 mt-auto">
                        <button
                          onClick={() => handleCancel(app.id.toString())}
                          disabled={canceling === app.id.toString()}
                          className="w-full py-2 rounded-lg font-medium text-sm transition-all duration-300 flex items-center justify-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {canceling === app.id.toString() ? (
                            <>
                              <div className="animate-spin h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full" />
                              Cancelando...
                            </>
                          ) : (
                            <>
                              <Trash2 size={14} />
                              Cancelar
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : activeTab === "expired" ? (
        <>
          {expiredApps.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-16 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
              <AlertTriangle className="text-slate-400 mb-4" size={32} />
              <p className="text-slate-500 dark:text-slate-400 font-medium">
                Nenhuma vaga expirada.
              </p>
            </div>
          ) : (
            <div className="space-y-4 opacity-75">
              {expiredApps.map((app) => (
                <div
                  key={app.id}
                  className="bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 p-4 flex justify-between items-center"
                >
                  <div>
                    <h4 className="font-semibold text-slate-700 dark:text-slate-200">
                      {app.vacancySnapshot?.title || "Vaga"}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Expirou em:{" "}
                      {app.vacancySnapshot
                        ? new Date(
                            app.vacancySnapshot.endTime,
                          ).toLocaleDateString()
                        : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge status={app.status} />
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
                      Expirada
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          {historyApps.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-16 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
              <History className="text-slate-400 mb-4" size={32} />
              <p className="text-slate-500 dark:text-slate-400 font-medium">
                Nenhum histórico de candidaturas.
              </p>
            </div>
          ) : (
            <div className="space-y-4 opacity-75">
              {historyApps.map((app) => (
                <div
                  key={app.id}
                  className="bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 p-4 flex justify-between items-center"
                >
                  <div>
                    <h4 className="font-semibold text-slate-700 dark:text-slate-200">
                      {app.vacancySnapshot?.title || "Vaga"}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {app.vacancySnapshot
                        ? new Date(
                            app.vacancySnapshot.startTime,
                          ).toLocaleDateString()
                        : ""}
                    </p>
                  </div>
                  <Badge status={app.status} />
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};
