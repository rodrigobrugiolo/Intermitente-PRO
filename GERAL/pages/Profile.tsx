import React, { useState, useRef } from "react";
import { User, Language } from "../types";
import { getTranslation } from "../translations";
import { apiUpdateProfile } from "../src/services/api";

import {
  Save,
  UserCircle,
  CreditCard,
  MapPin,
  Phone,
  Hash,
  Upload,
  ImageIcon,
} from "lucide-react";

interface ProfileProps {
  user: User;
  setUser: (u: User) => void;
  currentLang: Language;
}

export const Profile: React.FC<ProfileProps> = ({
  user,
  setUser,
  currentLang,
}) => {
  const t = getTranslation(currentLang);
  const [formData, setFormData] = useState({
    name: user.name,
    cpf: user.cpf || "",
    phone: user.phone,
    address: user.address || "",
    pixKey: user.pixKey || "",
    profilePic: user.profilePic || "",
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isComplete =
    formData.cpf && formData.address && formData.pixKey && formData.phone;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updated = await apiUpdateProfile(formData);
      setUser(updated);
      setMsg(t.profileSaved);
      setTimeout(() => setMsg(""), 3000);
    } catch (e) {
      alert("Error saving profile");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, profilePic: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border-2 border-slate-200 dark:border-slate-700 overflow-hidden relative group">
            {formData.profilePic ? (
              <img
                src={formData.profilePic}
                className="w-full h-full object-cover"
              />
            ) : (
              <UserCircle size={48} className="text-slate-400" />
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              {t.profile}
            </h2>
            {!isComplete && (
              <span className="text-xs font-bold text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded mt-1 inline-block">
                {t.profileIncomplete}
              </span>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
              <UserCircle size={16} /> {t.fullName}
            </label>
            <input
              className="w-full border border-slate-300 dark:border-slate-700 rounded-xl p-3 dark:bg-slate-800 dark:text-white"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                <Hash size={16} /> {t.cpf}{" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                className="w-full border border-slate-300 dark:border-slate-700 rounded-xl p-3 dark:bg-slate-800 dark:text-white"
                value={formData.cpf}
                onChange={(e) =>
                  setFormData({ ...formData, cpf: e.target.value })
                }
                placeholder="000.000.000-00"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                <Phone size={16} /> {t.phone}{" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                className="w-full border border-slate-300 dark:border-slate-700 rounded-xl p-3 dark:bg-slate-800 dark:text-white"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
              <MapPin size={16} /> {t.address}{" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              className="w-full border border-slate-300 dark:border-slate-700 rounded-xl p-3 dark:bg-slate-800 dark:text-white"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
              <CreditCard size={16} /> {t.pixKey}{" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              className="w-full border border-slate-300 dark:border-slate-700 rounded-xl p-3 dark:bg-slate-800 dark:text-white"
              value={formData.pixKey}
              onChange={(e) =>
                setFormData({ ...formData, pixKey: e.target.value })
              }
              required
            />
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
              <ImageIcon size={16} /> Foto de Perfil
            </label>

            <div className="flex flex-col gap-3">
              <div className="flex gap-2">
                <input
                  className="w-full border border-slate-300 dark:border-slate-700 rounded-xl p-3 dark:bg-slate-800 dark:text-white text-xs font-mono"
                  value={formData.profilePic}
                  onChange={(e) =>
                    setFormData({ ...formData, profilePic: e.target.value })
                  }
                  placeholder="Cole a URL da imagem ou carregue abaixo..."
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-white rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors text-sm font-medium"
                >
                  <Upload size={16} />
                  {t.uploadPhoto}
                </button>
                <span className="text-xs text-slate-500">
                  Ou anexe um arquivo local
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-green-600 font-bold">{msg}</span>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20"
            >
              {loading ? (
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <Save size={18} />
              )}
              {t.saveProfile}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
