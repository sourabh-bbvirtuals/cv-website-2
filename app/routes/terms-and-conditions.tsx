import type { MetaFunction } from '@remix-run/react';
import Layout from '~/components/Layout';

export const meta: MetaFunction = () => {
  return [
    { title: 'Terms & Conditions - Commerce Virtuals' },
    {
      name: 'description',
      content:
        'Terms & Conditions for Commerce Virtuals - Online commerce coaching platform for CBSE, Maharashtra Board, and CUET preparation.',
    },
  ];
};

export default function TermsAndConditionsRoute() {
  return (
    <Layout>
      <div className="bg-white min-h-screen">
        {/* Hero */}
        <div className="bg-[#EEF2FF] pt-32 md:pt-44 lg:pt-48 pb-16 sm:pb-20 lg:pb-24">
          <div className="custom-container text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#081627]">
              Terms & Conditions
            </h1>
            <p className="mt-4 text-lg text-[#081627]/60">
              Commerce Virtuals | EdTech Platform for CBSE, Maharashtra Board &
              CUET Preparation
            </p>
          </div>
        </div>

        <div className="custom-container py-12 lg:py-16 space-y-10">
          <div className="rounded-xl bg-amber-50 border-l-4 border-amber-400 p-5">
            <p className="text-amber-800 font-medium">
              <strong>Last Updated:</strong> April 2026 |{' '}
              <strong>Effective Date:</strong> Upon acceptance by user
            </p>
          </div>

          <Section title="1. Acceptance of Terms">
            <p>
              By accessing and using the Commerce Virtuals website and services,
              you agree to be bound by these Terms & Conditions. If you do not
              agree, you must not use the platform.
            </p>
            <p>
              These terms apply to all users, including students, parents, and
              any individuals accessing services through{' '}
              <strong>commercevirtuals.com</strong> or associated applications.
            </p>
            <NoteBox>
              Commerce Virtuals reserves the right to modify these terms at any
              time. Continued use constitutes acceptance of updated terms.
            </NoteBox>
          </Section>

          <Section title="2. Services Description">
            <h3 className="text-lg font-semibold text-slate-700 mt-6 mb-3">
              What We Provide
            </h3>
            <p>
              Commerce Virtuals provides online educational services including
              video lessons, test series, performance analytics, study
              materials, and mentorship guidance (mentorship coming soon) for
              CBSE, Maharashtra Board HSC, and CUET-UG preparation.
            </p>
            <h3 className="text-lg font-semibold text-slate-700 mt-6 mb-3">
              Service Limitations
            </h3>
            <ul className="list-disc pl-6 space-y-2 text-slate-600">
              <li>
                Services are provided &quot;as is&quot; without guarantees of
                specific exam results
              </li>
              <li>Content is for educational purposes only</li>
              <li>
                Access may be subject to internet connectivity and device
                compatibility
              </li>
              <li>
                Academic success depends on individual effort and practice
              </li>
            </ul>
          </Section>

          <Section title="3. User Accounts & Registration">
            <h3 className="text-lg font-semibold text-slate-700 mt-6 mb-3">
              Account Eligibility
            </h3>
            <ul className="list-disc pl-6 space-y-2 text-slate-600">
              <li>Users must be at least 14 years old</li>
              <li>Users under 18 require parental/guardian consent</li>
              <li>All registration information must be accurate</li>
            </ul>
            <h3 className="text-lg font-semibold text-slate-700 mt-6 mb-3">
              Account Responsibility
            </h3>
            <p>
              You are responsible for maintaining the confidentiality of your
              login credentials. You must notify us immediately of unauthorized
              access. We are not responsible for any misuse of your account.
            </p>
            <h3 className="text-lg font-semibold text-slate-700 mt-6 mb-3">
              Account Termination
            </h3>
            <p>
              We reserve the right to terminate accounts that violate these
              terms, engage in fraudulent behavior, or remain inactive for
              extended periods.
            </p>
          </Section>

          <Section title="4. Intellectual Property Rights">
            <h3 className="text-lg font-semibold text-slate-700 mt-6 mb-3">
              Ownership
            </h3>
            <p>
              All content on Commerce Virtuals—including videos, lessons, tests,
              notes, graphics, and designs—is protected by copyright and is the
              exclusive property of Commerce Virtuals or its content creators.
            </p>
            <h3 className="text-lg font-semibold text-slate-700 mt-6 mb-3">
              Permitted Use
            </h3>
            <p>
              You are granted a limited, non-exclusive license to access content
              for personal educational purposes only. You may download
              explicitly provided materials for offline viewing.
            </p>
            <h3 className="text-lg font-semibold text-slate-700 mt-6 mb-3">
              Prohibited Use
            </h3>
            <RestrictedBox>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  Reproduce, distribute, or transmit any content without
                  permission
                </li>
                <li>Copy lessons or test questions for redistribution</li>
                <li>Upload content to other websites or platforms</li>
                <li>Create derivative works based on our content</li>
                <li>Remove copyright notices or watermarks</li>
                <li>
                  Use content for commercial purposes without authorization
                </li>
                <li>
                  Screen record or screen capture videos (except through
                  official features)
                </li>
              </ul>
            </RestrictedBox>
            <h3 className="text-lg font-semibold text-slate-700 mt-6 mb-3">
              Violation Consequences
            </h3>
            <ul className="list-disc pl-6 space-y-2 text-slate-600">
              <li>Immediate account suspension or termination</li>
              <li>Legal action to protect intellectual property</li>
              <li>Liability for damages caused by infringement</li>
            </ul>
          </Section>

          <Section title="5. User Conduct & Prohibited Activities">
            <h3 className="text-lg font-semibold text-slate-700 mt-6 mb-3">
              Strictly Prohibited
            </h3>
            <RestrictedBox>
              <ul className="list-disc pl-6 space-y-2">
                <li>Abusive conduct, harassment, or threatening language</li>
                <li>Hate speech or discrimination</li>
                <li>Spam or unsolicited commercial promotion</li>
                <li>Cheating on tests or assessments</li>
                <li>Attempting to hack or disrupt the platform</li>
                <li>Impersonation of staff or other users</li>
                <li>Spreading misinformation</li>
                <li>Sharing illegal content</li>
                <li>Uploading malware or harmful code</li>
              </ul>
            </RestrictedBox>
            <h3 className="text-lg font-semibold text-slate-700 mt-6 mb-3">
              Consequences
            </h3>
            <ul className="list-disc pl-6 space-y-2 text-slate-600">
              <li>First violation: Warning and temporary suspension</li>
              <li>Repeated violations: Permanent account termination</li>
              <li>
                Serious violations: Immediate termination and legal action
              </li>
            </ul>
          </Section>

          <Section title="6. Limitations of Liability">
            <h3 className="text-lg font-semibold text-slate-700 mt-6 mb-3">
              Service Availability
            </h3>
            <p>
              Commerce Virtuals is provided &quot;AS IS&quot; without
              warranties. We do not guarantee uninterrupted service, specific
              exam results, data backup, or compatibility with all devices.
            </p>
            <h3 className="text-lg font-semibold text-slate-700 mt-6 mb-3">
              Limitation of Damages
            </h3>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW: Our total liability shall
              not exceed the amount paid by you for services in the past 12
              months. We are not liable for indirect, incidental, or
              consequential damages.
            </p>
            <h3 className="text-lg font-semibold text-slate-700 mt-6 mb-3">
              Third-Party Links
            </h3>
            <p>
              We are not responsible for external websites or their content. Use
              third-party links at your own risk.
            </p>
          </Section>

          <Section title="7. Disclaimers">
            <h3 className="text-lg font-semibold text-slate-700 mt-6 mb-3">
              No Guarantee of Results
            </h3>
            <p>
              We do NOT guarantee specific marks, grades, CUET rankings, or
              college admissions. Academic success depends on individual effort,
              understanding, and consistent practice.
            </p>
            <h3 className="text-lg font-semibold text-slate-700 mt-6 mb-3">
              Educational Use Only
            </h3>
            <p>
              Our platform is for educational support only—not a replacement for
              formal schooling, professional advice, or career counseling.
            </p>
            <h3 className="text-lg font-semibold text-slate-700 mt-6 mb-3">
              Curriculum Changes
            </h3>
            <p>
              While we strive to keep content aligned with official curricula,
              we are not responsible for changes to board syllabi that we may
              not immediately reflect.
            </p>
          </Section>

          <Section title="8. Indemnification">
            <p>
              You agree to indemnify and hold Commerce Virtuals harmless from
              any claims, damages, or losses arising from:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-600">
              <li>Your violation of these terms</li>
              <li>Your violation of applicable law</li>
              <li>Your infringement of third-party rights</li>
              <li>Your misuse of the platform</li>
              <li>Your user-generated content</li>
              <li>Your actions or conduct on the platform</li>
            </ul>
          </Section>

          <Section title="9. Account Termination & Data">
            <h3 className="text-lg font-semibold text-slate-700 mt-6 mb-3">
              Termination by User
            </h3>
            <p>
              You may request account termination at any time by contacting{' '}
              <a
                href="mailto:support@commercevirtuals.com"
                className="text-[#3A6BFC] font-semibold hover:underline"
              >
                support@commercevirtuals.com
              </a>
              .
            </p>
            <h3 className="text-lg font-semibold text-slate-700 mt-6 mb-3">
              Termination by Commerce Virtuals
            </h3>
            <p>
              We may terminate your account immediately if you violate these
              terms, engage in illegal activity, attempt to hack the platform,
              or cheat on assessments.
            </p>
            <h3 className="text-lg font-semibold text-slate-700 mt-6 mb-3">
              Data After Termination
            </h3>
            <ul className="list-disc pl-6 space-y-2 text-slate-600">
              <li>Your account access will be immediately revoked</li>
              <li>
                Profile data may be retained for legal compliance (up to 5
                years)
              </li>
              <li>Test scores are retained for historical accuracy</li>
              <li>
                You may request data deletion within 30 days of termination
              </li>
            </ul>
          </Section>

          <Section title="10. Modifications to Terms">
            <p>
              Commerce Virtuals reserves the right to modify these terms at any
              time. Material changes will be communicated via email. Continued
              use after modifications constitutes acceptance.
            </p>
            <p>
              <strong>
                It is your responsibility to review these terms periodically for
                updates.
              </strong>
            </p>
          </Section>

          <Section title="11. Governing Law & Jurisdiction">
            <h3 className="text-lg font-semibold text-slate-700 mt-6 mb-3">
              Applicable Law
            </h3>
            <p>
              These terms are governed by the laws of India, without regard to
              conflict of law principles.
            </p>
            <h3 className="text-lg font-semibold text-slate-700 mt-6 mb-3">
              Jurisdiction
            </h3>
            <p>
              Both parties agree to submit to the exclusive jurisdiction of
              courts in Mumbai, Maharashtra, India. Before initiating legal
              proceedings, we encourage negotiation. Disputes may also be
              resolved through mediation or arbitration as per the Indian
              Arbitration and Conciliation Act, 1996.
            </p>
            <h3 className="text-lg font-semibold text-slate-700 mt-6 mb-3">
              Consumer Protection
            </h3>
            <p>
              This agreement is subject to consumer protection laws applicable
              in India. Nothing herein excludes or limits your rights as a
              consumer.
            </p>
          </Section>

          <Section title="12. Contact Information">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse mt-4">
                <thead>
                  <tr className="bg-[#3A6BFC] text-white">
                    <th className="px-4 py-3 font-semibold rounded-tl-lg">
                      Purpose
                    </th>
                    <th className="px-4 py-3 font-semibold rounded-tr-lg">
                      Contact Details
                    </th>
                  </tr>
                </thead>
                <tbody className="text-slate-600">
                  <tr className="border-b border-slate-100">
                    <td className="px-4 py-3">Sales & Admissions</td>
                    <td className="px-4 py-3">
                      <strong>Phone:</strong>{' '}
                      <a
                        href="tel:+916291040600"
                        className="text-[#3A6BFC] hover:underline"
                      >
                        +91 6291 040 600
                      </a>
                      <br />
                      <strong>Email:</strong>{' '}
                      <a
                        href="mailto:support@commercevirtuals.com"
                        className="text-[#3A6BFC] hover:underline"
                      >
                        support@commercevirtuals.com
                      </a>
                    </td>
                  </tr>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <td className="px-4 py-3">Office Address</td>
                    <td className="px-4 py-3">
                      Commerce Virtuals
                      <br />
                      c/o BB Virtuals Pvt. Ltd.
                      <br />
                      Bunglow No. 340/360, RSC Road No. 37 Gorai 2<br />
                      Near Pragati Auto Stand
                      <br />
                      Borivali West, Mumbai - 400091
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">Website</td>
                    <td className="px-4 py-3">commercevirtuals.com</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <h3 className="text-lg font-semibold text-slate-700 mt-6 mb-3">
              Support Hours
            </h3>
            <ul className="list-disc pl-6 space-y-2 text-slate-600">
              <li>Monday - Friday: 9:00 AM - 6:00 PM IST</li>
              <li>Saturday: 10:00 AM - 4:00 PM IST</li>
              <li>Sunday & Holidays: Response within 24-48 hours</li>
            </ul>
          </Section>

          <Section title="13. Acknowledgment">
            <p>
              By using Commerce Virtuals, you acknowledge that you have read,
              understood, and agree to be bound by these Terms & Conditions.
            </p>
            <NoteBox>
              If you have questions about these terms, contact us at{' '}
              <a
                href="mailto:support@commercevirtuals.com"
                className="text-[#3A6BFC] font-semibold hover:underline"
              >
                support@commercevirtuals.com
              </a>{' '}
              before using the platform.
            </NoteBox>
          </Section>
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
      <h2 className="text-xl sm:text-2xl font-bold text-[#081627] mb-5 pb-4 border-b-2 border-[#3A6BFC]">
        {title}
      </h2>
      <div className="text-slate-600 leading-relaxed space-y-4">{children}</div>
    </section>
  );
}

function NoteBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg bg-blue-50 border-l-4 border-[#3A6BFC] p-4 mt-4 text-slate-700">
      <strong>Note:</strong> {children}
    </div>
  );
}

function RestrictedBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg bg-red-50 border-l-4 border-red-400 p-4 mt-2 text-slate-700">
      {children}
    </div>
  );
}
