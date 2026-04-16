import type { MetaFunction } from '@remix-run/react';
import { Link } from '@remix-run/react';
import Layout from '~/components/Layout';

export const meta: MetaFunction = () => {
  return [
    { title: 'About Us - Commerce Virtuals' },
    {
      name: 'description',
      content:
        "About Commerce Virtuals - India's commerce-exclusive education platform for Class 11 & 12 commerce students. CBSE, Maharashtra Board, and CUET preparation.",
    },
    {
      name: 'keywords',
      content:
        'commerce coaching online, Maharashtra board HSC, CBSE commerce, CUET preparation, commerce education India',
    },
  ];
};

export default function AboutUsRoute() {
  return (
    <Layout>
      <div className="bg-white min-h-screen">
        {/* Hero */}
        <div className="bg-[#EEF2FF] pt-32 md:pt-44 lg:pt-48 pb-16 sm:pb-20 lg:pb-24">
          <div className="custom-container text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#081627]">
              About Commerce Virtuals
            </h1>
            <p className="mt-4 text-lg sm:text-xl text-[#081627]/60 max-w-xl mx-auto">
              India&apos;s Commerce-Exclusive Education Platform | CBSE |
              Maharashtra Board | CUET Preparation
            </p>
          </div>
        </div>

        <div className="custom-container py-12 lg:py-16 space-y-10">
          {/* Vision */}
          <Section title="The Vision of CA Bhanwar Borana">
            <p>
              <strong>
                Commerce Virtuals is a product of the vision of CA Bhanwar
                Borana
              </strong>
              , who founded this platform to transform commerce education in
              India.
            </p>

            <h3 className="text-lg font-semibold text-slate-700 mt-6 mb-3">
              Bhanwar Sir&apos;s Story
            </h3>
            <p>
              Reflecting on his own school days in Rajasthan, Bhanwar sir
              witnessed firsthand the frustration of a system that prioritized{' '}
              <strong>rote memorization over actual understanding</strong>. This
              experience shaped his mission: to replace the
              &apos;ratta-maar&apos; (memorization) culture with{' '}
              <strong>concept-first learning</strong>.
            </p>

            <blockquote className="italic text-[#3A6BFC] text-lg text-center my-8 px-6 py-5 bg-blue-50 rounded-xl border-l-4 border-[#3A6BFC]">
              &ldquo;Our goal is to build the next generation of financial
              leaders by ensuring students truly understand the language of
              business—rather than just memorizing formulas.&rdquo;
            </blockquote>

            <h3 className="text-lg font-semibold text-slate-700 mt-6 mb-3">
              Our Mission
            </h3>
            <p>
              To provide high-quality, <strong>concept-based education</strong>{' '}
              for commerce students that goes beyond textbooks and local
              tuitions. We believe that premium, expert-led commerce education
              should be accessible to every student—not just those who can
              afford expensive private coaching.
            </p>

            <h3 className="text-lg font-semibold text-slate-700 mt-6 mb-3">
              Problems We Solve
            </h3>
            <ul className="list-disc pl-6 space-y-2 text-slate-600">
              <li>
                <strong>Eliminating Travel:</strong> Students often spend 6-7
                hours in schools/colleges commuting. Commerce Virtuals brings
                expert coaching directly to home.
              </li>
              <li>
                <strong>Consistent Support:</strong> Local tuitions struggle
                with mismatched syllabus timelines. Our platform provides full
                access to recorded content so students study at their own pace.
              </li>
              <li>
                <strong>Expert Faculty:</strong> Our mentors are carefully
                selected based on teaching quality and presentation skills—not
                just credentials.
              </li>
              <li>
                <strong>Affordability:</strong> Premium, high-quality content at
                a fraction of traditional private tuition costs.
              </li>
              <li>
                <strong>Concept-Based Learning:</strong> Moving away from
                memorization to true understanding of commerce concepts.
              </li>
            </ul>

            <p className="mt-5">
              <strong>Our Solution:</strong> A complete platform combining
              concept-focused video lessons, organized test series, performance
              tracking, and mentorship—all designed specifically for commerce
              students to truly master the language of business.
            </p>
          </Section>

          {/* Why Choose */}
          <Section title="Why Choose Commerce Virtuals">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-4">
              {[
                {
                  title: '100% Commerce-Focused',
                  desc: "We don't teach every subject. We specialize exclusively in commerce education.",
                },
                {
                  title: 'Maharashtra Board Expert',
                  desc: 'Comprehensive coverage of Book-Keeping, OCM, Economics, and Secretarial Practice with board exam alignment.',
                },
                {
                  title: 'Organized Test Series',
                  desc: 'Structured assessment with chapter-wise quizzes, mock exams, and performance analytics—not random practice.',
                },
                {
                  title: 'Mentorship (Coming Soon)',
                  desc: 'Personalized guidance beyond videos. Real support for exam prep and career planning.',
                },
                {
                  title: 'CUET Specialization',
                  desc: 'Domain-specific subjects (Accountancy, BST, Economics, Entrepreneurship) + Language + General Test.',
                },
                {
                  title: 'Student-Centric Design',
                  desc: 'Built by educators, for students. Every feature designed around what commerce students actually need.',
                },
              ].map((card) => (
                <div
                  key={card.title}
                  className="rounded-xl bg-gradient-to-br from-blue-50/60 to-indigo-50/60 border-l-4 border-[#3A6BFC] p-5 hover:shadow-md hover:-translate-y-1 transition-all duration-300"
                >
                  <h4 className="font-bold text-[#3A6BFC] mb-2">
                    {card.title}
                  </h4>
                  <p className="text-sm text-slate-600">{card.desc}</p>
                </div>
              ))}
            </div>
          </Section>

          {/* What We Cover */}
          <Section title="What We Cover">
            <h3 className="text-lg font-semibold text-slate-700 mt-4 mb-3">
              CBSE Commerce (Class 11 & 12)
            </h3>
            <ul className="list-disc pl-6 space-y-2 text-slate-600">
              <li>
                <strong>Accountancy:</strong> From theoretical frameworks to
                company accounting and cash flow statements
              </li>
              <li>
                <strong>Business Studies:</strong> Management principles,
                financial management, and marketing
              </li>
              <li>
                <strong>Economics:</strong> Micro and macroeconomics, Indian
                economic development
              </li>
              <li>
                <strong>Applied Mathematics:</strong> Commerce-focused calculus
                and algebra
              </li>
              <li>
                <strong>Informatics Practices / CS:</strong> Database and
                programming concepts
              </li>
            </ul>

            <h3 className="text-lg font-semibold text-slate-700 mt-6 mb-3">
              Maharashtra Board HSC (Class 11 & 12)
            </h3>
            <ul className="list-disc pl-6 space-y-2 text-slate-600">
              <li>
                <strong>Book-Keeping & Accountancy:</strong> Partnership,
                company, and not-for-profit accounting
              </li>
              <li>
                <strong>Organization of Commerce & Management:</strong> Business
                environment, entrepreneurship, consumer protection
              </li>
              <li>
                <strong>Economics:</strong> Utility analysis, market structures,
                national income, public finance
              </li>
              <li>
                <strong>Secretarial Practice:</strong> Corporate finance,
                share/debenture issues, financial markets
              </li>
            </ul>

            <h3 className="text-lg font-semibold text-slate-700 mt-6 mb-3">
              CUET-UG Commerce Preparation
            </h3>
            <ul className="list-disc pl-6 space-y-2 text-slate-600">
              <li>
                <strong>Domain Subjects:</strong> Accountancy, Business Studies,
                Economics, Entrepreneurship
              </li>
              <li>
                <strong>Section IA:</strong> English Reading, Vocabulary,
                Grammar
              </li>
              <li>
                <strong>Section III:</strong> General Test (GK, Mental Ability,
                Reasoning)
              </li>
            </ul>
          </Section>

          {/* Core Values */}
          <Section title="Our Core Values">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-4">
              {[
                {
                  title: 'Excellence',
                  desc: 'Rigorous curriculum design and high-quality content from experienced educators. No shortcuts.',
                },
                {
                  title: 'Specialization',
                  desc: "We focus on commerce exclusively, ensuring deep expertise that generalist platforms can't match.",
                },
                {
                  title: 'Student-First',
                  desc: "Every feature built around student needs, not what's profitable.",
                },
                {
                  title: 'Empowerment',
                  desc: 'Through analytics, mentorship, and personalized guidance, we help students take control of their learning.',
                },
                {
                  title: 'Accessibility',
                  desc: "Quality education shouldn't be a luxury. We're committed to making premium coaching affordable.",
                },
                {
                  title: 'Integration',
                  desc: 'Videos + Tests + Analytics + Mentorship = Complete ecosystem solving the fragmentation problem.',
                },
              ].map((card) => (
                <div
                  key={card.title}
                  className="rounded-xl bg-gradient-to-br from-blue-50/60 to-indigo-50/60 border-l-4 border-[#3A6BFC] p-5 hover:shadow-md hover:-translate-y-1 transition-all duration-300"
                >
                  <h4 className="font-bold text-[#3A6BFC] mb-2">
                    {card.title}
                  </h4>
                  <p className="text-sm text-slate-600">{card.desc}</p>
                </div>
              ))}
            </div>
          </Section>

          {/* Community */}
          <Section title="Our Community">
            <p>
              We&apos;re a newly launched platform building a community of
              ambitious commerce students from across India—CBSE, Maharashtra
              Board, and CUET aspirants all united by the goal of academic
              excellence.
            </p>
            <div className="rounded-lg bg-emerald-50 border-l-4 border-emerald-500 p-4 mt-4">
              <strong className="text-emerald-800">Just Launched:</strong>{' '}
              <span className="text-emerald-700">
                We&apos;re excited to be on this journey with our growing
                community of commerce students. Join us as we grow and scale our
                impact in commerce education.
              </span>
            </div>
          </Section>

          {/* Why Trust */}
          <Section title="Why Trust Commerce Virtuals?">
            <div className="space-y-3 mt-2">
              {[
                {
                  label: 'Specialized Faculty',
                  text: 'Our teachers are experienced commerce educators, not generalists. They understand the nuances of accountancy, business studies, and economics.',
                },
                {
                  label: 'Curriculum Alignment',
                  text: 'Our content is mapped to official CBSE and Maharashtra Board syllabi, ensuring 100% relevance for board exams.',
                },
                {
                  label: 'Organized Assessment',
                  text: 'We provide structured test series with detailed solutions and performance analytics—not random practice.',
                },
                {
                  label: 'Mentorship (Coming Soon)',
                  text: "We're developing comprehensive mentorship services for personalized guidance beyond videos.",
                },
                {
                  label: 'Transparent Policies',
                  text: 'Clear refund guarantee, transparent pricing, and honest about what we offer.',
                },
                {
                  label: 'Student-Centric Approach',
                  text: 'Built by educators who understand the challenges commerce students face.',
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-lg bg-emerald-50 border-l-4 border-emerald-500 p-4"
                >
                  <strong className="text-emerald-800">
                    &#10003; {item.label}:
                  </strong>{' '}
                  <span className="text-emerald-700">{item.text}</span>
                </div>
              ))}
            </div>
          </Section>

          {/* CTA */}
          <div className="rounded-2xl bg-gradient-to-br from-[#3A6BFC] to-[#6366f1] text-white p-8 sm:p-12 text-center">
            <h3 className="text-2xl sm:text-3xl font-bold mb-3">
              Ready to Transform Your Commerce Education?
            </h3>
            <p className="text-white/80 mb-6 max-w-lg mx-auto">
              Join our growing community of commerce students excelling with
              Commerce Virtuals.
            </p>
            <Link
              to="/contact-us"
              className="inline-block bg-white text-[#3A6BFC] px-8 py-3 rounded-full font-semibold hover:shadow-lg hover:scale-105 transition-all"
            >
              Get in Touch
            </Link>
          </div>

          {/* Footer */}
          <div className="text-center py-6 text-slate-500 text-sm space-y-2">
            <p className="font-semibold text-slate-700">
              Questions about Commerce Virtuals?
            </p>
            <p>
              <a
                href="tel:+916291040600"
                className="text-[#3A6BFC] font-semibold hover:underline"
              >
                +91 62910 40 600 (Admissions & Sales)
              </a>{' '}
              |{' '}
              <a
                href="mailto:support@commercevirtuals.com"
                className="text-[#3A6BFC] font-semibold hover:underline"
              >
                support@commercevirtuals.com
              </a>
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
      <h2 className="text-xl sm:text-2xl font-bold text-[#081627] mb-5 pb-4 border-b-2 border-[#3A6BFC]">
        {title}
      </h2>
      <div className="text-slate-600 leading-relaxed space-y-4">{children}</div>
    </section>
  );
}
