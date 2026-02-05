# 🔥 RODAR O SISTEMA - Passo a Passo

## PASSO 1: Preparar MongoDB

### Opção A: MongoDB Atlas (Recomendado)

1. Acesse: https://www.mongodb.com/cloud/atlas
2. Crie conta grátis (não precisa cartão de crédito!)
3. Crie um cluster "M0" (gratuito)
4. Aguarde cluster ser criado (5 minutos)
5. Clique em "CONNECT"
6. Selecione "Connect your application"
7. Copie a string de conexão

Exemplo:

```
mongodb+srv://seu-email:sua-senha@cluster.mongodb.net/intermitente?retryWrites=true&w=majority
```

8. **Abra:** `backend/.env`
9. **Cole em:** `MONGODB_URI=mongodb+srv://...`

### Opção B: MongoDB Local (Windows)

```bash
# Baixe em: https://www.mongodb.com/try/download/community

# Instale com defaults
# Depois use no backend/.env:
MONGODB_URI=mongodb://localhost:27017/intermitente
```

---

## PASSO 2: Abrir 2 Terminais

### Terminal 1: Backend

```bash
# Navegue até backend
cd "c:\Users\rbrug\Downloads\Intermitente PRO - APP\backend"

# Instale dependências (primeira vez)
npm install

# Inicie servidor
npm run dev
```

**Você verá:**

```
✅ MongoDB conectado
🚀 Servidor rodando em http://localhost:5000
```

✅ **Deixe rodando!**

---

### Terminal 2: Frontend

```bash
# Em OUTRO terminal, navegue até frontend
cd "c:\Users\rbrug\Downloads\Intermitente PRO - APP\GERAL"

# Instale dependências (primeira vez)
npm install

# Inicie frontend
npm run dev
```

**Você verá:**

```
  ➜  Local:   http://localhost:5173/
  ➜  Press h to show help
```

---

## PASSO 3: Acessar o Sistema

Abra seu navegador e acesse:

### http://localhost:5173

---

## PASSO 4: Testar com Contas

### Login como ADMIN:

- Email: **admin@empresa.com**
- Senha: **mude1234**

✅ Você pode:

- Criar ADMINs e LÍDERs
- Deletar qualquer vaga
- Gerenciar candidatos

---

### Login como LÍDER:

- Email: **lider@empresa.com**
- Senha: **mude1234**

✅ Você pode:

- Criar Intermitentes
- Criar vagas
- Deletar suas vagas
- Gerenciar candidatos

---

### Login como INTERMITENTE:

- Email: **joao@worker.com**
- Senha: **mude1234**

✅ Você pode:

- Ver vagas
- Se candidatar
- Atualizar perfil

---

## PASSO 5: Testar Funcionalidades

### 1️⃣ Criar Novo Usuário

1. Login como ADMIN
2. Menu → "Gestão de Usuários"
3. Clique em "+" (Novo Usuário)
4. Preencha: Nome, Email, Telefone, Senha, Papel
5. Clique "Salvar Usuário"
6. ✅ Usuário criado no MongoDB!

### 2️⃣ Criar Vaga

1. Login como LÍDER
2. Menu → "Gestão de Vagas"
3. Clique em "+" (Nova Vaga)
4. Preencha: Título, Descrição, Data/Hora, Valor, Qtd
5. Clique "Publicar Vaga"
6. ✅ Vaga criada!

### 3️⃣ Se Candidatar

1. Login como INTERMITENTE
2. Menu → "Mural de Vagas"
3. Clique em vaga
4. Clique "Pegar Vaga"
5. ✅ Candidatura registrada!

### 4️⃣ Aprovar Candidato

1. Login como LÍDER
2. Menu → "Gestão de Vagas"
3. Selecione vaga com candidatos
4. Clique ✅ (aprovar) ou ❌ (rejeitar)
5. ✅ Status atualizado!

### 5️⃣ Deletar Vaga

1. Login como ADMIN/LÍDER
2. Menu → "Gestão de Vagas"
3. Passe mouse sobre vaga
4. Clique no 🗑️ (deletar)
5. ✅ Vaga deletada!

---

## PASSO 6: Verificar no Console

### Frontend (Abra DevTools - F12)

- Vá para aba "Console"
- Você verá as requisições HTTP sendo feitas
- **Network tab** mostra chamadas para http://localhost:5000/api

### Backend

- Terminal do backend mostra:

```
GET /api/vacancies
POST /api/users
DELETE /api/vacancies/123
```

---

## PASSO 7: Verificar MongoDB

### MongoDB Atlas

1. Acesse https://cloud.mongodb.com
2. Clique em "Database"
3. Selecione seu cluster
4. Clique em "Browse Collections"
5. Veja as collections: users, vacancies, applications, news

---

## 🎯 Se Algo Não Funcionar

### Erro: "Cannot connect to backend"

```
→ Verifique se backend está rodando (Terminal 1)
→ Veja se está em http://localhost:5000
→ Tente acessar http://localhost:5000/health
```

### Erro: "MongoDB conectado failed"

```
→ Verifique MONGODB_URI em backend/.env
→ Confirme string de conexão (sem espaços)
→ Adicione seu IP à whitelist no MongoDB Atlas
```

### Erro de Login "Email ou senha incorretos"

```
→ Verifique que está usando emails corretos:
   admin@empresa.com
   lider@empresa.com
   joao@worker.com
```

### Dados não aparecem após criar

```
→ Recarregue a página (F5)
→ Verifique console (F12) para erros
→ Verifique Terminal 1 (backend) para logs
```

---

## 🏁 Status Final

Se tudo funcionar, você terá:

- ✅ **Frontend React** rodando em localhost:5173
- ✅ **Backend Node.js** rodando em localhost:5000
- ✅ **MongoDB** armazenando dados
- ✅ **JWT** autenticação funcionando
- ✅ **Permissões** sendo validadas
- ✅ **API** comunicando com banco

---

## 📝 Próximas Etapas (Quando Pronto)

1. **Deploy Backend:**
   - Railway.app (recomendado)
   - Render.com
   - Heroku

2. **Deploy Frontend:**
   - GitHub Pages
   - Vercel
   - Netlify

3. **Domínio customizado**
4. **SSL/HTTPS**
5. **Email/WhatsApp real**

---

## 🎉 Parabéns!

Você tem um **sistema profissional full-stack** rodando localmente!

**Sistema está funcionando?** 👍

Se precisar de ajuda, é só chamar! 🚀
