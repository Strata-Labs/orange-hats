import {
  PaginatedResponse,
  SecurityToolWithSignedUrl,
  SerializedSecurityTool,
} from "@/atoms/types";
import {
  auditorPaginationSchema,
  auditPaginationSchema,
  researchPaginationSchema,
  securityToolPaginationSchema,
} from "../schema/pagination";
import { router, publicProcedure } from "../trpc";
import { Prisma, SecurityTool } from "@prisma/client";
import { z } from "zod";
import { PdfOperationResult, s3Utils } from "../../utils/s3";
import { TRPCError } from "@trpc/server";
import { ContentManager } from "../../utils/contentManager";
import {
  ResearchPost,
  ResearchPostWithContent,
} from "@/components/blog/ResearchList.tsx";

export const serializeSecurityTool = (
  tool: SecurityTool
): SerializedSecurityTool => ({
  ...tool,
  createdAt: tool.createdAt.toISOString(),
  updatedAt: tool.updatedAt.toISOString(),
});

export const publicRouter = router({
  getAudits: publicProcedure
    .input(auditPaginationSchema)
    .query(async ({ ctx, input }): Promise<PaginatedResponse<any>> => {
      const { page, limit, search, sortField, sortDirection } = input;

      const searchCondition: Prisma.AuditWhereInput = search
        ? {
            OR: [
              { protocol: { contains: search, mode: "insensitive" } },
              { contracts: { has: search } },
            ],
          }
        : {};

      const allAudits = await ctx.prisma.audit.findMany({
        where: searchCondition,
        include: {
          auditors: {
            select: {
              id: true,
              name: true,
              team: true,
            },
            orderBy:
              sortField === "auditors"
                ? {
                    name: sortDirection,
                  }
                : undefined,
          },
        },
        orderBy:
          sortField === "auditors"
            ? undefined
            : {
                [sortField]: sortDirection,
              },
      });

      if (sortField === "auditors") {
        allAudits.sort((a, b) => {
          const aNames = a.auditors
            .map((auditor) => auditor.name.toLowerCase())
            .sort();
          const bNames = b.auditors
            .map((auditor) => auditor.name.toLowerCase())
            .sort();

          const aFirstName = aNames[0] || "";
          const bFirstName = bNames[0] || "";

          return sortDirection === "asc"
            ? aFirstName.localeCompare(bFirstName)
            : bFirstName.localeCompare(aFirstName);
        });
      }

      const totalItems = allAudits.length;
      const skip = (page - 1) * limit;
      const paginatedAudits = allAudits.slice(skip, skip + limit);

      return {
        items: paginatedAudits,
        metadata: {
          currentPage: page,
          totalPages: Math.ceil(totalItems / limit),
          totalItems,
          hasNextPage: page < Math.ceil(totalItems / limit),
          hasPreviousPage: page > 1,
        },
      };
    }),

  getAuditors: publicProcedure
    .input(auditorPaginationSchema)
    .query(async ({ ctx, input }): Promise<PaginatedResponse<any>> => {
      const { page, limit, search, sortField, sortDirection } = input;
      const skip = (page - 1) * limit;

      const searchCondition: Prisma.AuditorWhereInput = search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { team: { contains: search, mode: "insensitive" } },
            ],
          }
        : {};

      const orderBy: Prisma.AuditorOrderByWithRelationInput = {
        [sortField]: sortDirection,
      };

      const [auditors, totalItems] = await Promise.all([
        ctx.prisma.auditor.findMany({
          where: searchCondition,
          include: {
            audits: {
              select: {
                id: true,
                protocol: true,
                publishedAt: true,
              },
            },
          },
          skip,
          take: limit,
          orderBy,
        }),
        ctx.prisma.auditor.count({ where: searchCondition }),
      ]);

      return {
        items: auditors,
        metadata: {
          currentPage: page,
          totalPages: Math.ceil(totalItems / limit),
          totalItems,
          hasNextPage: page < Math.ceil(totalItems / limit),
          hasPreviousPage: page > 1,
        },
      };
    }),

  getResearch: publicProcedure
    .input(researchPaginationSchema)
    .query(
      async ({
        ctx,
        input,
      }): Promise<PaginatedResponse<ResearchPostWithContent>> => {
        const { page, limit, search, sortField, sortDirection } = input;
        const skip = (page - 1) * limit;

        const searchCondition: Prisma.ResearchWhereInput = search
          ? {
              OR: [
                { protocol: { contains: search, mode: "insensitive" } },
                { type: { contains: search, mode: "insensitive" } },
                { title: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
              ],
            }
          : {};

        const orderBy: Prisma.ResearchOrderByWithRelationInput = {
          [sortField]: sortDirection,
        };

        try {
          const [research, totalItems] = await Promise.all([
            ctx.prisma.research.findMany({
              where: searchCondition,
              skip,
              take: limit,
              orderBy,
            }),
            ctx.prisma.research.count({ where: searchCondition }),
          ]);

          const contentManager = new ContentManager();
          const researchWithContent = await Promise.all(
            research.map(async (item) => {
              try {
                const content = await contentManager.getPostBySlug(item.slug);

                let mainImageUrl = null;
                let secondaryImageUrl = null;

                if (item.mainImageKey) {
                  try {
                    const { url } = await s3Utils.getSignedDownloadUrl(
                      item.mainImageKey,
                      3600
                    );
                    mainImageUrl = url;
                  } catch (error) {
                    console.error(
                      `Failed to get signed URL for main image of research ${item.id}:`,
                      error
                    );
                  }
                }

                if (item.secondaryImageKey) {
                  try {
                    const { url } = await s3Utils.getSignedDownloadUrl(
                      item.secondaryImageKey,
                      3600
                    );
                    secondaryImageUrl = url;
                  } catch (error) {
                    console.error(
                      `Failed to get signed URL for secondary image of research ${item.id}:`,
                      error
                    );
                  }
                }

                return {
                  id: item.id,
                  slug: item.slug,
                  title: item.title,
                  protocol: item.protocol,
                  type: item.type,
                  description: item.description,
                  content: content.content,
                  publishedAt: item.publishedAt.toISOString(),
                  jekyllUrl: item.jekyllUrl,
                  mainImage: mainImageUrl,
                  mainImageKey: item.mainImageKey,
                  secondaryImage: secondaryImageUrl,
                  secondaryImageKey: item.secondaryImageKey,
                  createdAt: item.createdAt.toISOString(),
                  updatedAt: item.updatedAt.toISOString(),
                } satisfies ResearchPostWithContent;
              } catch (error) {
                console.error(
                  `Failed to get content for research ${item.id}:`,
                  error
                );
                return {
                  id: item.id,
                  slug: item.slug,
                  title: item.title,
                  protocol: item.protocol,
                  type: item.type,
                  description: item.description,
                  content: item.content || "",
                  publishedAt: item.publishedAt.toISOString(),
                  jekyllUrl: item.jekyllUrl,
                  mainImage: null,
                  mainImageKey: item.mainImageKey,
                  secondaryImage: null,
                  secondaryImageKey: item.secondaryImageKey,
                  createdAt: item.createdAt.toISOString(),
                  updatedAt: item.updatedAt.toISOString(),
                } satisfies ResearchPostWithContent;
              }
            })
          );

          return {
            items: researchWithContent,
            metadata: {
              currentPage: page,
              totalPages: Math.ceil(totalItems / limit),
              totalItems,
              hasNextPage: page < Math.ceil(totalItems / limit),
              hasPreviousPage: page > 1,
            },
          };
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch research items",
            cause: error,
          });
        }
      }
    ),

  getResearchImageUrl: publicProcedure
    .input(
      z.object({
        researchId: z.string(),
        whichImage: z.enum(["main", "secondary"]),
      })
    )
    .query(async ({ ctx, input }) => {
      const research = await ctx.prisma.research.findUnique({
        where: { id: input.researchId },
        select: {
          mainImageKey: true,
          secondaryImageKey: true,
        },
      });

      if (!research) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Research not found",
        });
      }

      const key =
        input.whichImage === "main"
          ? research.mainImageKey
          : research.secondaryImageKey;

      if (!key) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `No ${input.whichImage} image available`,
        });
      }

      const { url } = await s3Utils.getSignedDownloadUrl(key);

      return { success: true, url };
    }),

  getSecurityTools: publicProcedure
    .input(securityToolPaginationSchema)
    .query(
      async ({
        ctx,
        input,
      }): Promise<PaginatedResponse<SecurityToolWithSignedUrl>> => {
        const { page, limit, search, sortField, sortDirection } = input;
        const skip = (page - 1) * limit;

        const searchCondition: Prisma.SecurityToolWhereInput = search
          ? {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
              ],
            }
          : {};

        const orderBy: Prisma.SecurityToolOrderByWithRelationInput = {
          [sortField]: sortDirection,
        };

        const [tools, totalItems] = await Promise.all([
          ctx.prisma.securityTool.findMany({
            where: searchCondition,
            skip,
            take: limit,
            orderBy,
          }),
          ctx.prisma.securityTool.count({ where: searchCondition }),
        ]);

        const toolsWithSignedUrls = await Promise.all(
          tools.map(async (tool) => {
            const serializedTool = serializeSecurityTool(tool);

            if (tool.imageKey) {
              try {
                const { url } = await s3Utils.getSignedDownloadUrl(
                  tool.imageKey,
                  3600
                );
                return {
                  ...serializedTool,
                  signedImageUrl: url,
                };
              } catch (error) {
                console.error(
                  `Failed to get signed URL for tool ${tool.id}:`,
                  error
                );
                return {
                  ...serializedTool,
                  signedImageUrl: null,
                };
              }
            }
            return {
              ...serializedTool,
              signedImageUrl: null,
            };
          })
        );

        return {
          items: toolsWithSignedUrls,
          metadata: {
            currentPage: page,
            totalPages: Math.ceil(totalItems / limit),
            totalItems,
            hasNextPage: page < Math.ceil(totalItems / limit),
            hasPreviousPage: page > 1,
          },
        };
      }
    ),

  getPdfDownloadUrl: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }): Promise<PdfOperationResult> => {
      try {
        const audit = await ctx.prisma.audit.findUnique({
          where: { id: input },
          select: { pdfUrl: true },
        });

        if (!audit) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Audit not found",
          });
        }

        const urlParts = audit.pdfUrl.split(".amazonaws.com/");
        const key = urlParts[1];

        if (!key) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Invalid PDF URL format",
          });
        }

        const { url } = await s3Utils.getSignedDownloadUrl(key);

        return {
          success: true,
          url,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate PDF download URL",
          cause: error,
        });
      }
    }),
});
