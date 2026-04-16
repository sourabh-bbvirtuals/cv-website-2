import type { MetaFunction } from '@remix-run/react';
import Layout from '~/components/Layout';

export const meta: MetaFunction = () => {
  return [
    { title: 'Refund & Cancellations Policy - Commerce Virtuals' },
    {
      name: 'description',
      content:
        'Refund & Cancellations Policy for Commerce Virtuals - Clear terms for refunds, cancellations, course access, and payment disputes.',
    },
  ];
};

export default function RefundAndCancellationsRoute() {
  return (
    <Layout>
      <div className="bg-white min-h-screen">
        {/* Hero */}
        <div className="bg-[#EEF2FF] pt-32 md:pt-44 lg:pt-48 pb-16 sm:pb-20 lg:pb-24">
          <div className="custom-container text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#081627]">
              Refund & Cancellations Policy
            </h1>
            <p className="mt-4 text-lg text-[#081627]/60">
              Commerce Virtuals | Transparent, Fair, and Student-Centric
            </p>
          </div>
        </div>

        <div className="custom-container py-12 lg:py-16 space-y-10">
          {/* Intro */}
          <div className="rounded-xl bg-emerald-50 border-l-4 border-emerald-500 p-6">
            <h2 className="text-lg font-bold text-emerald-800 mb-2">
              Customer Satisfaction is Our Priority
            </h2>
            <p className="text-emerald-700">
              We believe in transparent pricing and fair refund policies. If
              you&apos;re not satisfied with Commerce Virtuals within 7 days,
              we&apos;ll process your refund quickly.
            </p>
          </div>

          {/* Policy Overview */}
          <Section title="Policy Overview">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="bg-emerald-500 text-white">
                    <th className="px-4 py-3 font-semibold rounded-tl-lg">
                      Aspect
                    </th>
                    <th className="px-4 py-3 font-semibold rounded-tr-lg">
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody className="text-slate-600">
                  <tr className="border-b border-slate-100">
                    <td className="px-4 py-3 font-medium">Refund Window</td>
                    <td className="px-4 py-3">
                      7 days from the date of purchase
                    </td>
                  </tr>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <td className="px-4 py-3 font-medium">
                      Content Consumption Limit
                    </td>
                    <td className="px-4 py-3">
                      Must not consume more than 20% of course content
                    </td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="px-4 py-3 font-medium">Processing Time</td>
                    <td className="px-4 py-3">
                      7-10 business days after approval
                    </td>
                  </tr>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <td className="px-4 py-3 font-medium">
                      Parent Company Policy
                    </td>
                    <td className="px-4 py-3">
                      Aligned with{' '}
                      <a
                        href="https://www.bbvirtuals.com/refund"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-600 font-semibold hover:underline"
                      >
                        bbvirtuals.com/refund
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium">Contact</td>
                    <td className="px-4 py-3">
                      <a
                        href="mailto:support@commercevirtuals.com"
                        className="text-emerald-600 hover:underline"
                      >
                        support@commercevirtuals.com
                      </a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Section>

          {/* 7-Day Money Back Guarantee */}
          <Section title="7-Day Money Back Guarantee">
            <div className="rounded-lg bg-emerald-50 border-l-4 border-emerald-500 p-4 mb-6">
              <strong className="text-emerald-800">
                Risk-Free Trial Period:
              </strong>{' '}
              <span className="text-emerald-700">
                If you&apos;re not satisfied within 7 days of purchase, you can
                request a full refund—no questions asked.
              </span>
            </div>

            <h3 className="text-lg font-semibold text-slate-700 mt-6 mb-3">
              Eligibility for Full Refund
            </h3>
            <p>You&apos;re eligible for a full refund if:</p>
            <ul className="list-disc pl-6 space-y-2 text-slate-600">
              <li>
                Your refund request is submitted within 7 days of purchase
              </li>
              <li>
                You haven&apos;t consumed more than 20% of the course content
              </li>
              <li>You haven&apos;t completed more than 50% of assessments</li>
              <li>Your account is in good standing</li>
            </ul>

            <h3 className="text-lg font-semibold text-slate-700 mt-6 mb-3">
              What Qualifies for Full Refund
            </h3>
            <div className="rounded-lg bg-emerald-50 border-l-4 border-emerald-500 p-4">
              <ul className="space-y-2 text-emerald-800">
                <li>&#10003; Course access fees</li>
                <li>&#10003; Subscription plans (monthly/quarterly/annual)</li>
                <li>&#10003; Test series access</li>
                <li>&#10003; Bundle purchases</li>
              </ul>
            </div>

            <h3 className="text-lg font-semibold text-slate-700 mt-6 mb-3">
              What Does NOT Qualify for Refund
            </h3>
            <div className="rounded-lg bg-amber-50 border-l-4 border-amber-400 p-4">
              <ul className="space-y-2 text-amber-800">
                <li>
                  &#10007; Promotional discounts or coupon value (if applied)
                </li>
                <li>
                  &#10007; Downloadable study materials (after downloading)
                </li>
                <li>
                  &#10007; Completed assessments (test scores cannot be
                  reversed)
                </li>
                <li>&#10007; Requests after 7 days from purchase</li>
              </ul>
            </div>
          </Section>

          {/* How to Request a Refund */}
          <Section title="How to Request a Refund">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-6">
              {[
                {
                  step: '1',
                  title: 'Email Us',
                  desc: 'Send refund request to support@commercevirtuals.com',
                },
                {
                  step: '2',
                  title: 'Provide Details',
                  desc: 'Include order ID, name, reason for refund',
                },
                {
                  step: '3',
                  title: 'Verification',
                  desc: 'We review your eligibility (24-48 hours)',
                },
                {
                  step: '4',
                  title: 'Processing',
                  desc: 'Refund processed (7-10 business days)',
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="rounded-xl bg-emerald-50 border-2 border-emerald-200 p-5 text-center"
                >
                  <div className="text-3xl font-bold text-emerald-500 mb-2">
                    {item.step}
                  </div>
                  <h4 className="font-semibold text-slate-800 mb-1">
                    {item.title}
                  </h4>
                  <p className="text-sm text-slate-600">{item.desc}</p>
                </div>
              ))}
            </div>

            <h3 className="text-lg font-semibold text-slate-700 mt-8 mb-4">
              Step-by-Step Refund Request Process
            </h3>
            <div className="rounded-xl border-2 border-emerald-200 p-6 space-y-6">
              {[
                {
                  step: '1',
                  title: 'Send Refund Request Email',
                  content: (
                    <>
                      <p>
                        <strong>To:</strong>{' '}
                        <a
                          href="mailto:support@commercevirtuals.com"
                          className="text-emerald-600 font-semibold hover:underline"
                        >
                          support@commercevirtuals.com
                        </a>
                      </p>
                      <p>
                        <strong>Subject:</strong> Refund Request - [Your Name] -
                        Order ID [XXXXX]
                      </p>
                      <p>
                        <strong>Include:</strong> Full name, registered email,
                        order ID, purchase date, reason for refund, payment
                        method
                      </p>
                    </>
                  ),
                },
                {
                  step: '2',
                  title: 'Verification (24-48 Hours)',
                  content: (
                    <p>
                      We check if your request meets the 7-day window and
                      eligibility criteria. You&apos;ll receive an email
                      confirming receipt.
                    </p>
                  ),
                },
                {
                  step: '3',
                  title: 'Approval Notification',
                  content: (
                    <p>
                      If approved, we&apos;ll email you a confirmation and
                      process the refund. If denied, we&apos;ll explain the
                      reason.
                    </p>
                  ),
                },
                {
                  step: '4',
                  title: 'Refund Processing (7-10 Business Days)',
                  content: (
                    <p>
                      The refund is credited to your original payment method.
                      Bank processing times may vary (2-5 additional business
                      days).
                    </p>
                  ),
                },
                {
                  step: '5',
                  title: 'Account Access Revoked',
                  content: (
                    <p>
                      Once refund is approved, your course access is immediately
                      revoked.
                    </p>
                  ),
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="flex gap-5 pb-6 border-b border-slate-100 last:border-b-0 last:pb-0"
                >
                  <div className="w-10 h-10 shrink-0 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold">
                    {item.step}
                  </div>
                  <div className="text-slate-600 space-y-1">
                    <h4 className="font-semibold text-emerald-700">
                      {item.title}
                    </h4>
                    {item.content}
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* Cancellation After 7 Days */}
          <Section title="Cancellation After 7 Days">
            <p>
              If you&apos;ve used the platform for more than 7 days, you can
              still cancel your subscription without requesting a refund:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-600">
              <li>
                <strong className="text-red-500">No refund</strong> for courses
                already accessed
              </li>
              <li>Your subscription will not renew</li>
              <li>
                You can access the course until your subscription period ends
              </li>
            </ul>

            <h3 className="text-lg font-semibold text-slate-700 mt-6 mb-3">
              How to Cancel Subscription
            </h3>
            <ol className="list-decimal pl-6 space-y-2 text-slate-600">
              <li>Log in to your Commerce Virtuals account</li>
              <li>Go to Settings &rarr; Subscriptions & Billing</li>
              <li>Click &quot;Cancel Subscription&quot;</li>
              <li>Confirm cancellation</li>
            </ol>
            <p className="mt-4">
              <strong>OR</strong> email{' '}
              <a
                href="mailto:support@commercevirtuals.com"
                className="text-emerald-600 font-semibold hover:underline"
              >
                support@commercevirtuals.com
              </a>{' '}
              with subject &quot;Subscription Cancellation Request&quot;
            </p>
          </Section>

          {/* FAQ */}
          <Section title="Frequently Asked Questions">
            <div className="space-y-4">
              {[
                {
                  q: "Can I get a refund if I've watched all the videos?",
                  a: "If you've consumed more than 20% of the course content, you're not eligible for a refund. The 7-day window is to let you try the platform, not to use the entire course for free.",
                },
                {
                  q: 'What if I purchased within 7 days but my request is delayed?',
                  a: 'Refund eligibility is based on the purchase date. We recommend submitting requests as soon as possible. Requests submitted more than 30 days after purchase may be denied.',
                },
                {
                  q: 'How long does refund processing take?',
                  a: "We process refunds within 7-10 business days of approval. Your bank may take an additional 2-5 business days to credit the amount. If you don't see the refund after 15 days, contact your bank with your transaction ID.",
                },
                {
                  q: 'Can I get a refund to a different payment method?',
                  a: 'Refunds are issued to the original payment method used for purchase. This is for security purposes.',
                },
                {
                  q: 'What if I cancel my subscription mid-month?',
                  a: "If you cancel a monthly subscription, you keep access until the end of the current billing month. There's no pro-rata refund for unused days in the same cycle.",
                },
                {
                  q: 'Can I request a refund for downloaded materials?',
                  a: "Once you download study materials, they're yours to keep. These are not refundable as the content has been delivered.",
                },
              ].map((faq) => (
                <div
                  key={faq.q}
                  className="rounded-lg bg-slate-50 border-l-4 border-emerald-400 p-4"
                >
                  <h4 className="font-semibold text-slate-800 mb-2">
                    Q: {faq.q}
                  </h4>
                  <p className="text-slate-600">
                    <strong>A:</strong> {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </Section>

          {/* Parent Company */}
          <Section title="Parent Company Policy Alignment">
            <p>
              This refund policy is aligned with our parent company BB
              Virtuals&apos; refund guidelines. For additional details, you can
              refer to:
            </p>
            <p className="mt-2">
              <a
                href="https://www.bbvirtuals.com/refund"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-600 font-bold hover:underline"
              >
                https://www.bbvirtuals.com/refund
              </a>
            </p>
            <p className="mt-4">
              Our 7-day refund window and 20% content consumption limit ensure
              consistency across the BB Virtuals family of platforms.
            </p>
          </Section>

          {/* Contact */}
          <Section title="Contact Information">
            <p>
              <strong>For Refund Requests:</strong>
            </p>
            <p className="mt-2">
              <a
                href="mailto:support@commercevirtuals.com"
                className="text-emerald-600 font-semibold hover:underline"
              >
                support@commercevirtuals.com
              </a>
              <br />
              <a
                href="tel:+916291040600"
                className="text-emerald-600 font-semibold hover:underline"
              >
                +91 62910 40 600 (Admissions & Sales)
              </a>
            </p>
            <p className="mt-4">
              <strong>Response Time:</strong> Within 24 hours on business days
            </p>
          </Section>

          <div className="text-center py-6 text-slate-500 text-sm">
            <p>
              <strong>
                Commerce Virtuals &copy; 2026. All rights reserved.
              </strong>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-100 bg-white p-6 sm:p-8 shadow-sm">
      <h2 className="text-xl sm:text-2xl font-bold text-[#081627] mb-5 pb-4 border-b-2 border-emerald-500">
        {title}
      </h2>
      <div className="text-slate-600 leading-relaxed space-y-4">{children}</div>
    </section>
  );
}
