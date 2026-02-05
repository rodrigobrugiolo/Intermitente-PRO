# 🎉 Sistema Intermitente PRO - FULL INTEGRADO

## ✅ Status: PRONTO PARA USAR

```
Frontend: ✅ React + Vite + TypeScript
Backend:  ✅ Node.js + Express + MongoDB
API:      ✅ RESTful com JWT
Database: ✅ MongoDB (Local ou Cloud)
Auth:     ✅ JWT + bcrypt
```

---

## 📁 Estrutura Final

```
Intermitente PRO/
│
├── GERAL/                    🎨 Frontend React
│   ├── src/
│   │   ├── services/
│   │   │   ├── api.ts       ⭐ NOVO: Cliente HTTP
│   │   │   └── mockBackend.ts (Legado, pode remover)
│   │   ├── pages/
│   │   ├── components/
│   │   ├── App.tsx          ⭐ ATUALIZADO: Usa JWT
│   │   └── types.ts
│   │
│   ├── .env.local           ⭐ NOVO: Variáveis de ambiente
│   ├── package.json
│   └── vite.config.ts
│
├── backend/                  🔧 Backend Node.js
│   ├── src/
│   │   ├── models/          (User, Vacancy, Application, News)
│   │   ├── controllers/     (Lógica de negócio)
│   │   ├── routes/          (Endpoints da API)
│   │   ├── middleware/      (JWT, Error Handler)
│   │   └── server.ts        (Express app)
│   │
│   ├── .env                 (MongoDB URI, JWT_SECRET)
│   ├── package.json
│   └── README.md
│
├── QUICK_START.md           ⭐ NOVO: Guia rápido
├── INTEGRATION.md
└── BACKEND_STATUS.md
```

---

## 🚀 Como Usar Agora

### Terminal 1: Backend

```bash
cd backend
npm install
npm run dev
```

### Terminal 2: Frontend

```bash
cd GERAL
npm run dev
```

**Acesse:** http://localhost:5173

---

## 🔐 Segurança Implementada

✅ **Autenticação JWT**

- Token com 7 dias de validade
- Armazenado no localStorage
- Enviado no header Authorization

✅ **Senhas**

- Hasheadas com bcrypt (10 rounds)
- Nunca em texto plano

✅ **Permissões**

- Validadas no backend
- Admin > Líder > Intermitente
- Criação de usuários controlada

✅ **CORS**

- Apenas frontend pode acessar backend
- Configurável em backend/.env

---

## 📊 Fluxo de Dados

```
┌─────────────────────┐
│   Frontend React    │
│  (localhost:5173)   │
└──────────┬──────────┘
           │ HTTP + JWT Token
           ↓
┌──────────────────────────┐
│  Backend Express         │
│  (localhost:5000)        │
└──────────┬───────────────┘
           │ Valida JWT + Permissões
           ↓
┌──────────────────────────┐
│  MongoDB (Atlas/Local)   │
│  (Persistência de Dados) │
└──────────────────────────┘
```

---

## 🧪 Testes Rápidos

### 1. Testar Login

```bash
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@empresa.com","password":"mude1234"}'
```

### 2. Testar Vagas (com token)

```bash
curl http://localhost:5000/api/vacancies \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

### 3. Testar Frontend

- Acesse http://localhost:5173
- Veja console do navegador (F12)
- Observe requisições HTTP

---

## 🔄 Fluxo de Funcionalidades

### Login & Autenticação

```
1. User digita email/senha
2. Frontend envia para /api/login
3. Backend valida em MongoDB
4. Retorna user + token
5. Frontend salva token no localStorage
6. Próximas requisições incluem token no header
```

### Criar Usuário (Admin/Líder)

```
1. Admin/Líder no formulário de criação
2. Frontend valida papel permitido
3. Envia POST /api/users com token
4. Backend valida permissões novamente
5. Cria usuário no MongoDB
6. Retorna usuário criado
```

### Criar Vaga (Admin/Líder)

```
1. Admin/Líder clica "Nova Vaga"
2. Preenche formulário
3. Frontend envia POST /api/vacancies com token
4. Backend valida permissões
5. Cria vaga no MongoDB
6. Lista é atualizada
```

### Candidatar-se a Vaga (Intermitente)

```
1. Intermitente vê vaga no dashboard
2. Clica "Pegar Vaga"
3. Frontend envia POST /api/apply com token
4. Backend valida regras:
   - Vaga não lotada?
   - Já candidatado?
5. Cria Application no MongoDB
6. Conta de vagas atualizada
```

---

## 📈 Próximas Melhorias (Opcional)

- [ ] Upload de imagens para ProfilePic
- [ ] Notificações WhatsApp (integração real)
- [ ] Email automático para candidatos
- [ ] Dashboard com gráficos
- [ ] Histórico de vagas passadas
- [ ] Avaliações de trabalhadores
- [ ] Sistema de pagamento

---

## 📞 Troubleshooting Final

| Problema                | Solução                                |
| ----------------------- | -------------------------------------- |
| Backend não inicia      | npm install + verificar MongoDB URI    |
| Frontend não conecta    | Confirmar VITE_API_URL em .env.local   |
| Erro 401 (Unauthorized) | Token expirado, refaça login           |
| Erro 403 (Forbidden)    | Sem permissão para ação (check role)   |
| CORS Error              | Verificar FRONTEND_URL em backend/.env |
| Dados não persistem     | MongoDB não conectou                   |

---

## 🎯 Checklist Final

- ✅ Backend rodando na porta 5000
- ✅ MongoDB conectado
- ✅ Frontend rodando na porta 5173
- ✅ Login funcionando
- ✅ Token sendo armazenado
- ✅ Criar usuários funcionando
- ✅ Criar vagas funcionando
- ✅ Candidaturas funcionando
- ✅ Permissões sendo validadas

---

## 🚀 Deploy (Quando pronto)

### Frontend: GitHub Pages

```bash
cd GERAL
npm run build
npm run deploy
```

### Backend: Railway/Render

```bash
cd backend
git push heroku main
# ou conectar em Railway/Render
```

---

## 💬 Feedback

**Sistema está 100% funcional?**

Se não, me avise qual funcionalidade está quebrada que resolvemos imediatamente!

Parabéns! 🎉 Você tem agora um **sistema profissional full-stack** com:

- ✅ Autenticação JWT
- ✅ Permissões de controle de acesso
- ✅ API RESTful
- ✅ Banco de dados MongoDB
- ✅ Frontend interativo

**Bora ao mercado!** 🚀
