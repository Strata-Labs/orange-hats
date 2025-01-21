import { z } from "zod";

const basePaginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  search: z.string().optional(),
});

const sortDirectionSchema = z.enum(["asc", "desc"]);

const auditSortFields = [
  "protocol",
  "publishedAt",
  "createdAt",
  "auditors",
] as const;
const auditorSortFields = ["name", "team", "createdAt"] as const;
const researchSortFields = [
  "protocol",
  "type",
  "title",
  "publishedAt",
] as const;
const securityToolSortFields = ["name", "createdAt"] as const;

export const auditPaginationSchema = basePaginationSchema.extend({
  sortField: z.enum(auditSortFields).default("publishedAt"),
  sortDirection: sortDirectionSchema.default("desc"),
});

export const auditorPaginationSchema = basePaginationSchema.extend({
  sortField: z.enum(auditorSortFields).default("name"),
  sortDirection: sortDirectionSchema.default("asc"),
});

export const researchPaginationSchema = basePaginationSchema.extend({
  sortField: z.enum(researchSortFields).default("publishedAt"),
  sortDirection: sortDirectionSchema.default("desc"),
});

export const securityToolPaginationSchema = basePaginationSchema.extend({
  sortField: z.enum(securityToolSortFields).default("name"),
  sortDirection: sortDirectionSchema.default("asc"),
});

export type AuditSortField = (typeof auditSortFields)[number];
export type AuditorSortField = (typeof auditorSortFields)[number];
export type ResearchSortField = (typeof researchSortFields)[number];
export type SecurityToolSortField = (typeof securityToolSortFields)[number];

export type PaginationInput = z.infer<typeof basePaginationSchema>;
export type AuditPaginationInput = z.infer<typeof auditPaginationSchema>;
export type AuditorPaginationInput = z.infer<typeof auditorPaginationSchema>;
export type ResearchPaginationInput = z.infer<typeof researchPaginationSchema>;
export type SecurityToolPaginationInput = z.infer<
  typeof securityToolPaginationSchema
>;
