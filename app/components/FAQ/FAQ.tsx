'use client';

import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import SectionTitle from '../testimonials/section-title';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../ui/accordion';

interface FAQProps {
  items: Array<{
    question: string;
    answer: string;
  }>;
}

// Fake FAQ data with new questions
const fakeFAQItems = [
  {
    question: 'What courses does Shubham Agrawal Classes offer?',
    answer:
      'Shubham Agrawal Classes provides coaching for various professional courses, including: Chartered Accountancy (CA): Covering CA Foundation, CA Intermediate (Group 1 and Group 2), and CA Final (Group 1 and Group 2). Cost and Management Accountancy (CMA): Offering CMA Intermediate and CMA Final courses. Company Secretary (CS): Providing CS Executive and CS Professional coaching.',
  },
  {
    question: 'What modes of learning are available at Shubham Agrawal Classes?',
    answer:
      'Students can choose from multiple learning formats: Live Classes: Real-time interactive sessions with faculty. Online Download (OD) Classes: Pre-recorded lectures accessible online. Pen Drive (PD) Classes: Pre-recorded lectures provided on pen drives for offline acces',
  },
  {
    question: 'Who are the faculty members at Shubham Agrawal Classes?',
    answer:
      "Shubham Agrawal Classes is led by CA Shubham Agrawal, along with a team of experienced educators specializing in various subjects of CA, CMA, and CS.",
  },
  {
    question: 'Does Shubham Agrawal Classes offer mentorship and test series?',
    answer:
      'Yes, Shubham Agrawal Classes provides mentorship programs and test series to support students preparation and assess their progress.',
  },
  {
    question: 'Are there any upcoming batches for CA Intermediate courses?',
    answer:
      'Yes, new CA Intermediate Regular In-Depth Batches for September 2025 and January 2026 will be starting soon. Students can register for Live, OD, or PD batches.',
  },
  {
    question: 'How can I contact Shubham Agrawal Classes for more information?',
    answer:
      "For further inquiries, you can visit the official website of Shubham Agrawal Classes or contact the institute directly.",
  },
];

// Custom Accordion Component styled to match the image
export const FAQ = ({ faqs }: { faqs: any[] }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="w-full flex justify-center my-20 px-14">
      <div className="flex flex-col max-w-[610px] w-full gap-2.5 sm:gap-5">
        <SectionTitle title="FAQ" />
        <Accordion type="single" collapsible className="w-full space-y-4">
          {faqs.map((item, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger
                onClick={() => toggleAccordion(index)}
                className={`flex justify-between items-center w-full ${
                  openIndex === index ? 'text-indigo-500' : ''
                }`}
              >
                {item.question}
              </AccordionTrigger>
              <AccordionContent>{item.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
};
