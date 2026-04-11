import type { MetaFunction } from '@remix-run/react';
import Layout from '~/components/Layout';

export const meta: MetaFunction = () => {
  return [
    { title: 'Privacy Policy - Commerce Virtuals' },
    {
      name: 'description',
      content:
        'Privacy Policy for Commerce Virtuals - how we collect, use, disclose, and safeguard your information when you use our mobile application and website.',
    },
  ];
};

export default function PrivacyPolicyRoute() {
  return (
    <Layout>
      <div className="bg-white min-h-screen">
        {/* Hero */}
        <div className="bg-[#EEF2FF] pt-32 md:pt-44 lg:pt-48 pb-16 sm:pb-20 lg:pb-24">
          <div className="custom-container text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#081627]">
              Privacy Policy
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
              <strong>Effective Date:</strong> April 10, 2026 |{' '}
              <strong>Last Updated:</strong> April 10, 2026
            </p>
          </div>

          <Section title="Introduction">
            <p>
              Welcome to Commerce Virtuals (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;).
              We are committed to protecting the privacy and personal information of our
              users, including students, parents, and guardians (&ldquo;you&rdquo; or &ldquo;User&rdquo;).
              This Privacy Policy describes how we collect, use, disclose, and safeguard
              your information when you use our mobile application (&ldquo;App&rdquo;) and
              website (&ldquo;Platform&rdquo;).
            </p>
            <p>
              This Privacy Policy is compliant with applicable Indian laws — the IT Act, 2000,
              IT (SPDI) Rules, 2011, IT Intermediary Guidelines, 2021 — and aligns with
              Google Play Store requirements for apps published in India.
            </p>
            <NoteBox>
              By downloading, installing, or using the Commerce Virtuals App, you agree to
              the terms of this Privacy Policy. If you do not agree, please do not use our
              Platform.
            </NoteBox>
          </Section>

          <Section title="1. Information We Collect">
            <h3 className="text-lg font-semibold text-slate-700 mt-6 mb-3">
              1.1 — Information You Provide Directly
            </h3>
            <ul className="list-disc pl-6 space-y-2 text-slate-600">
              <li>Full name and age / date of birth</li>
              <li>Email address and mobile phone number</li>
              <li>School name, class (11 or 12), and board (CBSE / Maharashtra HSC)</li>
              <li>City and state (for Maharashtra-region relevant content delivery)</li>
              <li>Username and password (stored in encrypted form)</li>
              <li>Profile photo (optional)</li>
              <li>Payment information (processed by third-party gateways; we do not store full card details)</li>
              <li>Communications you send us via support chat or email</li>
            </ul>

            <h3 className="text-lg font-semibold text-slate-700 mt-6 mb-3">
              1.2 — Information Collected Automatically
            </h3>
            <ul className="list-disc pl-6 space-y-2 text-slate-600">
              <li>Device information: device model, OS version, unique device identifiers (Android ID)</li>
              <li>App usage data: features accessed, videos watched, time spent, quiz scores and test performance</li>
              <li>Log data: IP address, crash reports, app errors, session timestamps</li>
              <li>Push notification token (for sending test reminders and live class alerts)</li>
              <li>Approximate location (city/region level, for Maharashtra Board content personalisation)</li>
            </ul>

            <h3 className="text-lg font-semibold text-slate-700 mt-6 mb-3">
              1.3 — Information From Third Parties
            </h3>
            <ul className="list-disc pl-6 space-y-2 text-slate-600">
              <li>If you sign in with Google, we receive your name, email address, and profile photo from Google OAuth</li>
              <li>Payment status and transaction IDs from Razorpay / PhonePe</li>
              <li>Analytics data from Firebase Analytics and Crashlytics</li>
            </ul>
          </Section>

          <Section title="2. How We Use Your Information">
            <h3 className="text-lg font-semibold text-slate-700 mt-6 mb-3">
              2.1 — To Provide Our Educational Services
            </h3>
            <ul className="list-disc pl-6 space-y-2 text-slate-600">
              <li>Create and manage your student account</li>
              <li>Deliver live and recorded classes, notes, and test series for CBSE, Maharashtra HSC, and CUET-UG</li>
              <li>Personalise content recommendations based on your board, class, and subject selections</li>
              <li>Track your progress, quiz scores, and test performance</li>
              <li>Issue certificates of completion or achievement (where applicable)</li>
            </ul>

            <h3 className="text-lg font-semibold text-slate-700 mt-6 mb-3">
              2.2 — To Communicate With You
            </h3>
            <ul className="list-disc pl-6 space-y-2 text-slate-600">
              <li>Send push notifications for upcoming live classes, test schedules, and important announcements</li>
              <li>Send SMS/WhatsApp alerts for critical updates (test results, new content releases)</li>
              <li>Respond to your queries and provide customer support</li>
              <li>Send promotional offers and course recommendations (you may opt out at any time)</li>
            </ul>

            <h3 className="text-lg font-semibold text-slate-700 mt-6 mb-3">
              2.3 — To Improve Our Platform
            </h3>
            <ul className="list-disc pl-6 space-y-2 text-slate-600">
              <li>Analyse usage patterns to improve content quality and user experience</li>
              <li>Conduct research to develop better study materials for Maharashtra Board HSC and CBSE students</li>
              <li>Debug technical issues and prevent fraud</li>
            </ul>

            <h3 className="text-lg font-semibold text-slate-700 mt-6 mb-3">
              2.4 — To Process Payments
            </h3>
            <ul className="list-disc pl-6 space-y-2 text-slate-600">
              <li>Verify and process subscription and course purchase payments</li>
              <li>Maintain records of transactions for compliance and accounting purposes</li>
            </ul>
          </Section>

          <Section title="3. Children's Privacy">
            <p>
              Commerce Virtuals is designed for students in Class 11 and Class 12, who are
              typically between 15 and 18 years of age. We are mindful of the privacy
              protections required for minors.
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-600">
              <li>We do not knowingly collect personal information from children under 13 without verifiable parental consent</li>
              <li>For users between 13 and 18 years, we strongly encourage a parent or guardian to review this Policy and supervise account creation</li>
              <li>Parents or guardians may contact us at any time to review, correct, or delete their child&apos;s personal information</li>
              <li>We do not display targeted behavioural advertising to users under 18 years of age</li>
              <li>We do not allow minors to make in-app purchases without parental consent being confirmed through our payment flow</li>
            </ul>
            <NoteBox>
              If we discover that we have inadvertently collected personal information from a
              child under 13 without consent, we will delete it immediately. Please contact
              us at{' '}
              <a href="mailto:privacy@commercevirtuals.in" className="text-[#3A6BFC] font-semibold hover:underline">
                privacy@commercevirtuals.in
              </a>{' '}
              to report such concerns.
            </NoteBox>
          </Section>

          <Section title="4. Sharing of Information">
            <p>
              We do not sell, rent, or trade your personal information to any third party.
              We may share your information only in the following limited circumstances.
            </p>

            <h3 className="text-lg font-semibold text-slate-700 mt-6 mb-3">
              4.1 — Service Providers
            </h3>
            <p>
              We work with trusted third-party service providers who assist us in operating
              our Platform. These include:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-600">
              <li>Cloud hosting providers (AWS / Google Cloud) for data storage and infrastructure</li>
              <li>Firebase (Google) for push notifications, analytics, and crash reporting</li>
              <li>Razorpay / PhonePe for payment processing</li>
              <li>Zoom / similar platforms for live class delivery</li>
              <li>Customer support tools (Freshdesk / Intercom) for managing student queries</li>
            </ul>
            <p>
              All service providers are bound by data processing agreements and are not
              permitted to use your data for their own purposes.
            </p>

            <h3 className="text-lg font-semibold text-slate-700 mt-6 mb-3">
              4.2 — Legal Requirements
            </h3>
            <p>
              We may disclose your information if required by law, court order, or government
              authority, or to protect the rights, property, or safety of Commerce Virtuals,
              our users, or the public.
            </p>

            <h3 className="text-lg font-semibold text-slate-700 mt-6 mb-3">
              4.3 — Business Transfer
            </h3>
            <p>
              In the event of a merger, acquisition, or sale of assets, your information may
              be transferred. We will notify you via email or prominent in-app notice before
              your information is transferred and becomes subject to a different Privacy Policy.
            </p>

            <h3 className="text-lg font-semibold text-slate-700 mt-6 mb-3">
              4.4 — With Your Consent
            </h3>
            <p>
              We may share your information with third parties when you give us explicit
              consent to do so, such as when you participate in partner scholarships or
              external competitions.
            </p>
          </Section>

          <Section title="5. Data Storage & Security">
            <p>
              Your data is stored on secure servers located in India or in regions that
              comply with applicable data protection standards.
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-600">
              <li>All passwords are hashed using industry-standard encryption (bcrypt)</li>
              <li>All data in transit is encrypted using TLS 1.2 or higher (HTTPS)</li>
              <li>Payment data is tokenised and handled by PCI-DSS compliant gateways</li>
              <li>We conduct periodic security audits and vulnerability assessments</li>
              <li>Access to personal data is restricted to authorised personnel on a need-to-know basis</li>
            </ul>
            <NoteBox>
              While we implement industry best practices, no method of electronic storage or
              transmission is 100% secure. We encourage you to use a strong password and keep
              your login credentials confidential.
            </NoteBox>
          </Section>

          <Section title="6. Data Retention">
            <p>
              We retain your personal information for as long as your account is active or
              as needed to provide our services.
            </p>
            <div className="overflow-x-auto mt-4">
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="bg-[#3A6BFC] text-white">
                    <th className="px-4 py-3 font-semibold rounded-tl-lg">Retention Period</th>
                    <th className="px-4 py-3 font-semibold rounded-tr-lg">Data Type</th>
                  </tr>
                </thead>
                <tbody className="text-slate-600">
                  <tr className="border-b border-slate-100">
                    <td className="px-4 py-3 font-medium">Up to 3 Years after account closure</td>
                    <td className="px-4 py-3">Active account data — retained for the duration of your subscription and for legal and compliance purposes</td>
                  </tr>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <td className="px-4 py-3 font-medium">2 Years after last active session</td>
                    <td className="px-4 py-3">Test scores, progress reports, and academic records — so you can access your performance history</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium">7 Years</td>
                    <td className="px-4 py-3">Payment transaction records — as required under Indian accounting laws</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-4">
              You may request deletion of your account and associated data at any time (see Section 8).
            </p>
          </Section>

          <Section title="7. App Permissions">
            <p>
              All permissions are requested only when necessary for the specific feature.
              You can revoke any permission at any time from your device&apos;s Settings.
            </p>
            <div className="overflow-x-auto mt-4">
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="bg-[#3A6BFC] text-white">
                    <th className="px-4 py-3 font-semibold rounded-tl-lg">Permission</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold rounded-tr-lg">Purpose</th>
                  </tr>
                </thead>
                <tbody className="text-slate-600">
                  <tr className="border-b border-slate-100">
                    <td className="px-4 py-3 font-medium">Internet Access</td>
                    <td className="px-4 py-3">Required</td>
                    <td className="px-4 py-3">Streaming classes, downloading notes, and accessing test series</td>
                  </tr>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <td className="px-4 py-3 font-medium">Notifications</td>
                    <td className="px-4 py-3">Required</td>
                    <td className="px-4 py-3">Timely alerts for live classes, test schedules, and results</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="px-4 py-3 font-medium">Receive Boot Completed</td>
                    <td className="px-4 py-3">Required</td>
                    <td className="px-4 py-3">Reschedule local reminder notifications after device restart</td>
                  </tr>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <td className="px-4 py-3 font-medium">Storage / Files</td>
                    <td className="px-4 py-3">Optional</td>
                    <td className="px-4 py-3">Download offline PDF notes and study materials</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="px-4 py-3 font-medium">Camera</td>
                    <td className="px-4 py-3">Optional</td>
                    <td className="px-4 py-3">Scan QR codes for chapter content or set a profile photo</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium">Microphone</td>
                    <td className="px-4 py-3">Optional</td>
                    <td className="px-4 py-3">Live interactive class sessions for Q&amp;A only</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Section>

          <Section title="8. Your Rights & Choices">
            <p>
              As a user, you have the following rights regarding your personal information.
              To exercise any right, contact us at{' '}
              <a href="mailto:privacy@commercevirtuals.in" className="text-[#3A6BFC] font-semibold hover:underline">
                privacy@commercevirtuals.in
              </a>{' '}
              with the subject line &ldquo;Privacy Request&rdquo;. We will respond within 30 business days.
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-600 mt-4">
              <li><strong>Access:</strong> Request a copy of the personal data we hold about you</li>
              <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
              <li><strong>Deletion:</strong> Request deletion of your account and personal data (subject to legal retention requirements)</li>
              <li><strong>Opt-Out:</strong> Unsubscribe from promotional emails and SMS at any time</li>
              <li><strong>Notifications:</strong> Manage preferences within the App under Settings &rarr; Notifications</li>
              <li><strong>Portability:</strong> Request your test scores and progress data in a common format</li>
            </ul>
          </Section>

          <Section title="9. Third-Party Links">
            <p>
              Our Platform may contain links to third-party websites such as CBSE.gov.in,
              Maharashtra Board&apos;s mahahsscboard.in, or YouTube for supplementary content.
              This Privacy Policy does not apply to those third-party websites.
            </p>
            <NoteBox>
              We are not responsible for the privacy practices or content of third-party
              websites. We encourage you to review the privacy policies of any third-party
              sites you visit.
            </NoteBox>
          </Section>

          <Section title="10. Cookies & Tracking">
            <p>
              Our website (commercevirtuals.in) uses cookies and similar tracking technologies
              to enhance your experience. You can manage cookie preferences through your browser settings.
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-600 mt-4">
              <li><strong>Essential:</strong> Required for basic website functionality, login sessions, and security. Cannot be disabled.</li>
              <li><strong>Analytics:</strong> Used via Google Analytics to understand how visitors use our website. Data is aggregated and anonymised.</li>
              <li><strong>Preference:</strong> Used to remember your board and class preferences for a personalised experience.</li>
            </ul>
            <NoteBox>
              Disabling essential cookies may impact website functionality.
            </NoteBox>
          </Section>

          <Section title="11. Policy Changes">
            <p>
              We may update this Privacy Policy from time to time to reflect changes in our
              practices, legal requirements, or new features. When we make material changes, we will:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-600">
              <li>Post the updated Privacy Policy in the App and on our website</li>
              <li>Update the &ldquo;Last Updated&rdquo; date at the top of this document</li>
              <li>Send you an in-app notification or email alert for significant changes</li>
            </ul>
            <p>
              Your continued use of the Platform after the effective date of any updated
              Privacy Policy constitutes your acceptance of the changes.
            </p>
          </Section>

          <Section title="12. Grievance Officer">
            <p>
              In accordance with the Information Technology Act, 2000 and the IT (Intermediary
              Guidelines and Digital Media Ethics Code) Rules, 2021, we have appointed a
              Grievance Officer.
            </p>
            <div className="rounded-xl bg-slate-50 border border-slate-100 p-5 mt-4 space-y-2">
              <p className="font-semibold text-slate-700">Grievance Officer — Commerce Virtuals</p>
              <p className="text-slate-600">
                Email:{' '}
                <a href="mailto:grievance@commercevirtuals.in" className="text-[#3A6BFC] font-semibold hover:underline">
                  grievance@commercevirtuals.in
                </a>
              </p>
              <p className="text-slate-600">Address: Mumbai, Maharashtra, India</p>
              <p className="text-sm text-slate-500">Response within 30 days of receiving a complaint</p>
            </div>
          </Section>

          <Section title="13. Contact Us">
            <p>
              If you have any questions, concerns, or requests regarding this Privacy Policy
              or our data practices, please contact us.
            </p>
            <div className="overflow-x-auto mt-4">
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="bg-[#3A6BFC] text-white">
                    <th className="px-4 py-3 font-semibold rounded-tl-lg">Channel</th>
                    <th className="px-4 py-3 font-semibold rounded-tr-lg">Details</th>
                  </tr>
                </thead>
                <tbody className="text-slate-600">
                  <tr className="border-b border-slate-100">
                    <td className="px-4 py-3 font-medium">Email</td>
                    <td className="px-4 py-3">
                      <a href="mailto:privacy@commercevirtuals.in" className="text-[#3A6BFC] hover:underline">
                        privacy@commercevirtuals.in
                      </a>
                    </td>
                  </tr>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <td className="px-4 py-3 font-medium">Website</td>
                    <td className="px-4 py-3">
                      <a href="https://www.commercevirtuals.in" className="text-[#3A6BFC] hover:underline">
                        www.commercevirtuals.in
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium">Location</td>
                    <td className="px-4 py-3">Mumbai, Maharashtra, India</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <NoteBox>
              We are committed to working with you to resolve any privacy concerns fairly
              and transparently.
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
