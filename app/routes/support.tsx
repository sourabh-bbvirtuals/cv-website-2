import { useState } from 'react';
import type { MetaFunction } from '@remix-run/react';
import Layout from '~/components/Layout';
import { Headset, Monitor, Mail, Phone, Send } from 'lucide-react';

export const meta: MetaFunction = () => [
  { title: 'Support — Commerce Virtuals' },
  {
    name: 'description',
    content:
      'Need help with your Commerce Virtuals account, courses, or app? Reach our support team via email or phone.',
  },
];

const SUPPORT_CARDS = [
  {
    icon: Headset,
    title: 'Admissions & Sales',
    description: 'Course enquiries, pricing, and enrollment help.',
    email: 'support@commercevirtuals.com',
    phone: '+91 6291 040 600',
    phoneHref: 'tel:+916291040600',
    accent: 'bg-blue-50 border-blue-100',
    iconBg: 'bg-blue-50 text-blue-500',
  },
  {
    icon: Send,
    title: 'General Support',
    description: 'Order issues, refunds, and account queries.',
    email: 'support@commercevirtuals.com',
    phone: '+91 6291 050 600',
    phoneHref: 'tel:+916291050600',
    accent: 'bg-amber-50 border-amber-100',
    iconBg: 'bg-amber-50 text-amber-500',
  },
  {
    icon: Monitor,
    title: 'Tech Support',
    description: 'App issues, login problems, and technical help.',
    email: 'support@commercevirtuals.com',
    phone: '+91 6291 050 600',
    phoneHref: 'tel:+916291050600',
    accent: 'bg-emerald-50 border-emerald-100',
    iconBg: 'bg-emerald-50 text-emerald-500',
  },
];

export default function SupportRoute() {
  return (
    <Layout>
      <div className="pt-24 lg:pt-32 min-h-screen bg-white">
        {/* Hero */}
        <section className="bg-[#FFF8F9] border-b border-[#0816271A] py-14 sm:py-18 lg:py-22">
          <div className="custom-container text-center">
            <div className="mx-auto max-w-2xl">
              <h1 className="section-heading mb-3 sm:mb-4">
                We're here to help
              </h1>
              <p className="text-lightgray/70 text-base lg:text-xl leading-[160%]">
                Choose the support option that best matches your need. Our team
                will get back to you as soon as possible.
              </p>
            </div>
          </div>
        </section>

        {/* Support Cards */}
        <section className="py-12 sm:py-16 lg:py-20">
          <div className="custom-container">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 max-w-4xl mx-auto">
              {SUPPORT_CARDS.map((card) => {
                const Icon = card.icon;
                return (
                  <div
                    key={card.title}
                    className={`group flex flex-col items-center rounded-2xl border ${card.accent} p-7 sm:p-9 text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5`}
                  >
                    <div
                      className={`mb-5 flex size-14 items-center justify-center rounded-full ${card.iconBg} transition-transform group-hover:scale-110`}
                    >
                      <Icon className="size-6" strokeWidth={1.75} />
                    </div>

                    <h2 className="text-lg sm:text-xl font-semibold text-lightgray mb-1.5">
                      {card.title}
                    </h2>
                    <p className="text-sm text-lightgray/50 leading-relaxed mb-6">
                      {card.description}
                    </p>

                    <div className="mt-auto flex flex-col items-center gap-3 w-full">
                      <a
                        href={`mailto:${card.email}`}
                        className="flex items-center gap-2 text-sm font-medium text-lightgray/70 hover:text-lightgray transition-colors"
                      >
                        <Mail className="size-4 text-lightgray/40" />
                        {card.email}
                      </a>
                      <a
                        href={card.phoneHref}
                        className="flex items-center gap-2 text-base font-semibold text-lightgray hover:text-blue-600 transition-colors"
                      >
                        <Phone className="size-4 text-lightgray/40" />
                        {card.phone}
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Direct email CTA */}
            <p className="mt-12 text-center text-sm sm:text-base text-lightgray/50">
              You can also email us directly at{' '}
              <a
                href="mailto:support@commercevirtuals.com"
                className="font-medium text-lightgray hover:underline"
              >
                support@commercevirtuals.com
              </a>
            </p>
          </div>
        </section>
      </div>
    </Layout>
  );
}
