import { z } from "zod";
import { router, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

export const applicationsRouter = router({
  submitAuditorApplication: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        name: z.string(),
        githubUrl: z.string().url(),
        applicationUrl: z.string().url().optional(),
        previousAudits: z.array(z.string()),
        yearsInClarity: z.number(),
        yearsInSecurity: z.number(),
        referral: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.prisma.auditorApplication.create({
          data: input,
        });
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to submit auditor application",
          cause: error,
        });
      }
    }),

  submitAuditApplication: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        name: z.string(),
        team: z.string(),
        landingPageUrl: z.string().url().optional(),
        githubUrl: z.string().url(),
        twitterUrl: z.string().url().optional(),
        contractCount: z.number(),
        hasFundraised: z.boolean(),
        has100TestCoverage: z.boolean(),
        hasAuditHash: z.boolean(),
        isNewLaunch: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.prisma.auditApplication.create({
          data: input,
        });
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to submit audit application",
          cause: error,
        });
      }
    }),

  submitGrantApplication: publicProcedure
    .input(
      z.object({
        name: z.string(),
        email: z.string().email(),
        landingPageUrl: z.string().url().optional(),
        isLive: z.boolean(),
        githubUrl: z.string().url().optional(),
        twitterUrl: z.string().url().optional(),
        communityImpact: z.string(),
        securityImprovement: z.string(),
        canLaunchWithoutGrant: z.boolean(),
        requestedAmount: z.number(),
        timeLineProposal: z.string(),
        teamSize: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.prisma.grantApplication.create({
          data: input,
        });
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to submit grant application",
          cause: error,
        });
      }
    }),

  getAuditorApplications: publicProcedure
    .input(
      z.object({
        status: z.enum(["pending", "approved", "rejected"]).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        return await ctx.prisma.auditorApplication.findMany({
          where: input.status ? { status: input.status } : undefined,
          orderBy: { createdAt: "desc" },
        });
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch auditor applications",
          cause: error,
        });
      }
    }),

  getAuditApplications: publicProcedure
    .input(
      z.object({
        status: z.enum(["pending", "approved", "rejected"]).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        return await ctx.prisma.auditApplication.findMany({
          where: input.status ? { status: input.status } : undefined,
          orderBy: { createdAt: "desc" },
        });
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch audit applications",
          cause: error,
        });
      }
    }),

  getGrantApplications: publicProcedure
    .input(
      z.object({
        status: z.enum(["pending", "approved", "rejected"]).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        return await ctx.prisma.grantApplication.findMany({
          where: input.status ? { status: input.status } : undefined,
          orderBy: { createdAt: "desc" },
        });
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch grant applications",
          cause: error,
        });
      }
    }),

  updateApplicationStatus: publicProcedure
    .input(
      z.object({
        type: z.enum(["auditor", "audit", "grant"]),
        id: z.string(),
        status: z.enum(["approved", "rejected", "pending"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const { type, id, status } = input;

        switch (type) {
          case "auditor":
            return await ctx.prisma.auditorApplication.update({
              where: { id },
              data: { status },
            });
          case "audit":
            return await ctx.prisma.auditApplication.update({
              where: { id },
              data: { status },
            });
          case "grant":
            return await ctx.prisma.grantApplication.update({
              where: { id },
              data: { status },
            });
        }
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update application status",
          cause: error,
        });
      }
    }),
});
