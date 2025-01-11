import { z } from "zod";

const basePaginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  search: z.string().optional(),
});

const sortDirectionSchema = z.enum(["asc", "desc"]);

export const auditPaginationSchema = basePaginationSchema.extend({
  sortField: z
    .enum(["protocol", "publishedAt", "createdAt"] as const)
    .default("publishedAt"),
  sortDirection: sortDirectionSchema.default("desc"),
});

export const auditorPaginationSchema = basePaginationSchema.extend({
  sortField: z.enum(["name", "team", "createdAt"] as const).default("name"),
  sortDirection: sortDirectionSchema.default("asc"),
});

export const researchPaginationSchema = basePaginationSchema.extend({
  sortField: z
    .enum(["protocol", "type", "title", "publishedAt"] as const)
    .default("publishedAt"),
  sortDirection: sortDirectionSchema.default("desc"),
});

export const securityToolPaginationSchema = basePaginationSchema.extend({
  sortField: z
    .enum(["name", "createdBy", "createdAt"] as const)
    .default("name"),
  sortDirection: sortDirectionSchema.default("asc"),
});

export type AuditPaginationInput = z.infer<typeof auditPaginationSchema>;
export type AuditorPaginationInput = z.infer<typeof auditorPaginationSchema>;
export type ResearchPaginationInput = z.infer<typeof researchPaginationSchema>;
export type SecurityToolPaginationInput = z.infer<
  typeof securityToolPaginationSchema
>;
