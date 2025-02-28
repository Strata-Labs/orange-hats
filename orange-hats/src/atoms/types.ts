import { SecurityTool } from "@prisma/client";

export type SortDirection = "asc" | "desc";

export interface SortState {
  field: string;
  direction: SortDirection;
}

export type AuditSortField =
  | "protocol"
  | "publishedAt"
  | "createdAt"
  | "auditors";

export type AuditorSortField = "name" | "team" | "createdAt";

export type ResearchSortField = "protocol" | "type" | "publishedAt";

export type SecurityToolSortField = "name" | "createdBy" | "createdAt";

export interface AuditSortState extends SortState {
  field: AuditSortField;
}

export interface AuditorSortState extends SortState {
  field: AuditorSortField;
}

export interface ResearchSortState extends SortState {
  field: ResearchSortField;
}

export interface SecurityToolSortState extends SortState {
  field: SecurityToolSortField;
}

export interface PaginationState {
  page: number;
  limit: number;
  search?: string;
}

export interface PaginationMetadata {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  metadata: PaginationMetadata;
}

export interface LoadingStates {
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
}

export interface SecurityToolWithSignedUrl extends SerializedSecurityTool {
  signedImageUrl: string | null;
}

export interface SerializedSecurityTool {
  id: string;
  name: string;
  description: string;
  securityUrl: string | null;
  imageUrl: string | null;
  imageKey: string | null;
  createdAt: string;
  updatedAt: string;
}
