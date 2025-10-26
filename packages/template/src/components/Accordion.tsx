/**
 * Accordion component for collapsible sections
 */

import React, { useState } from 'react';

export interface AccordionItem {
  title: string;
  content: React.ReactNode;
}

export interface AccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
  className?: string;
  styles?: {
    container?: string;
    item?: string;
    header?: string;
    content?: string;
  };
}

export function Accordion({
  items,
  allowMultiple = false,
  className,
  styles,
}: AccordionProps) {
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());

  const toggleItem = (index: number) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index);
    } else {
      if (!allowMultiple) {
        newOpenItems.clear();
      }
      newOpenItems.add(index);
    }
    setOpenItems(newOpenItems);
  };

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className={className || styles?.container}>
      {items.map((item, index) => {
        const isOpen = openItems.has(index);
        return (
          <div key={index} className={styles?.item}>
            <button
              className={styles?.header}
              onClick={() => toggleItem(index)}
              aria-expanded={isOpen}
            >
              {item.title}
              <span>{isOpen ? '▼' : '▶'}</span>
            </button>
            {isOpen && <div className={styles?.content}>{item.content}</div>}
          </div>
        );
      })}
    </div>
  );
}
