"use client";

import { ScrollReveal } from "@/components/shared/ScrollReveal";

export function DownloadCTA() {
  return (
    <section id="download" className="section-padding bg-[#0A0A0C]">
      <div className="container-narrow text-center">
        <ScrollReveal>
          <h2 className="text-3xl font-black text-[#E8E8ED] sm:text-4xl lg:text-5xl">
            Ready to Find Your People?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base font-medium text-[#9CA3AF] md:text-lg">
            Download the app, verify your identity, and get placed in your
            cohort. It takes 90 seconds.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.15}>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            {/* App Store badge -- placeholder link for now */}
            <a
              href="#"
              className="inline-flex h-14 items-center gap-3 rounded-xl bg-[#FF6B35] px-8 text-[15px] font-semibold text-white shadow-lg shadow-[#FF6B35]/10 transition-all hover:bg-[#E85D2F] hover:shadow-xl hover:shadow-[#FF6B35]/15 active:scale-[0.97]"
            >
              <svg
                className="h-6 w-6"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
              </svg>
              Download for iOS
            </a>

            {/* Google Play badge -- placeholder link for now */}
            <a
              href="#"
              className="inline-flex h-14 items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] px-8 text-[15px] font-semibold text-[#E8E8ED] transition-all hover:bg-white/[0.06] hover:border-[#FF6B35]/30 active:scale-[0.97]"
            >
              <svg
                className="h-6 w-6"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.199l2.302 2.302a1 1 0 010 1.38l-2.302 2.302L15.12 12l2.578-2.492zM5.864 2.658L16.8 8.99l-2.302 2.302-8.635-8.635z" />
              </svg>
              Download for Android
            </a>
          </div>

          <p className="mt-6 text-xs text-[#6B7280]">
            Available on iOS and Android. Free to download.
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}
