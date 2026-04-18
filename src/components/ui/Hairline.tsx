import { cn } from "@/lib/utils";

export function Hairline({
  className,
  short,
}: {
  className?: string;
  short?: boolean;
}) {
  return (
    <div
      className={cn(
        "h-px bg-border",
        short ? "w-10" : "w-full",
        className,
      )}
    />
  );
}
