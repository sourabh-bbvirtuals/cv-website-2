import type { MetaFunction } from '@remix-run/react';
import Layout from '~/components/Layout';
import {
  Smartphone,
  MonitorSmartphone,
  BookOpen,
  Video,
  FileText,
  ShieldCheck,
} from 'lucide-react';

export const meta: MetaFunction = () => [
  { title: 'Download App — Commerce Virtuals' },
  {
    name: 'description',
    content:
      'Download the Commerce Virtuals app on Android and iOS. Access recorded lectures, live classes, and study materials — anytime, anywhere.',
  },
];

const PLATFORMS = [
  {
    name: 'Android',
    subtitle: 'Google Play',
    href: 'https://play.google.com/store/apps/details?id=com.commercevirtuals.student',
    icon: (
      <svg viewBox="0 0 24 24" className="size-7" fill="currentColor">
        <path d="M17.523 2.293l-5.523 3.2-5.523-3.2-1.477.855 7 4.06 7-4.06-1.477-.855zm-12.523 2.707v14l7 4.06v-14l-7-4.06zm14 0l-7 4.06v14l7-4.06v-14z" />
      </svg>
    ),
    available: true,
  },
  {
    name: 'iOS',
    subtitle: 'App Store',
    href: 'https://apps.apple.com/app/commerce-virtual/id6761752942',
    icon: (
      <svg viewBox="0 0 24 24" className="size-7" fill="currentColor">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
      </svg>
    ),
    available: true,
  },
];

const FEATURES = [
  {
    icon: <Video className="size-6" strokeWidth={1.75} />,
    label: 'Recorded Lectures',
  },
  {
    icon: <MonitorSmartphone className="size-6" strokeWidth={1.75} />,
    label: 'Live Classes',
  },
  {
    icon: <FileText className="size-6" strokeWidth={1.75} />,
    label: 'Study Materials',
  },
  {
    icon: <ShieldCheck className="size-6" strokeWidth={1.75} />,
    label: 'Secure & Trusted',
  },
];

export default function DownloadPage() {
  return (
    <Layout>
      <div className="pt-24 lg:pt-32 min-h-screen bg-white">
        {/* Hero */}
        <section className="bg-[#FFF8F9] border-b border-[#0816271A] py-16 sm:py-20 lg:py-24">
          <div className="custom-container text-center">
            <div className="mx-auto max-w-2xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-lightgray/10 bg-white px-4 py-2 text-sm font-medium text-lightgray/70">
                <Smartphone className="size-4" />
                Available on Android & iOS
              </div>
              <h1 className="section-heading mb-4 sm:mb-5">
                Download Commerce Virtuals
              </h1>
              <p className="text-lightgray/70 text-base lg:text-xl leading-[160%] max-w-xl mx-auto">
                Access recorded lectures, live classes, and a comprehensive
                study library — anytime, anywhere, on every device.
              </p>
            </div>

            {/* Platform Cards */}
            <div className="mt-10 sm:mt-14 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
              {PLATFORMS.map((p) => (
                <a
                  key={p.name}
                  href={p.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex w-full sm:w-auto items-center gap-4 rounded-2xl border border-lightgray/10 bg-white px-6 py-4 sm:px-8 sm:py-5 shadow-sm transition-all hover:shadow-lg hover:-translate-y-0.5"
                >
                  <div className="flex size-12 sm:size-14 shrink-0 items-center justify-center rounded-xl bg-lightgray text-white">
                    {p.icon}
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-medium text-lightgray/50 uppercase tracking-wider">
                      {p.subtitle}
                    </p>
                    <p className="text-lg sm:text-xl font-semibold text-lightgray">
                      {p.name}
                    </p>
                  </div>
                  <svg
                    className="ml-auto size-5 text-lightgray/30 transition-colors group-hover:text-lightgray"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M7 17L17 7M17 7H7M17 7V17" />
                  </svg>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-14 sm:py-20">
          <div className="custom-container">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 max-w-3xl mx-auto">
              {FEATURES.map((f) => (
                <div
                  key={f.label}
                  className="flex flex-col items-center gap-3 rounded-2xl border border-lightgray/8 bg-[#FAFBFC] p-6 sm:p-8 text-center"
                >
                  <div className="flex size-12 items-center justify-center rounded-full bg-white text-lightgray shadow-sm border border-lightgray/8">
                    {f.icon}
                  </div>
                  <span className="text-sm sm:text-base font-medium text-lightgray leading-snug">
                    {f.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
