import { redirect } from "next/navigation";

/**
 * /app — redirect to /app/corridor.
 *
 * The corridor is the home of the authed surface. Profile lives behind
 * the user-tap; help behind the help-tap.
 *
 * v16 web pivot §Bucket 5.
 */
export default function AppIndex() {
  redirect("/app/corridor");
}
