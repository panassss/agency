export type Role = 'USER' | 'ADMIN';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export type ServiceIcon = 'content' | 'graphic' | 'digital' | 'web' | 'it' | 'brand';

export interface Service {
  id: number;
  slug: string;
  title: string;
  shortDescription: string;
  description: string;
  icon: ServiceIcon;
  order: number;
  createdAt: string;
  projectsCount?: number;
}

export interface ServiceRef {
  id: number;
  slug: string;
  title: string;
}

export interface Project {
  id: number;
  slug: string;
  title: string;
  subtitle: string;
  serviceId: number;
  service: ServiceRef;
  client: string;
  location: string;
  date: string;
  coverImage: string;
  gallery: string[];
  challenge: string;
  solution: string;
  result: string;
  featured: boolean;
  createdAt: string;
}

export interface ProjectDetail extends Project {
  related: Project[];
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TeamMember {
  id: number;
  name: string;
  position: string;
  photo: string;
  facebook?: string | null;
  instagram?: string | null;
  linkedin?: string | null;
  order: number;
}

export interface Testimonial {
  id: number;
  author: string;
  position: string;
  quote: string;
  avatar: string;
}

export type RequestStatus = 'NEW' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED';

export interface ClientRequest {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  message: string;
  status: RequestStatus;
  serviceId?: number | null;
  service?: ServiceRef | null;
  userId?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface RequestPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  message: string;
  serviceId?: number;
}

export interface AdminStats {
  projects: number;
  services: number;
  users: number;
  subscribers: number;
  requests: Record<RequestStatus | 'total', number>;
}

export const REQUEST_STATUS_LABELS: Record<RequestStatus, string> = {
  NEW: 'Нова',
  IN_PROGRESS: 'В роботі',
  DONE: 'Виконана',
  CANCELLED: 'Скасована',
};
