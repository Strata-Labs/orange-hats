import { inferAsyncReturnType } from "@trpc/server";
import type { CreateNextContextOptions } from "@trpc/server/adapters/next";
import prisma from "../lib/prisma";

export async function createContext(opts: CreateNextContextOptions) {
  return {
    prisma,
  };
}

export type Context = inferAsyncReturnType<typeof createContext>;
