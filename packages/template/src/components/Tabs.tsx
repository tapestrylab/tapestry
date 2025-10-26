/**
 * Tabs component for tabbed content
 */

import React, { useState } from 'react';

export interface TabItem {
  label: string;
  content: React.ReactNode;
}

export interface TabsProps {
  tabs: TabItem[];
  defaultTab?: number;
  className?: string;
  styles?: {
    container?: string;
    tabList?: string;
    tab?: string;
    activeTab?: string;
    panel?: string;
  };
}

export function Tabs({
  tabs,
  defaultTab = 0,
  className,
  styles,
}: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  if (!tabs || tabs.length === 0) {
    return null;
  }

  return (
    <div className={className || styles?.container}>
      <div className={styles?.tabList} role="tablist">
        {tabs.map((tab, index) => (
          <button
            key={index}
            role="tab"
            aria-selected={activeTab === index}
            className={
              activeTab === index ? styles?.activeTab : styles?.tab
            }
            onClick={() => setActiveTab(index)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className={styles?.panel} role="tabpanel">
        {tabs[activeTab]?.content}
      </div>
    </div>
  );
}
