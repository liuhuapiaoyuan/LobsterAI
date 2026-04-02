import * as React from 'react';
import { useRef, useState } from 'react';
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from 'framer-motion';

export interface DockNavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  /** Tailwind background classes for the icon tile */
  color: string;
}

/** Horizontal macOS-style magnification (mouse X only). */
function DockIconBar({
  item,
  mouseX,
  active,
  onSelect,
}: {
  item: DockNavItem;
  mouseX: MotionValue<number>;
  active: boolean;
  onSelect: (id: string) => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);

  const distance = useTransform(mouseX, (val) => {
    const el = ref.current;
    if (!el || val === Infinity) return 500;
    const bounds = el.getBoundingClientRect();
    return val - bounds.left - bounds.width / 2;
  });

  const widthSync = useTransform(distance, [-130, 0, 130], [44, 72, 44]);
  const width = useSpring(widthSync, { mass: 0.1, stiffness: 150, damping: 12 });

  const heightSync = useTransform(distance, [-130, 0, 130], [44, 72, 44]);
  const height = useSpring(heightSync, { mass: 0.1, stiffness: 150, damping: 12 });

  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  return (
    <motion.button
      type="button"
      ref={ref}
      style={{ width, height }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseDown={() => setIsClicked(true)}
      onMouseUp={() => setIsClicked(false)}
      onClick={() => onSelect(item.id)}
      aria-label={item.label}
      aria-current={active ? 'page' : undefined}
      className="aspect-square cursor-pointer flex items-center justify-center relative group shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-claude-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent rounded-2xl"
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        className={`w-full h-full rounded-2xl shadow-lg flex items-center justify-center text-white relative overflow-hidden ring-inset ${
          active ? 'ring-2 ring-white/70 ring-offset-2 ring-offset-transparent' : ''
        } ${item.color}`}
        animate={{
          y: isClicked ? 2 : isHovered ? -8 : 0,
        }}
        transition={{
          type: 'spring',
          stiffness: 400,
          damping: 17,
        }}
      >
        <motion.div
          className="[&_svg]:h-[1.15rem] [&_svg]:w-[1.15rem]"
          animate={{
            scale: isHovered ? 1.1 : 1,
          }}
          transition={{
            type: 'spring',
            stiffness: 400,
            damping: 17,
          }}
        >
          {item.icon}
        </motion.div>

        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl pointer-events-none"
          animate={{
            opacity: isHovered ? 0.28 : 0.1,
          }}
          transition={{ duration: 0.2 }}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.8 }}
        animate={{
          opacity: isHovered ? 1 : 0,
          y: isHovered ? -20 : 10,
          scale: isHovered ? 1 : 0.8,
        }}
        transition={{
          type: 'spring',
          stiffness: 500,
          damping: 30,
        }}
        className="absolute -top-11 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md border border-white/10 bg-gray-900/90 px-2 py-1 text-[11px] font-medium text-white shadow-md backdrop-blur-sm pointer-events-none dark:bg-gray-950/95"
      >
        {item.label}
      </motion.div>

   
    </motion.button>
  );
}

/** Radial magnification for compact grid layouts (e.g. narrow sidebars). */
function DockIconGrid({
  item,
  mouseX,
  mouseY,
  active,
  onSelect,
}: {
  item: DockNavItem;
  mouseX: MotionValue<number>;
  mouseY: MotionValue<number>;
  active: boolean;
  onSelect: (id: string) => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);

  const distance = useTransform([mouseX, mouseY], ([mx, my]) => {
    const el = ref.current;
    const x = typeof mx === 'number' ? mx : Infinity;
    const y = typeof my === 'number' ? my : Infinity;
    if (!el || x === Infinity || y === Infinity) return 400;
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    return Math.hypot(x - cx, y - cy);
  });

  const widthSync = useTransform(distance, [0, 120], [52, 36]);
  const width = useSpring(widthSync, { mass: 0.1, stiffness: 150, damping: 14 });

  const heightSync = useTransform(distance, [0, 120], [52, 36]);
  const height = useSpring(heightSync, { mass: 0.1, stiffness: 150, damping: 14 });

  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  return (
    <motion.button
      type="button"
      ref={ref}
      style={{ width, height }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseDown={() => setIsClicked(true)}
      onMouseUp={() => setIsClicked(false)}
      onClick={() => onSelect(item.id)}
      aria-label={item.label}
      aria-current={active ? 'page' : undefined}
      className="aspect-square cursor-pointer flex items-center justify-center relative group outline-none focus-visible:ring-2 focus-visible:ring-claude-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-claude-surface dark:focus-visible:ring-offset-claude-darkSurface rounded-2xl"
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        className={`w-full h-full rounded-2xl shadow-lg flex items-center justify-center text-white relative overflow-hidden ring-inset ${
          active ? 'ring-2 ring-white/70 ring-offset-2 ring-offset-transparent' : ''
        } ${item.color}`}
        animate={{
          y: isClicked ? 2 : isHovered ? -6 : 0,
        }}
        transition={{
          type: 'spring',
          stiffness: 400,
          damping: 17,
        }}
      >
        <motion.div
          className="[&_svg]:h-[1.1rem] [&_svg]:w-[1.1rem]"
          animate={{
            scale: isHovered ? 1.08 : 1,
          }}
          transition={{
            type: 'spring',
            stiffness: 400,
            damping: 17,
          }}
        >
          {item.icon}
        </motion.div>

        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl pointer-events-none"
          animate={{
            opacity: isHovered ? 0.28 : 0.1,
          }}
          transition={{ duration: 0.2 }}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8, scale: 0.85 }}
        animate={{
          opacity: isHovered ? 1 : 0,
          y: isHovered ? -18 : 8,
          scale: isHovered ? 1 : 0.85,
        }}
        transition={{
          type: 'spring',
          stiffness: 500,
          damping: 30,
        }}
        className="absolute -top-10 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md border border-white/10 bg-gray-900/90 px-2 py-1 text-[11px] font-medium text-white shadow-md backdrop-blur-sm pointer-events-none dark:bg-gray-950/95"
      >
        {item.label}
      </motion.div>

      <motion.div
        className="absolute -bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-white/80"
        animate={{
          scale: active || isClicked ? 1.4 : 1,
          opacity: active ? 1 : isClicked ? 1 : 0.45,
        }}
        transition={{
          type: 'spring',
          stiffness: 500,
          damping: 30,
        }}
      />
    </motion.button>
  );
}

export interface DockTabsProps {
  items: DockNavItem[];
  activeId: string;
  onSelect: (id: string) => void;
  className?: string;
  /** `bar` = single horizontal strip (default, e.g. bottom-of-screen dock). `grid` = 3×2 for tight spaces. */
  variant?: 'bar' | 'grid';
}

/**
 * macOS-style dock with magnification.
 */
export function DockTabs({ items, activeId, onSelect, className, variant = 'bar' }: DockTabsProps) {
  const mouseX = useMotionValue(Infinity);
  const mouseY = useMotionValue(Infinity);

  if (variant === 'bar') {
    return (
      <div
        className={className}
        onMouseMove={(e) => mouseX.set(e.clientX)}
        onMouseLeave={() => mouseX.set(Infinity)}
      >
        <motion.div
          className="mx-auto flex h-20 max-w-[min(100vw-1.5rem,52rem)] items-end justify-center gap-2  px-3 pb-3.5 pt-1  sm:gap-3 sm:px-4"
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            type: 'spring',
            stiffness: 260,
            damping: 22,
            delay: 0.05,
          }}
        >
          {items.map((item) => (
            <DockIconBar
              key={item.id}
              item={item}
              mouseX={mouseX}
              active={activeId === item.id}
              onSelect={onSelect}
            />
          ))}
        </motion.div>
      </div>
    );
  }

  return (
    <div
      className={className}
      onMouseMove={(e) => {
        mouseX.set(e.clientX);
        mouseY.set(e.clientY);
      }}
      onMouseLeave={() => {
        mouseX.set(Infinity);
        mouseY.set(Infinity);
      }}
    >
      <motion.div
        className="grid grid-cols-3 gap-2 rounded-2xl border-2 border-white/25 bg-gray-100/50 px-2 py-2.5 shadow-xl backdrop-blur-md dark:border-white/10 dark:bg-gray-900/40"
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{
          type: 'spring',
          stiffness: 260,
          damping: 22,
          delay: 0.05,
        }}
      >
        {items.map((item) => (
          <DockIconGrid
            key={item.id}
            item={item}
            mouseX={mouseX}
            mouseY={mouseY}
            active={activeId === item.id}
            onSelect={onSelect}
          />
        ))}
      </motion.div>
    </div>
  );
}
