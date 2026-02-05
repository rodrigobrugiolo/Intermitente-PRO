import React, { useEffect, useState } from "react";
import { User, UserRole, Language } from "../types";
import { apiGetUsers, apiCreateUser, apiUpdateUser } from "../src/services/api";
import { getTranslation } from "../translations";
import {
  Plus,
  UserCircle,
  Search,
  Edit2,
  Shield,
  Save,
  Key,
  Check,
} from "lucide-react";

interface UserManagementProps {
  user: User;
  currentLang: Language;
}

export const UserManagement: React.FC<UserManagementProps> = ({
  user,
  currentLang,
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Create Form State
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: UserRole.INTERMITTENT,
  });

  // Edit State
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editRole, setEditRole] = useState<UserRole>(UserRole.INTERMITTENT);

  // Copy State
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const t = getTranslation(currentLang);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const data = await apiGetUsers();
    setUsers(data);
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiCreateUser(newUser);
      setShowModal(false);
      setNewUser({
        name: "",
        email: "",
        phone: "",
        password: "",
        role: UserRole.INTERMITTENT,
      });
      loadUsers();
      alert("Usuário criado com sucesso!");
    } catch (e: any) {
      alert(e.message || "Erro ao criar usuário");
    }
  };

  const handleUpdateRole = async (id: number) => {
    try {
      await apiUpdateUser(id.toString(), { role: editRole });
      setEditingId(null);
      loadUsers();
    } catch (e) {
      alert("Erro ao atualizar");
    }
  };

  const handleCopyResetLink = (userId: number) => {
    // Mock link generation
    const link = `https://app.intermittentepro.com/reset-password?uid=${userId}&token=${Math.random().toString(36).substring(7)}`;
    navigator.clipboard.writeText(link);
    setCopiedId(userId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h3 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3 tracking-tight">
            <Shield className="text-blue-600" size={28} />
            {t.userManagement}
          </h3>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">
            Gerencie líderes e trabalhadores.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20 font-medium"
        >
          <Plus size={20} />
          {t.createUser}
        </button>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 mb-6 flex items-center gap-3">
        <Search className="text-slate-400" size={20} />
        <input
          className="bg-transparent outline-none w-full text-slate-700 dark:text-white placeholder-slate-400"
          placeholder="Buscar por nome ou email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                <th className="p-4">{t.name}</th>
                <th className="p-4">{t.email}</th>
                <th className="p-4">{t.phone}</th>
                <th className="p-4">{t.role}</th>
                <th className="p-4 text-right">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    {t.loading}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr
                    key={u.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-300">
                          {u.profilePic ? (
                            <img
                              src={u.profilePic}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <UserCircle size={20} />
                          )}
                        </div>
                        <span className="font-medium text-slate-700 dark:text-slate-200">
                          {u.name}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-300 text-sm">
                      {u.email}
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-300 text-sm">
                      {u.phone}
                    </td>
                    <td className="p-4">
                      {editingId === u.id ? (
                        <select
                          value={editRole}
                          onChange={(e) =>
                            setEditRole(e.target.value as UserRole)
                          }
                          className="bg-slate-100 dark:bg-slate-900 border-none rounded px-2 py-1 text-sm text-slate-700 dark:text-white"
                        >
                          <option value={UserRole.INTERMITTENT}>
                            {t.role_intermittent}
                          </option>
                          <option value={UserRole.LEADER}>
                            {t.role_leader}
                          </option>
                          <option value={UserRole.ADMIN}>{t.role_admin}</option>
                        </select>
                      ) : (
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-bold uppercase
                                            ${
                                              u.role === UserRole.ADMIN
                                                ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                                                : u.role === UserRole.LEADER
                                                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                                                  : "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                                            }`}
                        >
                          {u.role === UserRole.ADMIN
                            ? t.role_admin
                            : u.role === UserRole.LEADER
                              ? t.role_leader
                              : t.role_intermittent}
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        {editingId === u.id ? (
                          <>
                            <button
                              onClick={() => setEditingId(null)}
                              className="text-slate-400 hover:text-slate-600"
                            >
                              Cancelar
                            </button>
                            <button
                              onClick={() => handleUpdateRole(u.id)}
                              className="text-green-600 hover:text-green-700 font-medium flex items-center gap-1"
                            >
                              <Save size={14} /> Salvar
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleCopyResetLink(u.id)}
                              className="p-2 text-slate-400 hover:text-orange-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors relative group"
                              title={t.copyResetLink}
                            >
                              {copiedId === u.id ? (
                                <Check size={16} className="text-green-500" />
                              ) : (
                                <Key size={16} />
                              )}
                            </button>

                            <button
                              onClick={() => {
                                setEditingId(u.id);
                                setEditRole(u.role);
                              }}
                              className="p-2 text-slate-400 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                            >
                              <Edit2 size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Create User */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg p-8 border dark:border-slate-800">
            <h3 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">
              {t.createUser}
            </h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t.name}
                </label>
                <input
                  required
                  className="w-full border rounded-lg p-2 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  value={newUser.name}
                  onChange={(e) =>
                    setNewUser({ ...newUser, name: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t.email}
                </label>
                <input
                  required
                  type="email"
                  className="w-full border rounded-lg p-2 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  value={newUser.email}
                  onChange={(e) =>
                    setNewUser({ ...newUser, email: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t.initialPassword}
                </label>
                <input
                  required
                  type="text"
                  className="w-full border rounded-lg p-2 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  value={newUser.password}
                  onChange={(e) =>
                    setNewUser({ ...newUser, password: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t.phone}
                </label>
                <input
                  required
                  className="w-full border rounded-lg p-2 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  value={newUser.phone}
                  onChange={(e) =>
                    setNewUser({ ...newUser, phone: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t.role}
                </label>
                <select
                  className="w-full border rounded-lg p-2 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  value={newUser.role}
                  onChange={(e) =>
                    setNewUser({ ...newUser, role: e.target.value as UserRole })
                  }
                >
                  {/* INTERMITTENT - always available */}
                  <option value={UserRole.INTERMITTENT}>
                    {t.role_intermittent}
                  </option>

                  {/* LEADER - only for ADMIN */}
                  {user.role === UserRole.ADMIN && (
                    <option value={UserRole.LEADER}>{t.role_leader}</option>
                  )}

                  {/* ADMIN - only for ADMIN */}
                  {user.role === UserRole.ADMIN && (
                    <option value={UserRole.ADMIN}>{t.role_admin}</option>
                  )}
                </select>
                {user.role === UserRole.LEADER && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Líderes podem criar apenas Intermitentes
                  </p>
                )}
              </div>
              <div className="flex justify-end gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {t.saveUser}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
