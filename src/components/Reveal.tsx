import { type ReactNode } from 'react';
import { useScrollReveal } from '../hooks/useScrollReveal';

interface RevealProps {
  children: ReactNode;
  delay?: 1 | 2 | 3 | 4;
  className?: string;
  as?: 'div' | 'section' | 'li' | 'span';
}

export default function Reveal({ children, delay, className = '', as = 'div' }: RevealProps) {
  const { ref, visible } = useScrollReveal();
  const delayClass = delay ? `reveal-delay-${delay}` : '';
  const Tag = as as 'div';
  return (
    <Tag
      ref={ref as React.RefObject<HTMLDivElement>}
      className={`reveal ${delayClass} ${visible ? 'is-visible' : ''} ${className}`}
    >
      {children}
    </Tag>
  );
}
