import { useState } from 'react';
import type { MetaFunction } from '@remix-run/react';
import Layout from '~/components/Layout';
import { Phone, Mail, Clock, CheckCircle2, Loader2 } from 'lucide-react';

export const meta: MetaFunction = () => {
  return [
    { title: 'Contact Us - Commerce Virtuals' },
    {
      name: 'description',
      content:
        'Contact Commerce Virtuals - CBSE, Maharashtra Board, and CUET coaching support. Call +91 6291 040 600 or email support@commercevirtuals.com',
    },
  ];
};

export default function ContactUsRoute() {
  const [formState, setFormState] = useState<
    'idle' | 'submitting' | 'success' | 'error'
  >('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormState('submitting');
    setErrorMsg('');

    const form = e.currentTarget;
    const data = {
      name: (form.elements.namedItem('name') as HTMLInputElement).value,
      email: (form.elements.namedItem('email') as HTMLInputElement).value,
      phone:
        (form.elements.namedItem('phone') as HTMLInputElement).value ||
        undefined,
      subject: (form.elements.namedItem('subject') as HTMLSelectElement).value,
      message: (form.elements.namedItem('message') as HTMLTextAreaElement)
        .value,
    };

    try {
      const resp = await fetch('/api/support-ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!resp.ok) {
        const err = await resp
          .json()
          .catch(() => ({ error: 'Something went wrong' }));
        throw new Error(err.error || 'Failed to submit');
      }

      setFormState('success');
      form.reset();
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong. Please try again.');
      setFormState('error');
    }
  }

  return (
    <Layout>
      <div className="flex flex-col">
        {/* Hero — matches homepage hero bg */}
        <section className="bg-[#EEF2FF]">
          <div className="custom-container pt-32 md:pt-52 lg:pt-56 pb-14 sm:pb-20 lg:pb-24 text-center">
            <p className="text-base sm:text-xl font-medium text-[#081627]/60 mb-2 md:mb-4 leading-[120%]">
              Contact Us
            </p>
            <h1 className="section-heading text-[#081627]">
              Get in Touch with Commerce Virtuals
            </h1>
            <p className="mt-4 text-base sm:text-lg text-[#081627]/60 max-w-xl mx-auto leading-[150%]">
              Have questions about our CBSE, Maharashtra Board, or CUET
              coaching? We&apos;re here to help!
            </p>
          </div>
        </section>

        <div className="my-10 lg:my-16" />

        {/* Contact Cards */}
        <section className="custom-container">
          <div className="text-center mb-8 lg:mb-12">
            <p className="text-base sm:text-xl font-medium text-lightgray mb-2 md:mb-4 leading-[120%]">
              Reach Out
            </p>
            <h2 className="section-heading text-lightgray">
              We&apos;re Here to Support You
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-8">
            {/* Phone */}
            <div className="rounded-2xl border border-[#0816271A] bg-white p-6 sm:p-8 transition-all duration-300 hover:shadow-md">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-[#3A6BFC]">
                  <Phone className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold text-lightgray">
                  Phone Support
                </h3>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-lightgray/60 mb-1">
                    Admissions & Sales
                  </p>
                  <a
                    href="tel:+916291040600"
                    className="text-[#3A6BFC] font-semibold text-lg hover:underline"
                  >
                    +91 6291 040 600
                  </a>
                </div>
                <span className="inline-block bg-white text-[#3A6BFC] px-3 py-1 rounded-full text-xs font-semibold">
                  Response within 24 hours
                </span>
              </div>
            </div>

            {/* Email */}
            <div className="rounded-2xl border border-[#0816271A] bg-white p-6 sm:p-8 transition-all duration-300 hover:shadow-md">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-[#3A6BFC]">
                  <Mail className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold text-lightgray">
                  Email Support
                </h3>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-lightgray/60 mb-1">
                    For All Inquiries
                  </p>
                  <a
                    href="mailto:support@commercevirtuals.com"
                    className="text-[#3A6BFC] font-semibold text-lg hover:underline break-all"
                  >
                    support@commercevirtuals.com
                  </a>
                </div>
                <span className="inline-block bg-white text-[#3A6BFC] px-3 py-1 rounded-full text-xs font-semibold">
                  Response within 24 hours
                </span>
                <p className="text-sm text-lightgray/50">
                  We read and respond to all emails during business hours.
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="my-10 lg:my-16" />

        {/* Support Hours */}
        <section className="custom-container">
          <div className="rounded-2xl border border-[#0816271A] bg-white p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#3A6BFC]">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-lightgray">
                Support Hours
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <p className="text-sm font-semibold text-[#3A6BFC] mb-1">
                  Monday - Friday
                </p>
                <p className="text-lightgray/70">9:00 AM - 6:00 PM IST</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-[#3A6BFC] mb-1">
                  Saturday
                </p>
                <p className="text-lightgray/70">10:00 AM - 4:00 PM IST</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-[#3A6BFC] mb-1">
                  Sunday & Holidays
                </p>
                <p className="text-lightgray/70">Response within 24-48 hours</p>
              </div>
            </div>
          </div>
        </section>

        <div className="my-10 lg:my-16" />

        {/* Contact Form */}
        <section className="custom-container">
          <div>
            <div className="text-center mb-8 lg:mb-12">
              <p className="text-base sm:text-xl font-medium text-lightgray mb-2 md:mb-4 leading-[120%]">
                Write to Us
              </p>
              <h2 className="section-heading text-lightgray">
                Send us a Message
              </h2>
            </div>

            <div className="rounded-2xl border border-[#0816271A] bg-white p-6 sm:p-8">
              {formState === 'success' ? (
                <div className="text-center py-10 space-y-4">
                  <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
                  <h3 className="text-xl font-semibold text-lightgray">
                    Message Sent Successfully!
                  </h3>
                  <p className="text-lightgray/60 max-w-md mx-auto">
                    Thank you for reaching out. We&apos;ve created a support
                    ticket and will get back to you within 24 hours.
                  </p>
                  <button
                    type="button"
                    onClick={() => setFormState('idle')}
                    className="primary-btn px-8 py-3 text-sm font-medium mt-4"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-lightgray mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        required
                        placeholder="Your name"
                        className="w-full px-4 py-3 rounded-xl border border-[#0816271A] text-lightgray text-sm focus:outline-none focus:ring-2 focus:ring-[#3A6BFC]/30 focus:border-[#3A6BFC] transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-lightgray mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        placeholder="your.email@example.com"
                        className="w-full px-4 py-3 rounded-xl border border-[#0816271A] text-lightgray text-sm focus:outline-none focus:ring-2 focus:ring-[#3A6BFC]/30 focus:border-[#3A6BFC] transition"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-lightgray mb-2">
                        Phone Number (Optional)
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        placeholder="Your phone number"
                        className="w-full px-4 py-3 rounded-xl border border-[#0816271A] text-lightgray text-sm focus:outline-none focus:ring-2 focus:ring-[#3A6BFC]/30 focus:border-[#3A6BFC] transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-lightgray mb-2">
                        Subject *
                      </label>
                      <select
                        name="subject"
                        required
                        defaultValue=""
                        className="w-full px-4 py-3 rounded-xl border border-[#0816271A] text-lightgray text-sm focus:outline-none focus:ring-2 focus:ring-[#3A6BFC]/30 focus:border-[#3A6BFC] transition"
                      >
                        <option value="" disabled>
                          Select a subject...
                        </option>
                        <option value="Technical Support">
                          Technical Support
                        </option>
                        <option value="Refund/Cancellation">
                          Refund/Cancellation
                        </option>
                        <option value="Enrollment">Enrollment Query</option>
                        <option value="Course Content">
                          Course Content Question
                        </option>
                        <option value="Mentorship">Mentorship Question</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-lightgray mb-2">
                      Your Message *
                    </label>
                    <textarea
                      name="message"
                      required
                      rows={5}
                      placeholder="Tell us how we can help you..."
                      className="w-full px-4 py-3 rounded-xl border border-[#0816271A] text-lightgray text-sm focus:outline-none focus:ring-2 focus:ring-[#3A6BFC]/30 focus:border-[#3A6BFC] transition resize-vertical"
                    />
                  </div>

                  {formState === 'error' && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                      {errorMsg}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={formState === 'submitting'}
                    className="primary-btn px-8 py-3 text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {formState === 'submitting' && (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    )}
                    {formState === 'submitting' ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>

        <div className="my-10 lg:my-16" />

        {/* Office Location */}
        <section className="custom-container">
          <div className="rounded-2xl border border-[#0816271A] bg-white p-6 sm:p-8">
            <h3 className="text-lg font-semibold text-lightgray mb-4">
              Our Office Location
            </h3>
            <div className="text-lightgray/70 space-y-1 leading-[160%]">
              <p className="font-semibold text-lightgray">Commerce Virtuals</p>
              <p className="text-[#3A6BFC] font-medium">
                c/o BB Virtuals Pvt. Ltd.
              </p>
              <p>Bunglow No. 340/360, RSC Road No. 37 Gorai 2</p>
              <p>Near Pragati Auto Stand</p>
              <p className="font-semibold text-lightgray">
                Borivali West, Mumbai - 400091
              </p>
              <p className="font-medium text-lightgray">Maharashtra, India</p>
              <p className="mt-4 text-sm text-lightgray/40 italic">
                We operate to serve students across India. Email and phone
                remain our primary contact methods.
              </p>
            </div>
          </div>
        </section>

        <div className="my-10 lg:my-20" />
      </div>
    </Layout>
  );
}
