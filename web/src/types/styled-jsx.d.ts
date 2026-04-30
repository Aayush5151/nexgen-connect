/**
 * Global type augmentation for styled-jsx (bundled with Next.js).
 *
 * Required after the react/react-dom 19.2.4 → 19.1.0 downgrade in
 * commit c63d71f (which forced version parity across the monorepo
 * for RN-Web preview compatibility). The 19.1.x @types/react has
 * stricter style-element typing and no longer auto-recognises the
 * `jsx` / `global` props that styled-jsx adds.
 *
 * styled-jsx is bundled inside Next.js 16 — we don't install it as
 * a direct dep — so we declare the JSX attribute augmentation here
 * instead of relying on `@types/styled-jsx`.
 *
 * Used by web/src/components/shared/ScrollReward.tsx (line 112).
 */

import "react";

declare module "react" {
  interface StyleHTMLAttributes<T> extends HTMLAttributes<T> {
    /** Scopes CSS to the component (styled-jsx). */
    jsx?: boolean;
    /** Promotes scoped CSS to global so it also applies outside the
     *  component. Use sparingly. */
    global?: boolean;
  }
}
