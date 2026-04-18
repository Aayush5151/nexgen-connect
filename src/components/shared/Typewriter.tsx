"use client";

import { useEffect, useState, useRef } from "react";
import { useInView, useReducedMotion } from "framer-motion";

interface TypewriterProps {
  text: string;
  className?: string;
  speed?: number;
  delay?: number;
  cursor?: boolean;
}

export function Typewriter({
  text,
  className = "",
  speed = 40,
  delay = 0,
  cursor = true,
}: TypewriterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const prefersReducedMotion = useReducedMotion();
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    if (!isInView || prefersReducedMotion) {
      if (prefersReducedMotion) {
        setDisplayText(text);
        setIsDone(true);
      }
      return;
    }

    let intervalId: ReturnType<typeof setInterval> | null = null;

    const delayTimer = setTimeout(() => {
      setIsTyping(true);
      let i = 0;
      intervalId = setInterval(() => {
        i++;
        setDisplayText(text.slice(0, i));
        if (i >= text.length) {
          if (intervalId) clearInterval(intervalId);
          setIsTyping(false);
          setIsDone(true);
        }
      }, speed);
    }, delay);

    return () => {
      clearTimeout(delayTimer);
      if (intervalId) clearInterval(intervalId);
    };
  }, [isInView, text, speed, delay, prefersReducedMotion]);

  return (
    <span ref={ref} className={className}>
      {displayText}
      {cursor && !isDone && (
        <span
          className={`inline-block w-[2px] h-[1em] ml-0.5 align-middle bg-[#3B82F6] ${
            isTyping ? "animate-pulse" : "animate-blink"
          }`}
        />
      )}
    </span>
  );
}
