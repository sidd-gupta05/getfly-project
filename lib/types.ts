export type UserRole = "ADMIN" | "MANAGER" | "WORKER";
export type ProjectStatus =
  | "PLANNED"
  | "ACTIVE"
  | "COMPLETED"
  | "ON_HOLD"
  | "CANCELLED";

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  phone?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: number;
  name: string;
  description?: string | null;
  startDate: Date;
  endDate?: Date | null;
  budget?: number | null;
  location?: string | null;
  status: ProjectStatus;
  createdById: number;
  createdAt: Date;
  updatedAt: Date;
  creator?: User;
}

export interface DailyReport {
  id: number;
  projectId: number;
  userId: number;
  date: Date;
  workDescription: string;
  weather?: string | null;
  workerCount: number;
  challenges?: string | null;
  materialsUsed?: string | null;
  equipmentUsed?: string | null;
  safetyIncidents?: string | null;
  nextDayPlan?: string | null;
  createdAt: Date;
  updatedAt: Date;
  project?: Project;
  user?: User;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface AuthResponse {
  token: string;
  user: Omit<User, "passwordHash">;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: UserRole;
}

export interface ProjectRequest {
  name: string;
  description?: string;
  startDate: string;
  endDate?: string;
  budget?: number;
  location?: string;
  status?: ProjectStatus;
}

export interface DPRRequest {
  date: string;
  workDescription: string;
  weather?: string;
  workerCount: number;
  challenges?: string;
  materialsUsed?: string;
  equipmentUsed?: string;
  safetyIncidents?: string;
  nextDayPlan?: string;
}

export interface JWTUserPayload {
  userId: number;
  email: string;
  role: UserRole;
}
