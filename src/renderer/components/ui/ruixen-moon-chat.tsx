import React from 'react';

import { cn } from '@/lib/utils';

/** Bright sky / soft daylight — Unsplash */
const DEFAULT_HERO_BG =
  'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=2070&q=80';

export interface RuixenMoonChatProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  /** Main prompt area (e.g. CoworkPromptInput) */
  inputSlot: React.ReactNode;
  quickActionsSlot?: React.ReactNode;
  /** Hero background — Unsplash */
  backgroundImageUrl?: string;
  className?: string;
}

/**
 * Full-height hero + glass input shell (Ruixen-style).
 * Pass real app input via `inputSlot`; quick actions via `quickActionsSlot`.
 */
export default function RuixenMoonChat({
  title,
  subtitle,
  inputSlot,
  quickActionsSlot,
  backgroundImageUrl = DEFAULT_HERO_BG,
  className,
}: RuixenMoonChatProps) {
  return (
    <div
      className={cn(
        'relative flex min-h-0 w-full flex-1 flex-col bg-cover bg-center',
        className,
      )}
      style={{
        backgroundImage: `url('${backgroundImageUrl}')`,
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Soft wash so text and glass read clearly on bright photos */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/90 via-white/65 to-white/80"
        aria-hidden
      />
      <div className="relative flex min-h-0 w-full flex-1 flex-col items-center">
        <div className="flex w-full min-h-0 flex-1 flex-col items-center justify-center px-4">
          <div className="text-center">
            <h1 className="flex flex-col items-center gap-4 text-4xl font-semibold text-slate-800 drop-shadow-sm">
              {title}
            </h1>
            {subtitle != null && (
              <div className="mt-2 text-slate-600">{subtitle}</div>
            )}
          </div>
        </div>

        <div className="mb-[12vh] w-full max-w-3xl shrink-0 px-4 pb-6 pt-2">
          <div className="relative rounded-xl border border-white/80 bg-white/75 shadow-lg shadow-slate-200/60 ring-1 ring-slate-200/80 backdrop-blur-xl">
            {inputSlot}
          </div>
          {quickActionsSlot != null && (
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              {quickActionsSlot}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
