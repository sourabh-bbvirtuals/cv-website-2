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
    question: 'What courses does Commerce Virtuals offer?',
    answer:
      'Commerce Virtuals provides comprehensive coaching for Class 11 and Class 12 Commerce students across CBSE, Maharashtra HSC, and CUET boards. We cover subjects like Accountancy, Economics, Business Studies, and more through structured batches.',
  },
  {
    question: 'What modes of learning are available at Commerce Virtuals?',
    answer:
      'Students can choose from multiple learning formats: Live Classes with real-time interactive sessions, recorded video lectures accessible online, and downloadable study materials for offline access.',
  },
  {
    question: 'Who are the faculty members at Commerce Virtuals?',
    answer:
      'Commerce Virtuals has a team of experienced educators specializing in Commerce subjects for Class 11 & 12, with expertise across CBSE, Maharashtra HSC, and CUET preparation.',
  },
  {
    question:
      'Does Commerce Virtuals offer test series and practice resources?',
    answer:
      'Yes, Commerce Virtuals provides mock tests, MCQ quizzes, previous year question papers, and study notes to support students in their exam preparation.',
  },
  {
    question: 'Are there any upcoming batches?',
    answer:
      'Yes, new batches are launched regularly. Check our courses page for the latest batch schedules and enrollment details.',
  },
  {
    question: 'How can I contact Commerce Virtuals for more information?',
    answer:
      'For further inquiries, you can visit our website or reach out to us via the support page or WhatsApp.',
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
