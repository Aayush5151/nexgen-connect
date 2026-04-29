import { StyleSheet, Text, View } from "react-native";
import { theme, typography, primaryTint } from "@/theme";
import { Avatar } from "@/components/Avatar";

/**
 * MessageBubble — chat bubble for the channel + DM threads. Three
 * shapes:
 *
 *   - "mine"    self-authored. Right-aligned. Primary-tinted.
 *   - "other"   peer message. Left-aligned with leading avatar.
 *   - "system"  scripted prompt or moderation notice. Centered,
 *               muted, no avatar, sits on the trust card surface
 *               aesthetic so it reads as platform speech, not user
 *               speech.
 *
 * The compose dock and message list render above this. We do
 * NOT render avatars on consecutive same-author bubbles — that's a
 * caller concern (pass `showAvatar={false}` on the second+).
 */

type Variant = "mine" | "other" | "system";

type Props = {
  variant: Variant;
  text: string;
  /** Author initials (other only). Required when showAvatar=true. */
  initials?: string;
  /** Author short name (other only). */
  authorName?: string;
  /** Time string, formatted by caller. */
  time?: string;
  /** Hide leading avatar (consecutive same-author messages). */
  showAvatar?: boolean;
};

export function MessageBubble({
  variant,
  text,
  initials,
  authorName,
  time,
  showAvatar = true,
}: Props) {
  if (variant === "system") {
    return (
      <View style={styles.systemRow}>
        <View style={styles.systemBubble}>
          <Text style={[typography.mono, styles.systemKicker]}>System</Text>
          <Text style={[typography.body, styles.systemText]}>{text}</Text>
        </View>
      </View>
    );
  }

  if (variant === "mine") {
    return (
      <View style={[styles.row, { justifyContent: "flex-end" }]}>
        <View style={[styles.bubble, styles.mine]}>
          <Text style={[typography.body, styles.bubbleText, styles.mineText]}>
            {text}
          </Text>
          {time ? <Text style={[styles.metaTime, styles.mineMeta]}>{time}</Text> : null}
        </View>
      </View>
    );
  }

  // other
  return (
    <View style={styles.row}>
      <View style={styles.avatarSlot}>
        {showAvatar && initials ? (
          <Avatar initials={initials} size="sm" tone="primary" />
        ) : (
          <View style={{ width: 32, height: 32 }} />
        )}
      </View>
      <View style={[styles.bubble, styles.other]}>
        {showAvatar && authorName ? (
          <Text style={styles.authorName}>{authorName}</Text>
        ) : null}
        <Text style={[typography.body, styles.bubbleText, styles.otherText]}>
          {text}
        </Text>
        {time ? <Text style={[styles.metaTime, styles.otherMeta]}>{time}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: theme.spacing[2],
    marginBottom: theme.spacing[3],
  },
  avatarSlot: {
    width: 32,
  },
  bubble: {
    maxWidth: "82%",
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 14,
    gap: 2,
  },
  bubbleText: {
    fontSize: 15,
    lineHeight: 22,
  },
  mine: {
    backgroundColor: theme.colors.primary,
    borderBottomRightRadius: 4,
  },
  mineText: {
    color: theme.colors.primaryFg,
  },
  other: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderBottomLeftRadius: 4,
  },
  otherText: {
    color: theme.colors.fg,
  },
  authorName: {
    fontFamily: theme.fontFamily.mono,
    fontSize: 11,
    fontWeight: "600",
    color: theme.colors.primary,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  metaTime: {
    fontFamily: theme.fontFamily.mono,
    fontSize: 10,
    fontWeight: "500",
    letterSpacing: 0.6,
    marginTop: 4,
  },
  mineMeta: {
    color: "rgba(0,0,0,0.55)",
    textAlign: "right",
  },
  otherMeta: {
    color: theme.colors.fgSubtle,
  },
  systemRow: {
    alignItems: "center",
    marginVertical: theme.spacing[3],
  },
  systemBubble: {
    backgroundColor: primaryTint(0.05),
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    paddingVertical: theme.spacing[3],
    paddingHorizontal: theme.spacing[4],
    maxWidth: "92%",
    gap: theme.spacing[1],
  },
  systemKicker: {
    color: theme.colors.primary,
  },
  systemText: {
    color: theme.colors.fg,
    lineHeight: 22,
  },
});
