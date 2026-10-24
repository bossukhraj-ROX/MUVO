import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import './Accordion.css';

interface AccordionProps {
  items: { question: string; answer: ReactNode }[];
}

export default function Accordion({ items }: AccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="accordion">
      {items.map((item, i) => (
        <AccordionItem
          key={i}
          question={item.question}
          answer={item.answer}
          isOpen={openIndex === i}
          onToggle={() => setOpenIndex(openIndex === i ? null : i)}
        />
      ))}
    </div>
  );
}

function AccordionItem({
  question,
  answer,
  isOpen,
  onToggle,
}: {
  question: string;
  answer: ReactNode;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (contentRef.current) {
      setHeight(isOpen ? contentRef.current.scrollHeight : 0);
    }
  }, [isOpen]);

  return (
    <div className={`accordion-item ${isOpen ? 'is-open' : ''}`}>
      <button
        className="accordion-trigger focus-ring"
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <span className="accordion-question">{question}</span>
        <ChevronDown size={20} className="accordion-chevron" />
      </button>
      <div className="accordion-content" style={{ maxHeight: `${height}px` }}>
        <div ref={contentRef} className="accordion-content-inner">
          {answer}
        </div>
      </div>
    </div>
  );
}
