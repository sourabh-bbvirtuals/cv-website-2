interface PageTitleProps {
  name: string;
  subtitle?: string;
  className?: string;
}

export function PageTitle({ name, subtitle, className = '' }: PageTitleProps) {
  return (
    <section className={`mx-auto max-w-7xl px-4 mt-10 ${className}`}>
      <h3 className="text-center text-2xl md:text-3xl font-semibold tracking-tight">
        {name}
      </h3>
      {subtitle && (
        <p className="text-center text-base md:text-lg text-slate-600 mt-2">
          {subtitle}
        </p>
      )}
    </section>
  );
}
