/**
 * Public surface of @nexgen-connect/server.
 *
 * Mobile + future admin app import the AppRouter type only — never
 * the implementation. Ensures server bundles never ship to client.
 *
 * v6 build §18 / Build Prompt Bucket 4.
 */
export type { AppRouter } from "./server/router";
