import { HomeMessage } from '~/providers/home/types';

export default function HomeMotivationalPoster({
  heading,
  poster,
}: {
  heading: string;
  poster?: HomeMessage | null;
}) {
  if (!poster) {
    return null;
  }

  return (
    <section className="bg-white py-10 sm:py-12">
      <div className="mx-auto max-w-[1340px] px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-[#1c212f] mb-8">
          {heading}
        </h2>
      </div>

      <div className="w-full overflow-hidden bg-white">
        <div className="relative mx-auto max-w-[1340px] px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="relative rounded-2xl border border-slate-200 bg-white p-8 sm:p-12 lg:p-16 shadow-xl">
            <div className="flex flex-col gap-6 sm:gap-8">
              {/* Top accent line */}
              <div className="flex items-center justify-center">
                <div className="h-1 w-20 rounded-full bg-slate-300" />
              </div>

              {/* Title */}
              <p className="text-center text-xs sm:text-sm font-semibold uppercase tracking-widest text-slate-600">
                {poster.title}
              </p>

              {/* Main message */}
              {poster.message && (
                <div className="relative flex justify-center">
                  {/* Decorative quote mark */}
                  <span
                    className="pointer-events-none absolute -top-6 sm:-top-8 left-0 sm:left-4 text-6xl sm:text-8xl leading-[0.6] text-slate-200 select-none font-[Georgia,serif]"
                    aria-hidden="true"
                  >
                    &ldquo;
                  </span>

                  {/* Quote text */}
                  <p className="relative text-center text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-slate-900 leading-snug sm:leading-[1.3] max-w-3xl">
                    {poster.message}
                  </p>
                </div>
              )}

              {/* Author */}
              {poster.author && (
                <div className="flex justify-center">
                  <p className="text-center text-sm sm:text-base font-semibold text-slate-700 relative pl-6">
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-0.5 bg-slate-400"></span>
                    {poster.author}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
