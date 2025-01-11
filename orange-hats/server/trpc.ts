import { initTRPC } from "@trpc/server";
import type { CreateNextContextOptions } from "@trpc/server/adapters/next";
import prisma from "../lib/prisma";

export interface CreateContextOptions {
  headers?: Headers;
}

export const createContext = (opts: CreateNextContextOptions) => {
  return {
    prisma,
  };
};

export type Context = ReturnType<typeof createContext>;

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;
