import React, { useEffect, useState } from "react";
import { User, NewsPost, UserRole } from "../types";
import { apiGetNews, apiCreateNews } from "../src/services/api";
import { Megaphone, Plus, UserCircle } from "lucide-react";

interface InternalBoardProps {
  user: User;
}

export const InternalBoard: React.FC<InternalBoardProps> = ({ user }) => {
  const [news, setNews] = useState<NewsPost[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newPost, setNewPost] = useState({ title: "", content: "" });

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    const data = await apiGetNews();
    setNews(data);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.title || !newPost.content) return;

    try {
      await apiCreateNews({
        title: newPost.title,
        content: newPost.content,
      });
      setShowModal(false);
      setNewPost({ title: "", content: "" });
      loadNews();
    } catch (error: any) {
      alert(error.message || "Erro ao criar notícia");
    }
  };

  const canPost = user.role === UserRole.ADMIN || user.role === UserRole.LEADER;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h3 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3 tracking-tight">
            <Megaphone className="text-blue-600" size={28} />
            Mural de Novidades
          </h3>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">
            Oportunidades internas e comunicados oficiais.
          </p>
        </div>

        {canPost && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20 font-medium"
          >
            <Plus size={20} />
            Novo Comunicado
          </button>
        )}
      </div>

      <div className="space-y-6">
        {news.length === 0 && (
          <div className="text-center p-12 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
            <p className="text-slate-500 dark:text-slate-400 font-medium">
              Nenhuma novidade publicada ainda.
            </p>
          </div>
        )}

        {news.map((post) => (
          <div
            key={post.id}
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="p-8">
              <div className="flex justify-between items-start mb-4">
                <h4 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {post.title}
                </h4>
                <span className="text-sm font-mono text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                  {new Date(post.createdAt).toLocaleDateString()}
                </span>
              </div>

              <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap text-base">
                {post.content}
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-950/50 px-8 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
              <UserCircle size={24} className="text-slate-400" />
              <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  {post.authorName}
                </span>
                <span className="hidden md:block text-slate-300">•</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 uppercase font-bold tracking-wider w-fit">
                  {post.authorRole}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg p-8 border dark:border-slate-800 transform transition-all">
            <h3 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">
              Publicar Novidade
            </h3>
            <form onSubmit={handleCreate} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Título
                </label>
                <input
                  required
                  className="w-full border border-slate-300 dark:border-slate-700 rounded-xl p-3 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={newPost.title}
                  onChange={(e) =>
                    setNewPost({ ...newPost, title: e.target.value })
                  }
                  placeholder="Ex: Vaga Efetiva - Financeiro"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Conteúdo
                </label>
                <textarea
                  required
                  rows={5}
                  className="w-full border border-slate-300 dark:border-slate-700 rounded-xl p-3 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                  value={newPost.content}
                  onChange={(e) =>
                    setNewPost({ ...newPost, content: e.target.value })
                  }
                  placeholder="Descreva a oportunidade ou comunicado..."
                />
              </div>
              <div className="flex justify-end gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium shadow-lg shadow-blue-500/30"
                >
                  Publicar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
