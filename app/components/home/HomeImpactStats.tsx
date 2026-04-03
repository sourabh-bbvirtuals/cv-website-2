import { GraduationCap, Globe, FileText } from 'lucide-react';
import type React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';

export interface ImpactStatItem {
  label: string;
  value: string | number;
  icon?: string;
}

interface StatIconProps {
  iconName: string;
  className?: string;
  size?: number;
}

const statsMap: { [key: string]: React.ElementType } = {
  graduation: GraduationCap,
  globe: Globe,
  file: FileText,
};

export function StatIcon({
  iconName,
  className = '',
  size = 16,
}: StatIconProps) {
  const IconComponent = statsMap[iconName] || FileText; // Fallback to FileText

  return (
    <IconComponent
      className={className}
      style={{ width: size, height: size }}
    />
  );
}

export default function HomeImpactStats({
  heading = 'Our Impact',
  stats,
}: {
  heading?: string;
  stats: ImpactStatItem[];
}) {
  if (!stats || stats.length === 0) {
    return null;
  }

  const sectionRef = useRef<HTMLElement | null>(null);
  const hasAnimatedRef = useRef(false);

  const parsedTargets = useMemo(() => {
    const parseNumber = (v: string | number) => {
      if (typeof v === 'number' && Number.isFinite(v)) return v;
      if (typeof v !== 'string') return null;
      const cleaned = v.replace(/[^\d.-]/g, '');
      if (!cleaned) return null;
      const n = Number(cleaned);
      return Number.isFinite(n) ? n : null;
    };
    return stats.map((s) => parseNumber(s.value));
  }, [stats]);

  const [displayValues, setDisplayValues] = useState<Array<string | number>>(
    () => stats.map((s, i) => (parsedTargets[i] != null ? 0 : s.value)),
  );

  useEffect(() => {
    // reset if stats change
    hasAnimatedRef.current = false;
    setDisplayValues(
      stats.map((s, i) => (parsedTargets[i] != null ? 0 : s.value)),
    );
  }, [stats, parsedTargets]);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const animate = () => {
      if (hasAnimatedRef.current) return;
      hasAnimatedRef.current = true;

      const start = performance.now();
      const durationMs = 1200;

      const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / durationMs);
        const eased = easeOutCubic(t);

        setDisplayValues(
          stats.map((s, idx) => {
            const target = parsedTargets[idx];
            if (target == null) return s.value;
            const next = Math.round(target * eased);
            return next;
          }),
        );

        if (t < 1) requestAnimationFrame(tick);
      };

      requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          animate();
          io.disconnect();
        }
      },
      { threshold: 0.25 },
    );

    io.observe(el);
    return () => io.disconnect();
  }, [stats, parsedTargets]);

  return (
    <section ref={sectionRef} className="bg-white py-6 sm:py-8">
      <div className="mx-auto max-w-[1340px] px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-xl sm:text-2xl font-bold text-[#1c212f] mb-8">
          {heading}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
          {stats.map((stat, index) =>
            (() => {
              const isMiddleCard = stats.length === 3 && index === 1;
              const cardClass = isMiddleCard
                ? 'rounded-xl border border-slate-200 bg-white p-6 sm:p-8 text-center shadow-sm hover:shadow-md transition-shadow'
                : 'rounded-xl border border-[#d7ecff] bg-[#eaf6ff] p-6 sm:p-8 text-center shadow-sm hover:shadow-md transition-shadow';
              const iconWrapClass = isMiddleCard
                ? 'mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-xl bg-slate-50 text-[#4aaeed]'
                : 'mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-xl bg-white/70 text-[#4aaeed]';

              return (
                <div key={index} className={cardClass}>
                  {stat.icon && (
                    <div className={iconWrapClass}>
                      <StatIcon
                        iconName={stat.icon || ''}
                        className="shrink-0"
                        size={40}
                      />
                    </div>
                  )}
                  <p className="text-2xl sm:text-3xl font-bold text-[#1c212f] tabular-nums">
                    {typeof displayValues[index] === 'number'
                      ? new Intl.NumberFormat('en-IN').format(
                          displayValues[index] as number,
                        )
                      : displayValues[index]}
                  </p>
                  <p className="mt-2 text-sm font-medium text-slate-600 uppercase tracking-wide">
                    {stat.label}
                  </p>
                </div>
              );
            })(),
          )}
        </div>
      </div>
    </section>
  );
}
