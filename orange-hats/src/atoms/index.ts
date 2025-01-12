import { atom } from "jotai";
import {
  AuditorSortState,
  AuditSortState,
  ResearchSortState,
  LoadingStates,
  PaginationState,
  SecurityToolSortState,
} from "./types";
import { Audit, Auditor, Research, SecurityTool } from "@prisma/client";

export const isAuthenticatedAtom = atom(false);
export const adminTokenAtom = atom<string | null>(null);

export const loadingStatesAtom = atom<LoadingStates>({
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
});

export const auditPaginationAtom = atom<PaginationState>({
  page: 1,
  limit: 20,
});

export const auditorPaginationAtom = atom<PaginationState>({
  page: 1,
  limit: 20,
});

export const researchPaginationAtom = atom<PaginationState>({
  page: 1,
  limit: 20,
});

export const securityToolPaginationAtom = atom<PaginationState>({
  page: 1,
  limit: 20,
});

export const selectedAuditAtom = atom<Audit | null>(null);
export const selectedAuditorAtom = atom<Auditor | null>(null);
export const selectedResearchAtom = atom<Research | null>(null);
export const selectedSecurityToolAtom = atom<SecurityTool | null>(null);

export const errorAtom = atom<{
  message: string | null;
  code?: string;
} | null>(null);

export const searchQueryAtom = atom<string>("");
export const searchResultsAtom = atom<any[]>([]);

const defaultAuditSort: AuditSortState = {
  field: "publishedAt",
  direction: "desc",
};

const defaultAuditorSort: AuditorSortState = {
  field: "name",
  direction: "asc",
};

const defaultResearchSort: ResearchSortState = {
  field: "publishedAt",
  direction: "desc",
};

const defaultSecurityToolSort: SecurityToolSortState = {
  field: "name",
  direction: "asc",
};

export const auditSortAtom = atom<AuditSortState>(defaultAuditSort);
export const auditorSortAtom = atom<AuditorSortState>(defaultAuditorSort);
export const researchSortAtom = atom<ResearchSortState>(defaultResearchSort);
export const securityToolSortAtom = atom<SecurityToolSortState>(
  defaultSecurityToolSort
);

export const currentRouteAtom = atom<string>("/");
export const isMobileMenuOpenAtom = atom<boolean>(false);

type ApplicationType = "audit" | "auditor" | "grant";

export const selectedTypeAtom = atom<ApplicationType>("audit");
