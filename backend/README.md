# Backend - Intermitente PRO

## 🚀 Setup

### 1. Instalar dependências

```bash
cd backend
npm install
```

### 2. Configurar MongoDB

#### Opção A: MongoDB Atlas (Recomendado - Gratuito)

1. Acesse [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Crie uma conta grátis
3. Crie um cluster gratuito (M0)
4. Vá em Database → Connect
5. Copie a string de conexão
6. Cole em `.env` como `MONGODB_URI`

Exemplo:

```
MONGODB_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/intermitente?retryWrites=true&w=majority
```

#### Opção B: MongoDB Local

```bash
# Instale MongoDB localmente
# Windows: https://docs.mongodb.com/manual/tutorial/install-mongodb-on-windows/

# Linux (Ubuntu):
sudo apt-get install -y mongodb

# macOS (Brew):
brew install mongodb-community

# Inicie o servidor
mongod

# Use no .env:
MONGODB_URI=mongodb://localhost:27017/intermitente
```

### 3. Configurar variáveis de ambiente

Edite `.env`:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=seu_mongodb_uri_aqui
JWT_SECRET=sua_chave_super_secreta_2024
FRONTEND_URL=http://localhost:5173
```

### 4. Iniciar servidor em desenvolvimento

```bash
npm run dev
```

Você verá:

```
✅ MongoDB conectado
🚀 Servidor rodando em http://localhost:5000
```

---

## 📝 Endpoints da API

### Autenticação

- `POST /api/login` - Login (sem autenticação)

### Usuários

- `POST /api/users` - Criar usuário (autenticado)
- `GET /api/users` - Listar usuários (autenticado)
- `PUT /api/users/:id` - Atualizar usuário (autenticado)
- `PUT /api/profile` - Atualizar perfil próprio (autenticado)

### Vagas

- `GET /api/vacancies` - Listar vagas (público)
- `GET /api/my-vacancies` - Minhas vagas (autenticado)
- `POST /api/vacancies` - Criar vaga (autenticado)
- `DELETE /api/vacancies/:id` - Deletar vaga (autenticado)
- `GET /api/vacancies/:vacancyId/applications` - Candidatos da vaga (autenticado)
- `PUT /api/applications/:id/status` - Atualizar status (autenticado)

### Candidaturas

- `POST /api/apply` - Se candidatar (autenticado)
- `GET /api/my-applications` - Minhas candidaturas (autenticado)
- `PUT /api/applications/:id/cancel` - Cancelar candidatura (autenticado)

### Notícias

- `GET /api/news` - Listar notícias (público)
- `POST /api/news` - Criar notícia (autenticado)

---

## 🧪 Testar com Postman

### 1. Fazer Login

```
POST http://localhost:5000/api/login
Body (JSON):
{
  "email": "admin@empresa.com",
  "password": "mude1234"
}
```

Você receberá um `token`. Copie-o.

### 2. Usar o Token

Em cada requisição autenticada, adicione no header:

```
Authorization: Bearer SEU_TOKEN_AQUI
```

---

## 📦 Build para Produção

```bash
npm run build
npm start
```

O arquivo compilado estará em `dist/server.js`.

---

## 🌐 Deploy

### Railway (Recomendado)

1. Crie conta em [railway.app](https://railway.app)
2. Conecte seu repositório GitHub
3. Selecione a pasta `backend/`
4. Configure variáveis de ambiente
5. Deploy automático!

### Vercel

1. Deploy via Vercel Functions (serverless)
2. Configure Node.js runtime

### Heroku

```bash
heroku create seu-app-name
git push heroku main
```

---

## 🔐 Notas de Segurança

- ✅ Senhas são hasheadas com bcrypt
- ✅ Autenticação via JWT (7 dias de validade)
- ✅ CORS configurado apenas para frontend autorizado
- ❌ Nunca commite `.env` com valores reais
- ❌ Mude `JWT_SECRET` em produção para algo seguro

---

## 🐛 Troubleshooting

**Erro: "MongoDB conectado failed"**

- Verifique a string de conexão em `.env`
- Confirme que você tem internet
- Adicione seu IP à whitelist no MongoDB Atlas

**Erro: "ECONNREFUSED"**

- Backend não está rodando
- Execute `npm run dev`

**Erro: "CORS error"**

- Frontend URL não está correta em `.env`
- Verifique `FRONTEND_URL`

---

## 📚 Documentação

- Express: [expressjs.com](https://expressjs.com)
- MongoDB: [mongodb.com/docs](https://docs.mongodb.com)
- Mongoose: [mongoosejs.com](https://mongoosejs.com)
- JWT: [jwt.io](https://jwt.io)
