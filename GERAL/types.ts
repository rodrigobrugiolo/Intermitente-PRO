export enum UserRole {
  ADMIN = "ADMIN",
  LEADER = "LEADER",
  INTERMITTENT = "INTERMITTENT",
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  password?: string; // Added for Mock DB storage
  // Profile Fields
  cpf?: string;
  address?: string;
  pixKey?: string;
  profilePic?: string; // URL or base64 placeholder
}

export enum VacancyStatus {
  OPEN = "aberta",
  FILLED = "preenchida",
  CANCELED = "cancelada",
  EXPIRED = "expirada",
}

export interface Vacancy {
  id: number;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  value: number;
  status: VacancyStatus;
  totalSpots: number;
  filledSpots: number; // Includes Approved AND Pending (Reserved)
  approvedCount?: number;
  pendingCount?: number;
  duration?: number; // Duration in hours
  creatorId: number;
  creatorName?: string;
}

export enum ApplicationStatus {
  PENDING = "pendente",
  APPROVED = "aprovado",
  REJECTED = "rejeitado",
  CANCELED = "cancelado_pelo_usuario",
}

export interface Application {
  id: number;
  vacancyId: number;
  userId: number;
  userName: string;
  userPhone: string;
  userProfilePic?: string;
  status: ApplicationStatus;
  insertedManually?: boolean;
  insertedByUserName?: string;
  processedByUserName?: string;
  processedAt?: string;
  createdAt: string;
  vacancySnapshot?: {
    // To show info even if vacancy changes
    title: string;
    startTime: string;
    endTime: string;
    value: number;
  };
}

export interface NewsPost {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  authorName: string;
  authorRole: UserRole;
}

export interface AuthState {
  user: User | null;
  token: string | null;
}

export type Language = "pt" | "en" | "es";
