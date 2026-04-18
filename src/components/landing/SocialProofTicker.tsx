"use client";

import { Marquee } from "@/components/shared/Marquee";

const routes = [
  "Mumbai \u2192 Germany",
  "Delhi \u2192 UK",
  "Pune \u2192 Australia",
  "Hyderabad \u2192 Canada",
  "Chennai \u2192 US",
  "Bangalore \u2192 Ireland",
  "Ahmedabad \u2192 Netherlands",
  "Kolkata \u2192 Singapore",
  "Jaipur \u2192 France",
  "Chandigarh \u2192 New Zealand",
  "Lucknow \u2192 Germany",
  "Kochi \u2192 UK",
];

export function SocialProofTicker() {
  return (
    <div className="border-y border-white/[0.03] bg-[#020617] py-4 overflow-hidden">
      <Marquee speed={40} pauseOnHover>
        {routes.map((route) => (
          <span
            key={route}
            className="inline-flex items-center gap-2 whitespace-nowrap text-sm font-medium text-[#64748B]"
          >
            <span className="h-1 w-1 rounded-full bg-[#3B82F6]/40" />
            {route}
          </span>
        ))}
      </Marquee>
    </div>
  );
}
