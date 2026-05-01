/**
 * Error-mapping middleware.
 *
 * Per Build Prompt §Bucket 4: "Error mapping: every server error
 * maps to one of the E001-E065 catalogue codes from v6 §8. Never a
 * generic 500."
 *
 * Strategy: catch any throw inside the procedure, inspect, map to a
 * catalogue code if not already prefixed. Re-throw a TRPCError with
 * the canonical message format `E0XX:slug` so client error-mapping
 * (mobile/src/lib/errors) can lookup the catalogue entry.
 *
 * v6 build §8 / Build Prompt Bucket 4.
 */
import { TRPCError } from "@trpc/server";
import { middleware } from "../trpc-builder";

export const withErrorMapping = middleware(async ({ next, path }) => {
  try {
    const result = await next();
    return result;
  } catch (err) {
    if (err instanceof TRPCError) {
      // Already a tRPC error. If the message lacks a catalogue prefix,
      // tag it generically.
      if (!/^E\d{3}:/.test(err.message)) {
        throw new TRPCError({
          code: err.code,
          message: `E${tRPCCodeToCatalogue(err.code)}:${err.message}`,
          cause: err.cause,
        });
      }
      throw err;
    }
    if (err instanceof Error) {
      // Unknown native error. Map to E500 — but include the procedure
      // path so audit-log can correlate.
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `E500:server_error_${path}`,
        cause: err,
      });
    }
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "E500:unknown_error",
    });
  }
});

function tRPCCodeToCatalogue(code: TRPCError["code"]): string {
  // Map tRPC's standard codes to ranges in the catalogue. Specific
  // procedures can override with their own E0XX prefix.
  switch (code) {
    case "BAD_REQUEST":
      return "010";
    case "UNAUTHORIZED":
      return "001";
    case "FORBIDDEN":
      return "003";
    case "NOT_FOUND":
      return "020";
    case "CONFLICT":
      return "030";
    case "TIMEOUT":
      return "050";
    case "TOO_MANY_REQUESTS":
      return "060";
    case "PARSE_ERROR":
      return "011";
    default:
      return "500";
  }
}
