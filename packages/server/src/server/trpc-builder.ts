/**
 * tRPC builder — single instance of `initTRPC.context<Context>().create()`.
 *
 * Split out from trpc.ts to break a circular import: middleware files
 * need `middleware` here, and trpc.ts needs both this + the middleware
 * files. Without the split the import cycle blows up at runtime.
 *
 * v6 build §11 / Build Prompt Bucket 4.
 */
import { initTRPC } from "@trpc/server";
import type { Context } from "./context";

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const middleware = t.middleware;
export const procedure = t.procedure;
