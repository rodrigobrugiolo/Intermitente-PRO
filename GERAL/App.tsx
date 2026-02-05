import React, { useState, useEffect } from "react";
import { User, UserRole, Language } from "./types";
import { apiLogin, apiLogout } from "./src/services/api";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { ManageApplications } from "./pages/ManageApplications";
import { InternalBoard } from "./pages/InternalBoard";
import { Profile } from "./pages/Profile";
import { MyApplications } from "./pages/MyApplications";
import { UserManagement } from "./pages/UserManagement";
import { Lock, UserCheck, Sun, Moon, HelpCircle } from "lucide-react";
import { getTranslation } from "./translations";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState("dashboard");

  // Theme State
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Language State
  const [language, setLanguage] = useState<Language>("pt");
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

  // Login State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);
  const t = getTranslation(language);

  const flags: Record<Language, string> = {
    pt: "https://github.com/rodrigobrugiolo/bank-images/blob/main/brasil.png?raw=true",
    en: "https://github.com/rodrigobrugiolo/bank-images/blob/main/estados-unidos.png?raw=true",
    es: "https://github.com/rodrigobrugiolo/bank-images/blob/main/ESPANHA.png?raw=true",
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const loggedUser = await apiLogin(email, password);
      if (loggedUser) {
        setUser(loggedUser);
        if (loggedUser.role === UserRole.LEADER) setCurrentPage("my-vacancies");
        else setCurrentPage("dashboard");
      } else {
        alert("Email ou senha incorretos.");
      }
    } catch (err: any) {
      alert(err.message || "Erro ao fazer login");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    apiLogout();
    setUser(null);
    setEmail("");
    setPassword("");
  };

  const handleForgotPassword = () => {
    const message = encodeURIComponent(
      "Preciso de ajuda, para redefinir minha senha no Intermitente PRO",
    );
    window.open(`https://wa.me/553284472389?text=${message}`, "_blank");
  };

  const fillCredentials = (roleEmail: string) => {
    setEmail(roleEmail);
    setPassword("mude1234");
  };

  if (!user) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center p-4 transition-colors ${isDarkMode ? "bg-slate-900" : "bg-slate-50"}`}
      >
        <div
          className={`rounded-3xl shadow-2xl w-full max-w-md p-10 ${isDarkMode ? "bg-slate-800" : "bg-white"} border border-slate-200 dark:border-slate-700 relative overflow-hidden`}
        >
          <div className="text-center mb-10 relative z-10">
            <h1 className="text-3xl font-bold mb-2 text-slate-900 dark:text-white">
              Intermitente <span className="text-blue-600">PRO</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              {t.loginSubtitle}
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6 relative z-10">
            <div>
              <label className="block text-sm font-bold mb-2 text-slate-700 dark:text-slate-300">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserCheck size={18} className="text-slate-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-slate-50 border-slate-200 hover:bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400"
                  placeholder={t.emailPlaceholder}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2 text-slate-700 dark:text-slate-300">
                {t.password}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-slate-400" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="******"
                  className="block w-full pl-10 pr-3 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-slate-50 border-slate-200 hover:bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3.5 px-4 rounded-xl shadow-lg shadow-blue-500/30 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 hover:-translate-y-0.5 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {loading ? t.loadingLogin : t.loginButton}
            </button>

            <button
              type="button"
              onClick={handleForgotPassword}
              className="w-full flex justify-center items-center gap-2 py-2 text-sm font-medium text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors"
            >
              <HelpCircle size={16} />
              {t.forgotPassword}
            </button>
          </form>

          {/* Footer Actions - Stacked Theme and Lang */}
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700 relative z-10 flex flex-col items-center gap-4">
            {/* Theme */}
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 text-slate-500 hover:text-yellow-500 transition-colors p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-sm font-medium"
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              <span>{isDarkMode ? t.lightMode : t.darkMode}</span>
            </button>

            {/* Language Dropdown (Login Screen) */}
            <div className="relative w-full flex justify-center">
              <button
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                className="flex items-center gap-2 text-xs font-bold uppercase text-slate-500 hover:text-blue-500 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-all border border-transparent hover:border-slate-200"
              >
                <img
                  src={flags[language]}
                  alt={language}
                  className="w-5 h-3.5 object-cover rounded-sm shadow-sm"
                />
                {language}
              </button>
              {isLangMenuOpen && (
                <div className="absolute bottom-full mb-2 w-40 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg shadow-xl overflow-hidden z-50">
                  <div className="p-1">
                    {(["pt", "en", "es"] as Language[]).map((lang) => (
                      <button
                        key={lang}
                        onClick={() => {
                          setLanguage(lang);
                          setIsLangMenuOpen(false);
                        }}
                        className={`flex items-center w-full px-3 py-2 text-xs font-bold uppercase hover:bg-slate-100 dark:hover:bg-slate-600 rounded ${language === lang ? "bg-blue-50 text-blue-600 dark:bg-slate-600 dark:text-white" : "text-slate-500 dark:text-slate-300"}`}
                      >
                        <img
                          src={flags[lang]}
                          alt={lang}
                          className="w-5 h-3.5 object-cover rounded-sm mr-2 shadow-sm"
                        />
                        {lang}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 text-center relative z-10">
            <p className="text-[10px] text-slate-400 mb-2 uppercase tracking-widest">
              {t.testCreds}
            </p>
            <div className="flex flex-wrap gap-2 justify-center text-[10px]">
              <span
                onClick={() => fillCredentials("lider@empresa.com")}
                className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-700 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors text-slate-600 dark:text-slate-300"
              >
                Líder
              </span>
              <span
                onClick={() => fillCredentials("joao@worker.com")}
                className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-700 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors text-slate-600 dark:text-slate-300"
              >
                Worker
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render page content based on currentPage
  const renderPageContent = () => {
    switch (currentPage) {
      case "dashboard":
        return (
          <Dashboard
            user={user}
            currentLang={language}
            onNavigate={setCurrentPage}
          />
        );
      case "manage-applications":
        return <ManageApplications user={user} />;
      case "my-applications":
        return <MyApplications user={user} currentLang={language} />;
      case "my-vacancies":
        return <ManageApplications user={user} />;
      case "internal-board":
        return <InternalBoard user={user} />;
      case "profile":
        return <Profile user={user} setUser={setUser} currentLang={language} />;
      case "user-management":
        return <UserManagement user={user} currentLang={language} />;
      default:
        return (
          <Dashboard
            user={user}
            currentLang={language}
            onNavigate={setCurrentPage}
          />
        );
    }
  };

  // Main app layout after login
  return (
    <Layout
      children={renderPageContent()}
      user={user}
      onLogout={handleLogout}
      currentPage={currentPage}
      onNavigate={setCurrentPage}
      isDarkMode={isDarkMode}
      toggleTheme={toggleTheme}
      currentLang={language}
      setLanguage={setLanguage}
    />
  );
}
