export function LimitReachedOverlay() {
  return (
    <div className="relative mt-8">
      <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-b from-transparent via-white/80 to-white" />
      <div className="relative z-20 flex flex-col items-center justify-center py-16 text-center">
        <div className="mx-auto max-w-md rounded-2xl border border-[rgba(8,22,39,0.08)] bg-white px-6 py-8 shadow-lg">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-[#eef2ff]">
            <svg
              className="size-7 text-[#3a6bfc]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold leading-[150%] tracking-tight text-lightgray">
            Download Our App
          </h3>
          <p className="mt-2 text-base leading-[150%] text-lightgray/60">
            Get the Commerce Virtuals app for full access to all free resources,
            premium content, live classes &amp; more.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <a
              href="https://play.google.com/store/apps/details?id=com.commercevirtuals.student&hl=en_IN"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-opacity hover:opacity-80"
            >
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                alt="Get it on Google Play"
                className="h-11"
              />
            </a>
            <a
              href="https://apps.apple.com/app/commerce-virtual/id6761752942"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-opacity hover:opacity-80"
            >
              <img
                src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg"
                alt="Download on the App Store"
                className="h-11"
              />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
