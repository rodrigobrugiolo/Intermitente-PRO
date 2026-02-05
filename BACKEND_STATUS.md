# 🚀 Intermitente PRO - Backend Completo!

## ✅ O que foi criado:

### 📁 Estrutura de Pastas

```
backend/
├── src/
│   ├── models/
│   │   ├── User.ts           (Schema de usuários)
│   │   ├── Vacancy.ts        (Schema de vagas)
│   │   ├── Application.ts    (Schema de candidaturas)
│   │   └── News.ts           (Schema de notícias)
│   │
│   ├── controllers/
│   │   ├── userController.ts       (Lógica de usuários)
│   │   ├── vacancyController.ts    (Lógica de vagas)
│   │   ├── applicationController.ts(Lógica de candidaturas)
│   │   └── newsController.ts       (Lógica de notícias)
│   │
│   ├── routes/
│   │   ├── userRoutes.ts
│   │   ├── vacancyRoutes.ts
│   │   ├── applicationRoutes.ts
│   │   └── newsRoutes.ts
│   │
│   ├── middleware/
│   │   └── auth.ts           (JWT + Error Handler)
│   │
│   └── server.ts             (Express app)
│
├── package.json
├── tsconfig.json
├── .env                      (Variáveis de ambiente)
├── .gitignore
└── README.md                 (Instruções detalhadas)
```

---

## 🎯 Funcionalidades Implementadas

### 1️⃣ Autenticação & Usuários

- ✅ Login com JWT
- ✅ Criar usuários com validação de permissão
- ✅ Atualizar perfil
- ✅ Listar usuários
- ✅ Senhas hasheadas com bcrypt

### 2️⃣ Vagas

- ✅ Listar vagas
- ✅ Criar vaga (apenas ADMIN/LEADER)
- ✅ Deletar vaga
- ✅ Minhas vagas (do criador)
- ✅ Contar candidaturas automaticamente

### 3️⃣ Candidaturas

- ✅ Se candidatar a vaga
- ✅ Listar minhas candidaturas
- ✅ Cancelar candidatura (regra 4 horas)
- ✅ Atualizar status (Admin/Líder)

### 4️⃣ Notícias

- ✅ Criar post
- ✅ Listar posts

### 5️⃣ Validações

- ✅ ADMIN cria qualquer papel
- ✅ LÍDER cria apenas Intermitentes
- ✅ ADMIN/LÍDER criam vagas
- ✅ Apenas criador pode deletar (ou ADMIN)

---

## 🔌 Endpoints Disponíveis

### Auth

```
POST /api/login
```

### Users

```
POST   /api/users                  (criar)
GET    /api/users                  (listar)
PUT    /api/users/:id              (atualizar role)
PUT    /api/profile                (meu perfil)
```

### Vacancies

```
GET    /api/vacancies              (públicas)
GET    /api/my-vacancies           (minhas)
POST   /api/vacancies              (criar)
DELETE /api/vacancies/:id          (deletar)
GET    /api/vacancies/:id/applications
PUT    /api/applications/:id/status
```

### Applications

```
POST   /api/apply
GET    /api/my-applications
PUT    /api/applications/:id/cancel
```

### News

```
GET    /api/news
POST   /api/news
```

---

## 🚦 Próximos Passos

### Curto Prazo (Hoje)

1. ✅ **Testar Backend**
   - Instalar dependências: `npm install`
   - Configurar MongoDB Atlas
   - Rodar: `npm run dev`
   - Testar endpoints com Postman

2. ✅ **Integrar Frontend**
   - Criar `GERAL/src/services/api.ts`
   - Substituir mockBackend por HTTP
   - Armazenar JWT no localStorage
   - Testar login

### Médio Prazo (Esta semana)

3. Upload de imagens (ProfilePic)
4. Notificações WhatsApp (integração real)
5. Testes automatizados

### Longo Prazo (Próximas semanas)

6. Deploy Backend (Railway/Render)
7. Deploy Frontend (GitHub Pages)
8. Domínio customizado
9. Emails automáticos

---

## 🔐 Segurança

- ✅ JWT com 7 dias de validade
- ✅ Senhas com bcrypt (10 rounds)
- ✅ CORS restrito ao frontend
- ✅ Validação de permissões em toda API
- ✅ Variáveis sensíveis em .env

---

## 📊 Banco de Dados - MongoDB

**Collections:**

- `users` - Usuários do sistema
- `vacancies` - Vagas disponíveis
- `applications` - Candidaturas
- `news` - Posts de notícias

**Índices automáticos:**

- Email único em Users
- Timestamps em todas collections

---

## 💡 Dicas para Desenvolvimento

### Adicionar novo endpoint:

1. Criar função em `controllers/`
2. Adicionar rota em `routes/`
3. Importar rota em `server.ts`
4. Testar com Postman

### Adicionar nova collection:

1. Criar schema em `models/`
2. Criar controller
3. Criar routes
4. Importar em server.ts

---

## 🐛 Troubleshooting Rápido

| Problema                       | Solução                          |
| ------------------------------ | -------------------------------- |
| `MONGODB_URI not defined`      | Configure `.env`                 |
| `Cannot find module 'express'` | Execute `npm install`            |
| `CORS error`                   | Verifique FRONTEND_URL em `.env` |
| `Token inválido`               | JWT expirou (7 dias)             |
| `403 - Permission denied`      | Usuário sem permissão            |

---

## 📞 Suporte

Se precisar de ajuda:

1. Verifique `backend/README.md`
2. Cheque `INTEGRATION.md` para integração frontend
3. Rode `npm run dev` e veja logs

---

## 🎉 Status

```
✅ Backend Criado
✅ Banco de Dados Configurado
✅ Autenticação Implementada
✅ Permissões Validadas
✅ API RESTful Completa

⏳ Próximo: Integração Frontend
```

Bora integrar o frontend! 🚀
