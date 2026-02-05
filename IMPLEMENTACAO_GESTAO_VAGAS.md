# Implementação - Gestão de Vagas Avançada

## Resumo das Alterações

Foram implementadas todas as funcionalidades solicitadas para a aba de **Gestão de Vagas**, permitindo que líderes e administradores criem vagas, insiram usuários manualmente e gerenciem candidaturas com controle de tempo.

---

## 🎯 Funcionalidades Implementadas

### 1. **Criação de Vagas por Líderes e Admins**

- Apenas **ADMIN** e **LEADER** podem criar vagas
- Modal com campos: Título, Descrição, Data/Hora de entrada, Data/Hora de saída, Valor (R$) e Quantidade de vagas
- Validações: data de saída deve ser posterior à de entrada

### 2. **Status de Vagas Expiradas**

- Vagas com data/hora de término abaixo da atual são marcadas como **EXPIRADA**
- Aparência visual diferenciada (opacidade reduzida) na listagem
- Lógica implementada no backend com função `getVacancyStatus()`

### 3. **Bloqueio de Candidatura com Menos de 30 Minutos**

- Usuários podem se candidatar **até 30 minutos antes do horário de início**
- Mensagem clara: "Faltam menos de 30 minutos para o início da vaga"
- Apenas líderes e administradores podem adicionar usuários manualmente nestes casos

### 4. **Inserção Manual de Usuários (Líderes/Admins)**

- **Novo botão** "Adicionar Usuário" na aba de Gestão de Vagas
- Modal com dropdown para selecionar usuário intermitente disponível
- A candidatura é criada automaticamente com status **APROVADO**
- Rastreamento: mostra quem inseriu manualmente e quando
- **Desabilitado para vagas expiradas**

### 5. **Visualização de Vagas Expiradas (Intermitentes)**

- Nova aba "Expiradas" em **Minhas Candidaturas**
- Mostra todas as vagas que passaram do horário de encerramento
- Separação clara entre vagas ativas, expiradas e histórico

---

## 📁 Arquivos Modificados

### Backend

#### `backend/src/models/Vacancy.ts`

- ✅ Adicionado status `EXPIRED` ao enum `VacancyStatus`

#### `backend/src/models/Application.ts`

- ✅ Adicionados campos:
  - `insertedManually: boolean` - indica inserção manual
  - `insertedByUserId: ObjectId` - referência ao usuário que inseriu
  - `insertedByUserName: string` - nome do usuário que inseriu

#### `backend/src/controllers/vacancyController.ts`

- ✅ Adicionada função `getVacancyStatus()` para determinar status (expirada/preenchida/aberta)
- ✅ Nova função `addUserToVacancy()` - POST endpoint para adicionar usuário manualmente
  - Validações: apenas ADMIN/LEADER, usuário deve ser INTERMITTENT
  - LEADER só pode adicionar em suas próprias vagas
- ✅ Nova função `getExpiredVacancies()` - GET endpoint para vagas expiradas
- ✅ Atualizado `getVacancies()` com lógica de expiração

#### `backend/src/controllers/applicationController.ts`

- ✅ Adicionada validação de 30 minutos em `applyToVacancy()`
- ✅ Verificação de vaga expirada
- ✅ Campo `insertedManually` inicializado como `false`
- ✅ Retorno de campos `insertedManually` e `insertedByUserName` em `getMyApplications()`

#### `backend/src/routes/vacancyRoutes.ts`

- ✅ Adicionada rota `POST /vacancies/add-user` - adicionar usuário manualmente
- ✅ Adicionada rota `GET /vacancies/expired` - obter vagas expiradas

### Frontend

#### `GERAL/src/services/api.ts`

- ✅ Adicionada função `apiAddUserToVacancy(vacancyId, userId)`
- ✅ Adicionada função `apiGetExpiredVacancies()`

#### `GERAL/pages/ManageApplications.tsx`

- ✅ Novo estado `showAddUserModal` para modal de inserção
- ✅ Novo estado `selectedUserToAdd` para usuário selecionado
- ✅ Função `loadUsers()` para carregar usuários intermitentes
- ✅ Função `handleAddUserToVacancy()` para submissão
- ✅ Função `getAvailableUsersForVacancy()` - filtra usuários não candidatados
- ✅ Função `isVacancyExpired()` - verifica se vaga está expirada
- ✅ **Novo botão** "Adicionar Usuário" no cabeçalho da área de candidatos
- ✅ **Novo modal** para seleção de usuário
- ✅ Indicador visual quando usuário foi adicionado manualmente
- ✅ Botão desabilitado para vagas expiradas

#### `GERAL/pages/MyApplications.tsx`

- ✅ Nova aba "Expiradas" com contador
- ✅ Funções auxiliares:
  - `isVacancyExpired()` - verifica se vaga passou do horário
  - `canStillApply()` - verifica se ainda há 30 min de antecedência
  - `getMinutesUntilStart()` - calcula minutos até início
- ✅ **Bloqueio visual** com ícone 🔒 para vagas com menos de 30 minutos
- ✅ Aviso em tempo real: "⏱️ X minutos para o início"
- ✅ Indicador quando usuário foi adicionado manualmente por leader/admin
- ✅ Separação clara de vagas ativas, expiradas e histórico

#### `GERAL/types.ts`

- ✅ Adicionado status `EXPIRED` ao enum `VacancyStatus`
- ✅ Adicionados campos à interface `Application`:
  - `insertedManually?: boolean`
  - `insertedByUserName?: string`
  - `endTime` ao `vacancySnapshot`

---

## 🔐 Regras de Segurança Implementadas

✅ **Permissões de Criação**: Apenas ADMIN e LEADER podem criar vagas
✅ **Exclusão de Vagas**: LEADER só deleta suas próprias vagas, ADMIN deleta qualquer uma
✅ **Inserção Manual**: LEADER só pode adicionar usuários em suas vagas
✅ **Tipo de Usuário**: Apenas INTERMITTENT pode ser adicionado manualmente
✅ **Validação de Candidatura**: Minutos restantes verificados no servidor

---

## 📊 Fluxo de Uso

### Para Líderes/Admins:

1. Acessam aba "Gestão de Vagas"
2. Clicam em **+** para criar nova vaga
3. Preenchem dados e publicam
4. Selecionam vaga criada
5. Clicam em **"Adicionar Usuário"** para inserção manual
6. Escolhem intermitente disponível
7. Sistema aprova automaticamente a candidatura

### Para Intermitentes:

1. Acessam aba "Minhas Candidaturas"
2. Veem vagas ativas, expiradas e histórico
3. Se vaga tiver menos de 30 min: veem bloqueio 🔒
4. Aviso em tempo real sobre minutos restantes
5. Podem cancelar candidaturas pendentes (com restrições de 4 horas)

---

## ✨ Melhorias Visuais

- 🎨 Ícones do Lucide React integrados (Lock, UserPlus, AlertTriangle)
- 📱 Design responsivo em todas as telas
- 🌙 Suporte a tema escuro (dark mode)
- ✅ Notificações toast para ações bem-sucedidas
- ⏱️ Contador de minutos em tempo real
- 📌 Indicadores visuais de bloqueio e inserção manual

---

## 🚀 Como Testar

1. **Criar Vaga**: Login como LEADER/ADMIN → Gestão de Vagas → + → Preencher formulário
2. **Adicionar Usuário Manual**: Selecionar vaga → Adicionar Usuário → Escolher intermitente
3. **Testar Bloqueio 30min**: Criar vaga com início em 15 minutos → Tentar candidatar como intermitente
4. **Ver Expiradas**: Login como intermitente → Minhas Candidaturas → Aba "Expiradas"

---

## ✅ Checklist de Requisitos

- ✅ Líderes e admins podem criar vagas
- ✅ Vagas abaixo do dia/horário atual vão para "expiradas"
- ✅ Bloqueio de candidatura com menos de 30 minutos
- ✅ Apenas LEADER/ADMIN podem inserir manualmente
- ✅ Campo de ação sempre disponível para LEADER/ADMIN
- ✅ Intermitentes veem vagas expiradas separadas
- ✅ Rastreamento de quem inseriu manualmente
- ✅ Indicadores visuais e mensagens claras

---

**Status**: ✅ Implementação Completa
**Data**: 4 de Fevereiro de 2026
