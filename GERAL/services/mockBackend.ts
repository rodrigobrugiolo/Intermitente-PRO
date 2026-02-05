import {
  User,
  UserRole,
  Vacancy,
  VacancyStatus,
  Application,
  ApplicationStatus,
  NewsPost,
} from "../types";

/**
 * MOCK DATABASE
 */
let MOCK_USERS: User[] = [
  {
    id: 1,
    name: "Administrador",
    email: "admin@empresa.com",
    phone: "5511999990000",
    role: UserRole.ADMIN,
    password: "mude1234",
    cpf: "000.000.000-00",
    address: "HQ",
    pixKey: "admin@pix",
  },
  {
    id: 2,
    name: "Carlos Líder",
    email: "lider@empresa.com",
    phone: "5511999991111",
    role: UserRole.LEADER,
    password: "mude1234",
    cpf: "111.111.111-11",
    address: "Branch 1",
    pixKey: "carlos@pix",
  },
  // João starts with incomplete profile to test gating
  {
    id: 3,
    name: "João Intermitente",
    email: "joao@worker.com",
    phone: "5511988887777",
    role: UserRole.INTERMITTENT,
    password: "mude1234",
    profilePic:
      "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=100&auto=format&fit=crop",
  },
  {
    id: 4,
    name: "Maria Intermitente",
    email: "maria@worker.com",
    phone: "5511977776666",
    role: UserRole.INTERMITTENT,
    password: "mude1234",
    cpf: "333.333.333-33",
    address: "Rua B",
    pixKey: "maria@pix",
    profilePic:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop",
  },
];

let MOCK_VACANCIES: Vacancy[] = [
  {
    id: 101,
    title: "Auxiliar de Eventos",
    description: "Apoio na recepção do evento corporativo.",
    startTime: "2023-11-20T14:00:00", // Date in the past
    endTime: "2023-11-20T22:00:00",
    value: 150.0,
    status: VacancyStatus.OPEN,
    totalSpots: 5,
    filledSpots: 0,
    creatorId: 2,
    creatorName: "Carlos Líder",
  },
  {
    id: 102,
    title: "Carga e Descarga",
    description: "Auxiliar na descarga de caminhão.",
    startTime: "2024-11-21T08:00:00", // Future date for testing
    endTime: "2024-11-21T12:00:00",
    value: 120.0,
    status: VacancyStatus.OPEN,
    totalSpots: 2,
    filledSpots: 0,
    creatorId: 2,
    creatorName: "Carlos Líder",
  },
  {
    id: 103,
    title: "Recepcionista Extra",
    description: "Cobrir folga na portaria.",
    startTime: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    endTime: new Date(Date.now() + 96400000).toISOString(),
    value: 200.0,
    status: VacancyStatus.OPEN,
    totalSpots: 1,
    filledSpots: 0,
    creatorId: 2,
    creatorName: "Carlos Líder",
  },
];

let MOCK_APPLICATIONS: Application[] = [];

let MOCK_NEWS: NewsPost[] = [
  {
    id: 1,
    title: "Processo Seletivo Interno - Supervisor",
    content:
      "Estamos abrindo vagas para supervisor de equipe. Interessados enviem currículo para o RH.",
    createdAt: new Date().toISOString(),
    authorName: "Administrador",
    authorRole: UserRole.ADMIN,
  },
];

export const sendWhatsAppConfirmation = (
  phone: string,
  message: string,
): void => {
  console.log(
    `%c[WhatsApp API] Sending to ${phone}:`,
    "color: green; font-weight: bold;",
    message,
  );
};

export const mockLogin = async (
  email: string,
  password: string,
): Promise<User | null> => {
  await new Promise((resolve) => setTimeout(resolve, 800)); // Simulate network latency

  const user = MOCK_USERS.find((u) => u.email === email);

  if (user) {
    // Validate Password
    if (user.password === password) {
      return user;
    }
  }

  return null;
};

// USER MANAGEMENT FUNCTIONS
export const getUsers = async (): Promise<User[]> => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return [...MOCK_USERS];
};

export const createUser = async (
  user: Omit<User, "id"> & { password?: string },
  createdBy?: User,
): Promise<User> => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Validation: Check permissions based on creator role
  if (createdBy) {
    if (createdBy.role === UserRole.INTERMITTENT) {
      throw new Error("Intermitentes não podem criar usuários.");
    }

    if (createdBy.role === UserRole.LEADER) {
      // Líder só pode criar INTERMITTENT
      if (user.role !== UserRole.INTERMITTENT) {
        throw new Error(
          "Líderes só podem criar usuários do tipo Intermitente.",
        );
      }
    }

    if (createdBy.role === UserRole.ADMIN) {
      // Admin pode criar ADMIN, LEADER ou INTERMITTENT
      // Sem restrições
    }
  }

  // In this updated version, we actually STORE the password in the mock DB array
  const newUser = {
    ...user,
    id: Math.floor(Math.random() * 10000),
    // If password is provided use it, otherwise default (should be provided by form)
    password: user.password || "mude1234",
  };

  MOCK_USERS.push(newUser);
  return newUser;
};

export const updateUser = async (
  id: number,
  updates: Partial<User>,
): Promise<User> => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const idx = MOCK_USERS.findIndex((u) => u.id === id);
  if (idx === -1) throw new Error("User not found");
  MOCK_USERS[idx] = { ...MOCK_USERS[idx], ...updates };
  return MOCK_USERS[idx];
};

export const updateUserProfile = async (
  userId: number,
  data: Partial<User>,
): Promise<User> => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  const idx = MOCK_USERS.findIndex((u) => u.id === userId);
  if (idx === -1) throw new Error("Usuário não encontrado");

  MOCK_USERS[idx] = { ...MOCK_USERS[idx], ...data };
  return MOCK_USERS[idx];
};

export const getVacancies = async (): Promise<Vacancy[]> => {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const vacanciesWithCounts = MOCK_VACANCIES.map((v) => {
    // Count only active reservations (Approved or Pending)
    // Canceled applications do NOT count, freeing up the spot.
    const reservedCount = MOCK_APPLICATIONS.filter(
      (a) =>
        a.vacancyId === v.id &&
        (a.status === ApplicationStatus.APPROVED ||
          a.status === ApplicationStatus.PENDING),
    ).length;

    return {
      ...v,
      filledSpots: reservedCount,
      status: reservedCount >= v.totalSpots ? VacancyStatus.FILLED : v.status,
    };
  });

  return vacanciesWithCounts.sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
  );
};

export const createVacancy = async (
  vacancy: Omit<Vacancy, "id" | "creatorName" | "filledSpots" | "status">,
  creator: User,
): Promise<Vacancy> => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Validation: Only ADMIN and LEADER can create vacancies
  if (creator.role === UserRole.INTERMITTENT) {
    throw new Error("Apenas Administradores e Líderes podem criar vagas.");
  }

  const newVacancy: Vacancy = {
    ...vacancy,
    id: Math.floor(Math.random() * 10000),
    status: VacancyStatus.OPEN,
    filledSpots: 0,
    creatorName: creator.name,
  };
  MOCK_VACANCIES = [newVacancy, ...MOCK_VACANCIES];
  return newVacancy;
};

export const getMyApplications = async (
  userId: number,
): Promise<Application[]> => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return MOCK_APPLICATIONS.filter((a) => a.userId === userId).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
};

export const applyToVacancy = async (
  vacancyId: number,
  user: User,
): Promise<Application> => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  // 1. CHECK PROFILE COMPLETENESS (Gating)
  const freshUser = MOCK_USERS.find((u) => u.id === user.id);
  if (!freshUser) throw new Error("Usuário inválido.");

  if (
    !freshUser.cpf ||
    !freshUser.address ||
    !freshUser.pixKey ||
    !freshUser.phone
  ) {
    throw new Error("PROFILE_INCOMPLETE");
  }

  // 2. CHECK VACANCY
  const vacancy = (await getVacancies()).find((v) => v.id === vacancyId);
  if (!vacancy) throw new Error("Vaga não encontrada.");
  if (
    vacancy.status !== VacancyStatus.OPEN &&
    vacancy.status !== VacancyStatus.FILLED
  )
    throw new Error("Vaga cancelada.");
  if (vacancy.filledSpots >= vacancy.totalSpots)
    throw new Error("Ops! Alguém pegou essa vaga agora mesmo.");

  const exists = MOCK_APPLICATIONS.find(
    (a) =>
      a.vacancyId === vacancyId &&
      a.userId === user.id &&
      a.status !== ApplicationStatus.CANCELED &&
      a.status !== ApplicationStatus.REJECTED,
  );
  if (exists) throw new Error("Você já se candidatou para esta vaga.");

  const newApp: Application = {
    id: Math.floor(Math.random() * 10000),
    vacancyId,
    userId: user.id,
    userName: user.name,
    userPhone: user.phone,
    userProfilePic: user.profilePic,
    status: ApplicationStatus.PENDING,
    createdAt: new Date().toISOString(),
    vacancySnapshot: {
      title: vacancy.title,
      startTime: vacancy.startTime,
      endTime: vacancy.endTime,
      value: vacancy.value,
    },
  };
  MOCK_APPLICATIONS = [...MOCK_APPLICATIONS, newApp];
  return newApp;
};

export const cancelApplication = async (
  applicationId: number,
  userId: number,
): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 400));
  const idx = MOCK_APPLICATIONS.findIndex((a) => a.id === applicationId);
  if (idx === -1) throw new Error("Candidatura não encontrada");

  if (MOCK_APPLICATIONS[idx].userId !== userId)
    throw new Error("Não autorizado");

  // 4-Hour Rule Implementation
  const app = MOCK_APPLICATIONS[idx];
  const vacancy = MOCK_VACANCIES.find((v) => v.id === app.vacancyId);

  if (vacancy) {
    const startTime = new Date(vacancy.startTime).getTime();
    const now = new Date().getTime();
    const hoursUntilStart = (startTime - now) / (1000 * 60 * 60);

    if (hoursUntilStart < 4) {
      throw new Error("CANCEL_TOO_LATE");
    }
  }

  MOCK_APPLICATIONS[idx] = {
    ...MOCK_APPLICATIONS[idx],
    status: ApplicationStatus.CANCELED,
  };
};

export const getApplicationsForVacancy = async (
  vacancyId: number,
): Promise<Application[]> => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return MOCK_APPLICATIONS.filter(
    (a) => a.vacancyId === vacancyId && a.status !== ApplicationStatus.CANCELED,
  );
};

export const updateApplicationStatus = async (
  applicationId: number,
  newStatus: ApplicationStatus,
): Promise<Application> => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const appIndex = MOCK_APPLICATIONS.findIndex((a) => a.id === applicationId);
  if (appIndex === -1) throw new Error("Candidatura não encontrada");

  const app = MOCK_APPLICATIONS[appIndex];
  const updatedApp = { ...app, status: newStatus };
  MOCK_APPLICATIONS[appIndex] = updatedApp;

  if (newStatus === ApplicationStatus.APPROVED) {
    const vacancy = MOCK_VACANCIES.find((v) => v.id === app.vacancyId);
    const vacancyTitle = vacancy ? vacancy.title : "Trabalho";
    const message = `Olá ${app.userName}, sua vaga para *${vacancyTitle}* foi confirmada pelo Líder! Compareça no horário agendado.`;
    sendWhatsAppConfirmation(app.userPhone, message);
  }

  return updatedApp;
};

export const getNews = async (): Promise<NewsPost[]> => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return [...MOCK_NEWS].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
};

export const createNews = async (
  post: Omit<NewsPost, "id" | "createdAt" | "authorName" | "authorRole">,
  user: User,
): Promise<NewsPost> => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  const newPost: NewsPost = {
    ...post,
    id: Math.floor(Math.random() * 10000),
    createdAt: new Date().toISOString(),
    authorName: user.name,
    authorRole: user.role,
  };
  MOCK_NEWS = [newPost, ...MOCK_NEWS];
  return newPost;
};

export const deleteVacancy = async (
  vacancyId: number,
  user: User,
): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 400));

  // Validação de permissão: apenas ADMIN ou LEADER podem deletar
  if (user.role !== UserRole.ADMIN && user.role !== UserRole.LEADER) {
    throw new Error("Você não tem permissão para deletar vagas.");
  }

  const vacancyIndex = MOCK_VACANCIES.findIndex((v) => v.id === vacancyId);
  if (vacancyIndex === -1) {
    throw new Error("Vaga não encontrada");
  }

  // Se for LEADER, validar se é o criador da vaga
  const vacancy = MOCK_VACANCIES[vacancyIndex];
  if (user.role === UserRole.LEADER && vacancy.creatorId !== user.id) {
    throw new Error("Você só pode deletar vagas que criou.");
  }

  // Remover a vaga
  MOCK_VACANCIES.splice(vacancyIndex, 1);

  // Cancelar todas as candidaturas associadas
  const relatedApps = MOCK_APPLICATIONS.filter(
    (a) => a.vacancyId === vacancyId,
  );
  relatedApps.forEach((app) => {
    const appIdx = MOCK_APPLICATIONS.findIndex((a) => a.id === app.id);
    if (appIdx !== -1) {
      MOCK_APPLICATIONS[appIdx] = {
        ...MOCK_APPLICATIONS[appIdx],
        status: ApplicationStatus.CANCELED,
      };
    }
  });
};
