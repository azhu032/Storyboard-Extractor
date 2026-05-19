import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  delay?: number;
  key?: React.Key;
}

export default function Tooltip({ content, children, delay = 300 }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0, showAbove: false });
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const calculatePosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    // Default: Below the trigger
    let top = rect.bottom + window.scrollY + 8;
    let left = rect.left + rect.width / 2;
    let showAbove = false;

    // Check if bottom overflow
    const expectedBottom = top + 40; // Approx tooltip height
    if (expectedBottom > windowHeight + window.scrollY) {
      top = rect.top + window.scrollY - 8;
      showAbove = true;
    }

    setPosition({ top, left, showAbove });
  };

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      calculatePosition();
      setIsVisible(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  useLayoutEffect(() => {
    if (isVisible && tooltipRef.current) {
      const rect = tooltipRef.current.getBoundingClientRect();
      const windowWidth = window.innerWidth;
      
      // Adjust horizontal position to stay inside viewport
      let offset = 0;
      if (rect.right > windowWidth - 10) {
        offset = windowWidth - rect.right - 10;
      } else if (rect.left < 10) {
        offset = 10 - rect.left;
      }

      if (offset !== 0) {
        tooltipRef.current.style.transform = `translateX(calc(-50% + ${offset}px))`;
      }
    }
  }, [isVisible]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div 
      ref={triggerRef}
      className="relative inline-block" 
      onMouseEnter={handleMouseEnter} 
      onMouseLeave={handleMouseLeave}
    >
      {children}
      <AnimatePresence>
        {isVisible && content && (
          <motion.div
            ref={tooltipRef}
            initial={{ opacity: 0, y: position.showAbove ? 5 : -5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: position.showAbove ? 2 : -2, scale: 0.95 }}
            transition={{ duration: 0.1, ease: "easeOut" }}
            style={{
              position: 'fixed',
              top: position.showAbove ? 'auto' : position.top - window.scrollY,
              bottom: position.showAbove ? window.innerHeight - (position.top + 8 - window.scrollY) : 'auto',
              left: position.left,
              transform: 'translateX(-50%)',
            }}
            className="z-[9999] px-3 py-1.5 bg-gray-500/80 dark:bg-gray-800/80 text-white text-[11px] font-medium rounded-lg shadow-xl whitespace-nowrap pointer-events-none border border-white/10 backdrop-blur-md"
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
