import { router } from "../trpc";
import { adminRouter } from "./admin";
import { applicationsRouter } from "./application";
import { publicRouter } from "./public";

export const appRouter = router({
  admin: adminRouter,
  public: publicRouter,
  applications: applicationsRouter,
});

export type AppRouter = typeof appRouter;
