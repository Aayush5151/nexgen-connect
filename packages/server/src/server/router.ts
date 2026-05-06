/**
 * Root tRPC router — composes every domain router.
 *
 * Mobile imports the type only:
 *   import type { AppRouter } from "@nexgen-connect/server";
 *   const trpc = createTRPCClient<AppRouter>({ … });
 *
 * v6 build §18 / Build Prompt Bucket 4.
 */
import { router } from "./trpc";
import { authRouter } from "./routers/auth";
import { verificationRouter } from "./routers/verification";
import { corridorRouter } from "./routers/corridor";
import { chatRouter } from "./routers/chat";
import { premiumRouter } from "./routers/premium";
import { parentRouter } from "./routers/parent";
import { trustSafetyRouter } from "./routers/trustSafety";
import { groupApplyRouter } from "./routers/groupApply";
import { mentalHealthRouter } from "./routers/mentalHealth";
import { scamsRouter } from "./routers/scams";
import { adminRouter } from "./routers/admin";
import { accountRouter } from "./routers/account";
import { statsRouter } from "./routers/stats";

export const appRouter = router({
  auth: authRouter,
  account: accountRouter,
  verification: verificationRouter,
  corridor: corridorRouter,
  chat: chatRouter,
  premium: premiumRouter,
  parent: parentRouter,
  trustSafety: trustSafetyRouter,
  groupApply: groupApplyRouter,
  mentalHealth: mentalHealthRouter,
  scams: scamsRouter,
  admin: adminRouter,
  stats: statsRouter,
});

export type AppRouter = typeof appRouter;
