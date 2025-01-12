import { z } from "zod";
import { router, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { PdfOperationResult, s3Utils } from "../../utils/s3";
import {
  S3Client,
  CopyObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { JekyllManager } from "../../utils/jekyll";
import { ContentManager } from "../../utils/contentManager";
import slugify from "slugify";

const researchInputSchema = z.object({
  protocol: z.string(),
  type: z.string(),
  title: z.string(),
  description: z.string(),
  content: z.string(),
  publishedAt: z.string(),
  mainImage: z.string().optional(),
  mainImageKey: z.string().optional(),
  secondaryImage: z.string().optional(),
  secondaryImageKey: z.string().optional(),
});

const researchUpdateSchema = z.object({
  id: z.string(),
  protocol: z.string().optional(),
  type: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  content: z.string().optional(),
  publishedAt: z.string().optional(),
  mainImage: z.string().optional(),
  mainImageKey: z.string().optional(),
  secondaryImage: z.string().optional(),
  secondaryImageKey: z.string().optional(),
});

export const adminRouter = router({
  createAudit: publicProcedure
    .input(
      z.object({
        protocol: z.string(),
        contracts: z.array(z.string()),
        auditorIds: z.array(z.string()),
        publishedAt: z.string(),
        pdfUrl: z.string().url(),
        pdfKey: z.string().optional(),
        auditUrl: z.string().url().optional().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const audit = await ctx.prisma.audit.create({
          data: {
            protocol: input.protocol,
            contracts: input.contracts,
            auditors: {
              connect: input.auditorIds.map((id) => ({ id })),
            },
            publishedAt: new Date(input.publishedAt),
            pdfUrl: input.pdfUrl,
            auditUrl: input.auditUrl || null,
          },
        });

        if (input.pdfKey && input.pdfKey.startsWith("temp/")) {
          const newKey = `audits/${audit.id}/${input.pdfKey.split("/").pop()}`;
          const s3Client = new S3Client({
            region: process.env.AWS_REGION!,
            credentials: {
              accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
              secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
            },
          });

          await s3Client.send(
            new CopyObjectCommand({
              Bucket: process.env.AWS_S3_BUCKET_NAME!,
              CopySource: `${process.env.AWS_S3_BUCKET_NAME}/${input.pdfKey}`,
              Key: newKey,
            })
          );

          await s3Client.send(
            new DeleteObjectCommand({
              Bucket: process.env.AWS_S3_BUCKET_NAME!,
              Key: input.pdfKey,
            })
          );

          const newPdfUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${newKey}`;
          await ctx.prisma.audit.update({
            where: { id: audit.id },
            data: { pdfUrl: newPdfUrl },
          });

          return { ...audit, pdfUrl: newPdfUrl };
        }

        return audit;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create audit",
          cause: error,
        });
      }
    }),

  updateAudit: publicProcedure
    .input(
      z.object({
        id: z.string(),
        protocol: z.string().optional(),
        contracts: z.array(z.string()).optional(),
        auditorIds: z.array(z.string()).optional(),
        publishedAt: z.string().optional(),
        pdfUrl: z.string().url().optional(),
        auditUrl: z.string().url().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const { id, auditorIds, ...updateData } = input;
        return await ctx.prisma.audit.update({
          where: { id },
          data: {
            ...updateData,
            ...(auditorIds && {
              auditors: {
                set: auditorIds.map((id) => ({ id })),
              },
            }),
            ...(updateData.publishedAt && {
              publishedAt: new Date(updateData.publishedAt),
            }),
          },
        });
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update audit",
          cause: error,
        });
      }
    }),

  deleteAudit: publicProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.prisma.audit.delete({
          where: { id: input },
        });
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete audit",
          cause: error,
        });
      }
    }),

  createAuditor: publicProcedure
    .input(
      z.object({
        name: z.string(),
        team: z.string().optional(),
        proofOfWork: z.array(z.string()),
        contact: z.string(),
        websiteUrl: z.string().url().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.prisma.auditor.create({
          data: input,
        });
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create auditor",
          cause: error,
        });
      }
    }),

  updateAuditor: publicProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        team: z.string().optional(),
        proofOfWork: z.array(z.string()).optional(),
        contact: z.string().optional(),
        websiteUrl: z.string().url().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const { id, ...updateData } = input;
        return await ctx.prisma.auditor.update({
          where: { id },
          data: updateData,
        });
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update auditor",
          cause: error,
        });
      }
    }),

  deleteAuditor: publicProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.prisma.auditor.delete({
          where: { id: input },
        });
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete auditor",
          cause: error,
        });
      }
    }),

  createResearch: publicProcedure
    .input(researchInputSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        let content = input.content;
        if (input.mainImageKey) {
          content = `![Main image](${input.mainImageKey})\n\n${content}`;
        }
        if (input.secondaryImageKey) {
          content = `${content}\n\n![Secondary image](${input.secondaryImageKey})`;
        }

        const slug = slugify(input.title, {
          lower: true,
          strict: true,
        });

        const research = await ctx.prisma.research.create({
          data: {
            protocol: input.protocol,
            type: input.type,
            title: input.title,
            description: input.description,
            content: input.content,
            slug,
            jekyllUrl: "",
            publishedAt: new Date(input.publishedAt),
            mainImage: input.mainImage,
            mainImageKey: input.mainImageKey,
            secondaryImage: input.secondaryImage,
            secondaryImageKey: input.secondaryImageKey,
          },
        });

        const contentManager = new ContentManager();
        const contentUrl = await contentManager.createPost(research);

        const updatedResearch = await ctx.prisma.research.update({
          where: { id: research.id },
          data: {
            jekyllUrl: contentUrl,
          },
        });

        return updatedResearch;
      } catch (error) {
        console.error("Failed to create research entry:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Failed to create research entry",
          cause: error,
        });
      }
    }),

  updateResearch: publicProcedure
    .input(researchUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const { id, ...updateData } = input;

        const existingResearch = await ctx.prisma.research.findUnique({
          where: { id },
        });

        if (!existingResearch) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Research not found",
          });
        }

        const slug = updateData.title
          ? slugify(updateData.title, { lower: true, strict: true })
          : existingResearch.slug;

        const research = await ctx.prisma.research.update({
          where: { id },
          data: {
            ...updateData,
            slug,
            ...(updateData.publishedAt && {
              publishedAt: new Date(updateData.publishedAt),
            }),
          },
        });

        if (updateData.content) {
          const contentManager = new ContentManager();
          const contentUrl = await contentManager.updatePost(research);

          return await ctx.prisma.research.update({
            where: { id },
            data: {
              jekyllUrl: contentUrl,
            },
          });
        }

        return research;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update research entry",
          cause: error,
        });
      }
    }),

  deleteResearch: publicProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      try {
        const research = await ctx.prisma.research.findUnique({
          where: { id: input },
        });

        if (research) {
          const contentManager = new ContentManager();
          await contentManager.deletePost(research.slug);
        }

        return await ctx.prisma.research.delete({
          where: { id: input },
        });
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete research entry",
          cause: error,
        });
      }
    }),

  getResearchImageUploadUrl: publicProcedure
    .input(
      z.object({
        researchId: z.string(),
        fileName: z.string(),
        type: z.enum(["main", "secondary"]),
      })
    )
    .mutation(async ({ input }): Promise<PdfOperationResult> => {
      try {
        const key = `research/${input.researchId}/${input.type}/${input.fileName}`;
        const { url } = await s3Utils.getSignedUploadUrl(key, "image/*");

        return {
          success: true,
          url,
          key,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate image upload URL",
          cause: error,
        });
      }
    }),

  createSecurityTool: publicProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string(),
        securityUrl: z.string().url().optional(),
        imageUrl: z.string().url().optional(),
        imageKey: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.prisma.securityTool.create({
          data: input,
        });
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create security tool",
          cause: error,
        });
      }
    }),

  updateSecurityTool: publicProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        description: z.string().optional(),
        securityUrl: z.string().url().optional(),
        imageUrl: z.string().url().optional(),
        imageKey: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const { id, ...updateData } = input;
        return await ctx.prisma.securityTool.update({
          where: { id },
          data: updateData,
        });
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update security tool",
          cause: error,
        });
      }
    }),

  deleteSecurityTool: publicProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.prisma.securityTool.delete({
          where: { id: input },
        });
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete security tool",
          cause: error,
        });
      }
    }),

  getToolImageUrl: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }): Promise<PdfOperationResult> => {
      try {
        const tool = await ctx.prisma.securityTool.findUnique({
          where: { id: input },
          select: { imageKey: true },
        });

        if (!tool || !tool.imageKey) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Tool or image not found",
          });
        }

        const { url } = await s3Utils.getSignedDownloadUrl(tool.imageKey);

        return {
          success: true,
          url,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate image download URL",
          cause: error,
        });
      }
    }),

  getToolImageUploadUrl: publicProcedure
    .input(
      z.object({
        toolId: z.string(),
        fileName: z.string(),
      })
    )
    .mutation(async ({ input }): Promise<PdfOperationResult> => {
      try {
        const key = `tools/${input.toolId}/${input.fileName}`;
        const { url } = await s3Utils.getSignedUploadUrl(key, "image/*");

        return {
          success: true,
          url,
          key,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate image upload URL",
          cause: error,
        });
      }
    }),

  getPdfUploadUrl: publicProcedure
    .input(
      z.object({
        auditId: z.string(),
        fileName: z.string(),
      })
    )
    .mutation(async ({ input }): Promise<PdfOperationResult> => {
      try {
        const key = s3Utils.generatePdfKey(input.auditId, input.fileName);
        const { url } = await s3Utils.getSignedUploadUrl(key);

        return {
          success: true,
          url,
          key,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate PDF upload URL",
          cause: error,
        });
      }
    }),

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

        const key = audit.pdfUrl.split("/").slice(-2).join("/");
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

  updateAuditPdf: publicProcedure
    .input(
      z.object({
        auditId: z.string(),
        key: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const pdfUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${input.key}`;

        return await ctx.prisma.audit.update({
          where: { id: input.auditId },
          data: { pdfUrl },
        });
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update audit PDF URL",
          cause: error,
        });
      }
    }),
});
