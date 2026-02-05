# 🚀 SETUP COMPLETO - Intermitente PRO

## ⚡ Quick Start (5 minutos)

### Opção Rápida: Execute este arquivo

Se estiver no **Windows**:

```bash
# No PowerShell como Administrador
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Depois, crie um arquivo `start.ps1` na raiz do projeto e execute:

```powershell
.\start.ps1
```

### Opção Manual: Passo a Passo

#### 1️⃣ Preparar Backend

```bash
cd backend
npm install
```

**Abra `backend/.env` e configure:**

```env
MONGODB_URI=mongodb+srv://seu-usuario:sua-senha@seu-cluster.mongodb.net/intermitente?retryWrites=true&w=majority
JWT_SECRET=chave-super-segura-2024
```

#### 2️⃣ Iniciar Backend (Terminal 1)

```bash
cd backend
npm run dev
```

Você verá:

```
✅ MongoDB conectado
🚀 Servidor rodando em http://localhost:5000
```

#### 3️⃣ Preparar Frontend (Em outro terminal)

```bash
cd GERAL
npm install
```

#### 4️⃣ Iniciar Frontend (Terminal 2)

```bash
cd GERAL
npm run dev
```

Você verá:

```
  ➜  Local:   http://localhost:5173/
```

---

## ✅ Contas de Teste

| Papel               | Email             | Senha    |
| ------------------- | ----------------- | -------- |
| 🔴 **Admin**        | admin@empresa.com | mude1234 |
| 🟠 **Líder**        | lider@empresa.com | mude1234 |
| 🟡 **Intermitente** | joao@worker.com   | mude1234 |

---

## 🧪 Testar Funcionalidades

### 1. Login como Admin

- Acesse http://localhost:5173
- Login com admin@empresa.com
- Clique em "Gestão de Usuários"
- Crie um novo usuário

### 2. Criar Vagas

- Login como Líder
- Vá para "Gestão de Vagas"
- Clique em "+" para criar vaga

### 3. Candidatar-se

- Login como Intermitente
- Vá para "Mural de Vagas"
- Clique em "Pegar Vaga"

### 4. Gerenciar Candidatos

- Login como Líder
- Vá para "Gestão de Vagas"
- Selecione uma vaga
- Aprove/Rejeite candidatos

---

## 🔗 Integração Funcionando

✅ Frontend chamando Backend via HTTP
✅ JWT armazenado no localStorage
✅ Validações de permissão funcionando
✅ MongoDB persistindo dados

---

## 🐛 Troubleshooting

**"MongoDB conectado failed"**

```
→ Verifique MONGODB_URI em backend/.env
→ Confirme IP whitelist no MongoDB Atlas
```

**"Cannot connect to backend"**

```
→ Confirme que backend está rodando na porta 5000
→ Verifique VITE_API_URL em GERAL/.env.local
```

**"Token inválido"**

```
→ Faça logout e login novamente
→ Limpe localStorage do navegador
```

---

## 📱 Compilar para Produção

### Frontend (GitHub Pages)

```bash
cd GERAL
npm run build
npm run deploy
```

### Backend (Railway/Render/Vercel)

```bash
cd backend
npm run build
```

---

## 🎯 Status da Integração

```
✅ API Client criado (api.ts)
✅ App.tsx usando JWT
✅ Login integrado
✅ Logout integrado
✅ Variáveis de ambiente configuradas
⏳ Próximo: Integrar componentes individuais
```

**Sistema está funcionando full? Digite seu email de teste para confirmar!** 🎉
