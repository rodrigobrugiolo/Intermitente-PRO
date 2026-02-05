# Integração Frontend com Backend

## 📋 Passos para Integração

### 1. Instalar dependências do backend

```bash
cd backend
npm install
```

### 2. Configurar MongoDB

Siga as instruções em `backend/README.md`

### 3. Iniciar backend

```bash
cd backend
npm run dev
```

Você verá: `🚀 Servidor rodando em http://localhost:5000`

### 4. Iniciar frontend (em outro terminal)

```bash
cd GERAL
npm run dev
```

Frontend estará em: `http://localhost:5173`

### 5. Testar login

- Admin: admin@empresa.com / mude1234
- Líder: lider@empresa.com / mude1234
- Intermitente: joao@worker.com / mude1234

---

## 🔧 Integração do Código

### Frontend mudará de:

- **mockBackend.ts** (em memória) → **API REST** (backend)

### Arquivos a atualizar:

1. **GERAL/services/mockBackend.ts**
   - Transformar em chamadas HTTP

2. **App.tsx**
   - Armazenar token JWT no localStorage
   - Incluir token em headers das requisições

3. **Componentes de página**
   - Passar `apiUrl` como prop

---

## 🚀 Próximas Etapas (Quando pronto)

1. Criar arquivo `backend/services/api.ts` no frontend
2. Substituir chamadas do mockBackend por HTTP
3. Testar todas as funcionalidades
4. Deploy do backend (Railway/Vercel)
5. Deploy do frontend (GitHub Pages)

---

## 📝 Estrutura Final

```
Intermitente PRO/
├── GERAL/              (Frontend React)
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
│
└── backend/            (Backend Node.js)
    ├── src/
    │   ├── models/     (MongoDB schemas)
    │   ├── routes/     (API endpoints)
    │   ├── controllers/(Lógica de negócio)
    │   ├── middleware/ (Auth, erro)
    │   └── server.ts   (Express app)
    ├── package.json
    └── .env
```

---

## ✅ Backend Pronto!

Seu backend Node.js + MongoDB está 100% funcional com:

- ✅ Autenticação JWT
- ✅ Gerenciamento de Usuários
- ✅ CRUD de Vagas
- ✅ Candidaturas
- ✅ Notícias
- ✅ Validação de permissões
- ✅ CORS configurado

Próximo passo: **Integrar frontend com API**
