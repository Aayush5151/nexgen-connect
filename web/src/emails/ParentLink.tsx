/**
 * Parent magic-link email template.
 *
 * Rendered server-side via `@react-email/render` and sent through
 * Resend by `web/src/lib/parent-link.ts`. The template ships as a
 * React component so:
 *
 *   - Editing copy / colours doesn't require touching escapeHtml.
 *   - `react-email dev` (port 3001) gives a Gmail-accurate preview.
 *   - A/B subject lines come for free (caller picks).
 *
 * Design constraints (v15 BP §16 PII discipline):
 *   - No tracking pixels, no remote images. Only the magic-link URL
 *     leaves the server.
 *   - The student's first name + university are shown to the parent
 *     verbatim. The phone / email / Aadhaar never appear in the
 *     email body — the parent dashboard at `/parent/[token]` is
 *     read-only and PII-free.
 *
 * v16 web pivot Bucket 4 follow-up.
 */
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

export type ParentLinkProps = {
  studentFirstName: string;
  studentUni: string;
  link: string;
  expiresAt: string;
};

export function ParentLink({
  studentFirstName,
  studentUni,
  link,
  expiresAt,
}: ParentLinkProps) {
  const expires = new Date(expiresAt).toLocaleString();

  return (
    <Html>
      <Head />
      <Preview>
        {studentFirstName} added you as a parent on NexGen Connect
      </Preview>
      <Body style={body}>
        <Container style={container}>
          <Heading style={heading}>
            {studentFirstName}&apos;s NexGen Connect — parent view
          </Heading>
          <Text style={paragraph}>Hi —</Text>
          <Text style={paragraph}>
            {studentFirstName} added you as a parent on NexGen Connect
            ({studentUni}).
          </Text>
          <Text style={paragraph}>
            The link below opens a read-only dashboard. It works once
            and expires at {expires}.
          </Text>
          <Section style={buttonWrap}>
            <Button href={link} style={button}>
              Open the dashboard
            </Button>
          </Section>
          <Hr style={hr} />
          <Text style={footnote}>
            No chats, no location, no ongoing tracking. Ask{" "}
            {studentFirstName} for a fresh link any time.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

// Inline styles — Gmail strips <style> blocks, so every rule has to
// live on the element. Colour palette mirrors the brand tokens.
const body: React.CSSProperties = {
  backgroundColor: "#0B1A12",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  margin: 0,
  padding: 0,
};
const container: React.CSSProperties = {
  backgroundColor: "#FFFFFF",
  borderRadius: 12,
  margin: "32px auto",
  maxWidth: 560,
  padding: "32px 28px",
};
const heading: React.CSSProperties = {
  color: "#0B1A12",
  fontSize: 22,
  fontWeight: 600,
  letterSpacing: "-0.01em",
  margin: "0 0 8px",
};
const paragraph: React.CSSProperties = {
  color: "#1F2A24",
  fontSize: 15,
  lineHeight: "22px",
  margin: "12px 0",
};
const buttonWrap: React.CSSProperties = {
  margin: "24px 0",
};
const button: React.CSSProperties = {
  backgroundColor: "#00DC82",
  borderRadius: 8,
  color: "#0B1A12",
  display: "inline-block",
  fontSize: 14,
  fontWeight: 600,
  padding: "12px 18px",
  textDecoration: "none",
};
const hr: React.CSSProperties = {
  border: "none",
  borderTop: "1px solid #E5E7EB",
  margin: "24px 0 16px",
};
const footnote: React.CSSProperties = {
  color: "#6B7280",
  fontSize: 12,
  lineHeight: "18px",
  margin: 0,
};

export default ParentLink;
