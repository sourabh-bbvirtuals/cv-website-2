import { useBoardSelection } from '~/context/BoardSelectionContext';

const BOARD_HERO: Record<string, { title: string; subtitle: string }> = {
  cbse: {
    title: 'CBSE Commerce Courses',
    subtitle:
      'Complete CBSE coverage for Accountancy, Business Studies, and Economics — taught with the depth your board exams demand and the test series that builds real exam confidence.',
  },
  mh: {
    title: 'Maharashtra Board (HSC) Commerce Courses',
    subtitle:
      'Covering BK & Accountancy, OCM, Economics, and Secretarial Practice with chapter tests, full mock papers, and Maharashtra-specific exam strategies.',
  },
  cuet: {
    title: 'CUET-UG Commerce Preparation',
    subtitle:
      'Our CUET programme covers all domain subjects (Accountancy, BST, Economics, Entrepreneurship) plus English and General Test — with full-length mocks and mentorship.',
  },
};

const Hero = ({
  title: titleProp,
  subtitle: subtitleProp,
}: {
  title?: string;
  subtitle?: string;
}) => {
  const { selectedSlug, boardOptions } = useBoardSelection();

  let title = titleProp || 'Commerce Courses for Class 11 & 12';
  let subtitle =
    subtitleProp ||
    "Join India's only commerce-exclusive platform covering CBSE, Maharashtra HSC and CUET-UG. Structured courses, organised test series & live mentorship for Class 11 & 12 students.";

  if (!titleProp && selectedSlug) {
    const selected = boardOptions.find((o) => o.slug === selectedSlug);
    if (selected) {
      const boardKey = selected.board.toLowerCase().replace(/\s+/g, '');
      const classLabel = selected.class;
      const match =
        BOARD_HERO[boardKey] ||
        Object.entries(BOARD_HERO).find(([k]) => boardKey.includes(k))?.[1];
      if (match) {
        title = `${match.title} — ${classLabel}`;
        subtitle = match.subtitle;
      } else {
        title = `Commerce Courses for ${selected.board} ${classLabel}`;
      }
    }
  }

  return (
    <section className="h-[295px] pb-6 md:pb-10 4xl:pb-15! flex items-end bg-[#FFF8F9] border-b border-[#0816271A]">
      <div className="custom-container">
        <h1 className="section-heading mb-3 sm:mb-4">{title}</h1>
        <p className="text-lightgray font-normal text-base lg:text-xl leading-[150%]">
          {subtitle}
        </p>
      </div>
    </section>
  );
};

export default Hero;
