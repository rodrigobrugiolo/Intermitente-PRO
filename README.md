# Intermitente PRO

Plataforma full-stack para **gestão de vagas de trabalho intermitente**. Administradores e líderes publicam vagas, e os trabalhadores intermitentes se candidatam direto pelo painel, com regras de permissão e controle de lotação.

## Funcionalidades

- **Login com JWT** (token de 7 dias) e senhas protegidas com bcrypt.
- **Controle de acesso por papel:** Admin > Líder > Intermitente, validado no backend.
- **Gestão de usuários:** criação controlada pelo papel de quem cadastra.
- **Gestão de vagas:** admins e líderes criam vagas; intermitentes veem e pegam as vagas disponíveis.
- **Candidaturas com regras de negócio:** bloqueia candidatura em vaga lotada e candidatura duplicada.

## Stack

| Camada | Tecnologias |
| --- | --- |
| Frontend (`GERAL/`) | React, Vite, TypeScript |
| Backend (`backend/`) | Node.js, Express, TypeScript |
| Banco de dados | MongoDB (local ou Atlas) |
| Autenticação | JWT + bcrypt |
| Deploy | Configuração Nixpacks (`nixpacks.toml`) |

Modelos principais: `User`, `Vacancy`, `Application` e `News`.

## Arquitetura

```
Frontend React (:5173)  ──HTTP + JWT──▶  Backend Express (:5000)  ──▶  MongoDB
```

## API (principais rotas)

| Método | Rota | Descrição |
| --- | --- | --- |
| `POST` | `/api/login` | Autentica e devolve usuário + token |
| `POST` | `/api/users` | Cria usuário (Admin/Líder) |
| `GET` | `/api/vacancies` | Lista vagas |
| `POST` | `/api/vacancies` | Cria vaga (Admin/Líder) |
| `POST` | `/api/apply` | Candidatura do intermitente a uma vaga |

## Como rodar localmente

```bash
# Terminal 1: backend
cd backend
npm install
npm run dev

# Terminal 2: frontend
cd GERAL
npm install
npm run dev
```

Acesse `http://localhost:5173`.

Variáveis de ambiente:

- `backend/.env`: URI do MongoDB, `JWT_SECRET` e `FRONTEND_URL` (origem liberada no CORS).
- `GERAL/.env.local`: `VITE_API_URL` apontando para o backend.

## Documentação adicional

Guias na raiz do repositório: `QUICK_START.md`, `INTEGRATION.md`, `BACKEND_STATUS.md` e `SISTEMA_COMPLETO.md`.

## Roadmap

- [ ] Upload de foto de perfil
- [ ] Notificações por WhatsApp
- [ ] E-mail automático para candidatos
- [ ] Dashboard com gráficos
- [ ] Histórico de vagas e avaliação de trabalhadores
