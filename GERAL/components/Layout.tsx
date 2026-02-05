import React, { useState } from "react";
import { User, Language } from "../types";
import { getTranslation } from "../translations";
import {
  LogOut,
  Briefcase,
  Users,
  LayoutDashboard,
  Shield,
  Moon,
  Sun,
  Megaphone,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  UserCircle,
  UserCog,
} from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  onLogout: () => void;
  currentPage: string;
  onNavigate: (page: string) => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
  currentLang: Language;
  setLanguage: (lang: Language) => void;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  user,
  onLogout,
  currentPage,
  onNavigate,
  isDarkMode,
  toggleTheme,
  currentLang,
  setLanguage,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

  const t = getTranslation(currentLang);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  const flags: Record<Language, string> = {
    pt: "https://github.com/rodrigobrugiolo/bank-images/blob/main/brasil.png?raw=true",
    en: "https://github.com/rodrigobrugiolo/bank-images/blob/main/estados-unidos.png?raw=true",
    es: "https://github.com/rodrigobrugiolo/bank-images/blob/main/ESPANHA.png?raw=true",
  };

  const NavItem = ({
    page,
    icon: Icon,
    label,
  }: {
    page: string;
    icon: any;
    label: string;
  }) => (
    <button
      onClick={() => {
        onNavigate(page);
        setIsSidebarOpen(false);
      }}
      className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group relative flex-shrink-0
        ${
          currentPage === page
            ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
            : "text-slate-400 hover:bg-slate-800 hover:text-white"
        }
        ${isCollapsed ? "justify-center" : ""}
      `}
      title={isCollapsed ? label : ""}
    >
      <Icon size={20} className={`${!isCollapsed && "mr-3"} min-w-[20px]`} />
      {!isCollapsed && <span className="truncate">{label}</span>}

      {isCollapsed && (
        <div className="absolute left-14 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
          {label}
        </div>
      )}
    </button>
  );

  return (
    <div
      className={`flex h-screen overflow-hidden transition-colors duration-200 ${isDarkMode ? "dark bg-slate-950" : "bg-slate-100"}`}
    >
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-slate-900 z-50 flex items-center justify-between px-4 shadow-md">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            className="text-white p-1 rounded-md hover:bg-slate-800"
          >
            <Menu size={24} />
          </button>
          <span className="font-bold text-lg text-white">
            Intermitente <span className="text-blue-500">PRO</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          {user && (
            <button onClick={() => onNavigate("profile")}>
              {user.profilePic ? (
                <img
                  src={user.profilePic}
                  className="w-8 h-8 rounded-full border-2 border-blue-500 object-cover"
                  alt="Profile"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
                  {user.name.substring(0, 2).toUpperCase()}
                </div>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Overlay for Mobile */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
        fixed lg:static inset-y-0 left-0 z-50 bg-slate-900 text-white flex flex-col shadow-xl border-r border-slate-800
        transition-all duration-300 ease-in-out h-full max-h-[100dvh]
        ${isSidebarOpen ? "translate-x-0 w-64" : "-translate-x-full lg:translate-x-0"}
        ${isCollapsed ? "lg:w-20" : "lg:w-64"}
      `}
      >
        {/* Sidebar Header */}
        <div
          className={`p-6 border-b border-slate-800 flex items-center flex-none h-20 ${isCollapsed ? "justify-center" : "justify-between"}`}
        >
          {!isCollapsed && (
            <div
              className="flex items-center justify-between w-full group cursor-pointer"
              onClick={toggleSidebar}
            >
              <h1 className="text-xl font-bold tracking-tight text-blue-500 whitespace-nowrap">
                Intermitente <span className="text-white">PRO</span>
              </h1>
              {/* Mobile Close Button - Red on Hover of Text */}
              <button className="lg:hidden text-slate-400 group-hover:text-red-500 transition-colors">
                <X size={20} />
              </button>
            </div>
          )}
          {isCollapsed && (
            <span className="text-blue-500 font-bold text-xl">IP</span>
          )}
        </div>

        {/* User Info with Profile Link */}
        {user && !isCollapsed && (
          <div
            className="px-6 py-4 bg-slate-800/50 border-b border-slate-800 flex items-center justify-between group cursor-pointer hover:bg-slate-800 transition-colors flex-none"
            onClick={() => onNavigate("profile")}
          >
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-white truncate">
                {user.name}
              </p>
              <p className="text-xs text-slate-400 capitalize mt-0.5">
                {user.role}
              </p>
            </div>
            <UserCircle
              size={20}
              className="text-slate-500 group-hover:text-blue-400 flex-shrink-0"
            />
          </div>
        )}

        {/* Scrollable Navigation Area - IMPORTANT: min-h-0 allows it to shrink */}
        <nav className="flex-1 p-3 space-y-1 overflow-hidden custom-scrollbar min-h-0">
          <NavItem
            page="dashboard"
            icon={LayoutDashboard}
            label={t.dashboard}
          />

          {(user?.role === "LEADER" || user?.role === "ADMIN") && (
            <NavItem page="my-vacancies" icon={Users} label={t.myVacancies} />
          )}

          {user?.role === "INTERMITTENT" && (
            <NavItem
              page="my-applications"
              icon={Briefcase}
              label={t.myApplications}
            />
          )}

          <NavItem
            page="internal-board"
            icon={Megaphone}
            label={t.internalBoard}
          />

          {(user?.role === "ADMIN" || user?.role === "LEADER") && (
            <NavItem
              page="user-management"
              icon={UserCog}
              label={t.userManagement}
            />
          )}
        </nav>

        {/* Fixed Footer Area */}
        <div className="p-3 border-t border-slate-800 space-y-2 flex-none bg-slate-900 z-10">
          {/* Collapse Toggle */}
          <button
            onClick={toggleCollapse}
            className="hidden lg:flex items-center w-full px-4 py-2 text-xs text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-colors justify-center"
          >
            {isCollapsed ? (
              <ChevronRight size={16} />
            ) : (
              <div className="flex items-center gap-2">
                <ChevronLeft size={16} /> <span>Recolher</span>
              </div>
            )}
          </button>

          <div
            className={`flex ${isCollapsed ? "flex-col items-center gap-3" : "flex-col gap-2"} px-1`}
          >
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`flex items-center justify-center w-full py-2 text-slate-400 hover:text-yellow-400 hover:bg-slate-800 rounded-lg transition-colors ${!isCollapsed ? "bg-slate-800/50" : ""}`}
              title={isDarkMode ? t.lightMode : t.darkMode}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Language Dropdown */}
            <div
              className={`relative w-full ${isCollapsed ? "flex justify-center" : ""}`}
            >
              <button
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                className={`flex items-center justify-center w-full px-2 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-slate-700 ${isCollapsed ? "p-0" : ""}`}
              >
                <img
                  src={flags[currentLang]}
                  alt={currentLang}
                  className="w-5 h-3.5 object-cover rounded-sm shadow-sm flex-shrink-0"
                />
                {!isCollapsed && (
                  <span className="text-xs font-bold uppercase ml-2">
                    {currentLang}
                  </span>
                )}
              </button>

              {isLangMenuOpen && (
                <div className="absolute bottom-full left-0 mb-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden z-50">
                  <div className="p-1">
                    {(["pt", "en", "es"] as Language[]).map((lang) => (
                      <button
                        key={lang}
                        onClick={() => {
                          setLanguage(lang);
                          setIsLangMenuOpen(false);
                        }}
                        className={`flex items-center w-full px-4 py-2 text-sm hover:bg-slate-700 rounded ${currentLang === lang ? "bg-slate-700 text-white" : "text-slate-300"}`}
                      >
                        <img
                          src={flags[lang]}
                          alt={lang}
                          className="w-5 h-3.5 object-cover rounded-sm mr-3 shadow-sm"
                        />
                        {lang === "pt" && "Português"}
                        {lang === "en" && "English"}
                        {lang === "es" && "Español"}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={onLogout}
            className={`flex items-center w-full px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-slate-800 rounded-lg transition-colors ${isCollapsed ? "justify-center" : ""}`}
            title={t.logout}
          >
            <LogOut size={18} className={!isCollapsed ? "mr-3" : ""} />
            {!isCollapsed && t.logout}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-full pt-16 lg:pt-0 bg-slate-100 dark:bg-slate-950 transition-colors">
        {/* Desktop Header */}
        <header className="hidden lg:flex bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm sticky top-0 z-30 px-8 py-4 justify-between items-center border-b border-slate-200 dark:border-slate-800 transition-colors">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">
            {currentPage === "dashboard" && t.dashboard}
            {currentPage === "internal-board" && t.internalBoard}
            {currentPage === "my-vacancies" && t.myVacancies}
            {currentPage === "my-applications" && t.myApplications}
            {currentPage === "profile" && t.profile}
            {currentPage === "user-management" && t.userManagement}
          </h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs font-medium px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
              <Shield size={12} className="text-green-500" />
              <span>{t.secureEnv}</span>
            </div>
            {/* Profile Icon in Header (Desktop) */}
            {user && (
              <button
                onClick={() => onNavigate("profile")}
                className="flex items-center gap-2 group"
              >
                <div className="text-right hidden xl:block">
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    {user.name}
                  </p>
                </div>
                {user.profilePic ? (
                  <img
                    src={user.profilePic}
                    className="w-9 h-9 rounded-full border-2 border-slate-200 dark:border-slate-700 group-hover:border-blue-500 transition-colors object-cover"
                    alt="Profile"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <UserCircle size={20} />
                  </div>
                )}
              </button>
            )}
          </div>
        </header>

        {/* Mobile Page Title (Below Header) */}
        <div className="lg:hidden p-4 pb-0">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
            {currentPage === "dashboard" && t.dashboard}
            {currentPage === "internal-board" && t.internalBoard}
            {currentPage === "my-vacancies" && t.myVacancies}
            {currentPage === "my-applications" && t.myApplications}
            {currentPage === "profile" && t.profile}
            {currentPage === "user-management" && t.userManagement}
          </h2>
        </div>

        <div className="p-4 lg:p-8 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
};
