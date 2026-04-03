import type { MetaFunction } from '@remix-run/react';
import Layout from '~/components/Layout';
import MobileBottomNavigation from '~/components/bottom-navigation/mobile-bottom-navigation';
import {
  Headset,
  Truck,
  Monitor,
  Mail,
  Phone,
  ArrowUpRight,
} from 'lucide-react';

export const meta: MetaFunction = () => {
  return [
    {
      title: 'Support - Shubham Agrawal Classes',
    },
  ];
};

export default function SupportRoute() {
  return (
    <Layout>
      <div className="bg-white min-h-[calc(100vh-400px)] py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-[1340px] px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1c212f] tracking-tight">
              We&apos;re here to help
            </h1>
            <p className="mt-4 text-lg text-[#414151] font-medium opacity-80">
              Choose the support option that best matches your need. Our team
              will get back to you as soon as possible.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Sales & Order Support */}
            <div className="group flex flex-col items-center justify-center rounded-[32px] bg-slate-50 border border-slate-100 p-8 sm:p-12 text-center transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-white text-[#4aaeed] shadow-sm transform group-hover:scale-110 transition-transform duration-300">
                <Headset className="h-10 w-10" strokeWidth={1.5} />
              </div>
              <h2 className="text-2xl font-bold text-[#1c212f] mb-3">
                Sales & Order Support
              </h2>
              <div className="space-y-4">
                <div className="flex flex-col items-center">
                  <a
                    href="mailto:help.therankerway@gmail.com"
                    className="flex cursor-pointer items-center gap-1.5 text-[#414151] font-medium hover:text-[#4aaeed] transition-colors"
                  >
                    <Mail className="h-4 w-4 text-slate-400" />
                    help.therankerway@gmail.com
                  </a>
                </div>
                <div className="pt-2 space-y-2">
                  <a
                    href="tel:+919021701998"
                    className="flex cursor-pointer items-center justify-center gap-2 text-[#414151] font-semibold hover:text-[#4aaeed] transition-colors"
                  >
                    <Phone className="h-4 w-4 text-slate-400" />
                    +91 90217 01998
                  </a>
                  <a
                    href="tel:+918093361136"
                    className="flex cursor-pointer items-center justify-center gap-2 text-[#414151] font-semibold hover:text-[#4aaeed] transition-colors"
                  >
                    <Phone className="h-4 w-4 text-slate-400" />
                    +91 80933 61136
                  </a>
                </div>
              </div>
            </div>

            {/* Track Support */}
            <div className="group flex flex-col items-center justify-center rounded-[32px] bg-sky-50 border border-sky-100 p-8 sm:p-12 text-center transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1">
              <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-white text-[#4aaeed] shadow-sm transform group-hover:scale-110 transition-transform duration-300">
                <Truck className="h-10 w-10" strokeWidth={1.5} />
              </div>
              <h2 className="text-2xl font-bold text-[#1c212f] mb-3">
                Track Support
              </h2>
              <div className="space-y-4">
                <div className="flex flex-col items-center">
                  <a
                    href="mailto:support@classo.in"
                    className="flex cursor-pointer items-center gap-1.5 text-[#414151] font-medium hover:text-[#4aaeed] transition-colors"
                  >
                    <Mail className="h-4 w-4 text-slate-400" />
                    support@classo.in
                  </a>
                </div>
                <div className="pt-2">
                  <a
                    href="tel:+918260663724"
                    className="flex cursor-pointer items-center justify-center gap-2 text-[#414151] font-semibold hover:text-[#4aaeed] transition-colors"
                  >
                    <Phone className="h-4 w-4 text-slate-400" />
                    +91 82606 63724
                  </a>
                </div>
              </div>
            </div>

            {/* Tech Support */}
            <div className="group flex flex-col items-center justify-center rounded-[32px] bg-slate-50 border border-slate-100 p-8 sm:p-12 text-center transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-white text-[#4aaeed] shadow-sm transform group-hover:scale-110 transition-transform duration-300">
                <Monitor className="h-10 w-10" strokeWidth={1.5} />
              </div>
              <h2 className="text-2xl font-bold text-[#1c212f] mb-3">
                Tech Support
              </h2>
              <div className="space-y-4">
                <div className="flex flex-col items-center">
                  <a
                    href="mailto:tech.therankerway@gmail.com"
                    className="flex cursor-pointer items-center gap-1.5 text-[#414151] font-medium hover:text-[#4aaeed] transition-colors"
                  >
                    <Mail className="h-4 w-4 text-slate-400" />
                    tech.therankerway@gmail.com
                  </a>
                </div>
                <div className="pt-2 space-y-3">
                  <a
                    href="tel:+919960041136"
                    className="flex cursor-pointer items-center justify-center gap-2 text-[#414151] font-semibold hover:text-[#4aaeed] transition-colors"
                  >
                    <Phone className="h-4 w-4 text-slate-400" />
                    +91 9960041136
                  </a>
                  <div className="mt-2">
                    <a
                      href="https://forms.gle/your-tech-support-form"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-white px-5 py-2 text-sm font-bold text-[#1c212f] border border-slate-200 hover:bg-[#4aaeed] hover:text-white hover:border-[#4aaeed] transition-all"
                    >
                      Fill this Form
                      <ArrowUpRight className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <MobileBottomNavigation />
    </Layout>
  );
}
