/**
 * @nexgen-connect/shared — barrel export for the shared package.
 *
 * Web and mobile import from here:
 *   import { theme, CORRIDOR_UNLOCK_THRESHOLD } from "@nexgen-connect/shared";
 *
 * Sub-paths are also exported for tree-shaking-sensitive consumers:
 *   import { theme } from "@nexgen-connect/shared/theme";
 *   import { CORRIDORS } from "@nexgen-connect/shared/corridors";
 *   import { PREMIUM_PRICE_DISPLAY } from "@nexgen-connect/shared/constants";
 */

export * from "./theme";
export * from "./constants";
export * from "./corridors";
