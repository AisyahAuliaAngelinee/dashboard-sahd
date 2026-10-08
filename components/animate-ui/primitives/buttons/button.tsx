'use client';

import * as React from 'react';
import { motion, useReducedMotion, type HTMLMotionProps } from 'motion/react';

import { Slot, type WithAsChild } from '@/components/animate-ui/primitives/animate/slot';

type ButtonProps = WithAsChild<
  HTMLMotionProps<'button'> & {
    hoverScale?: number;
    tapScale?: number;
  }
>;

function Button({
  hoverScale = 1.05,
  tapScale = 0.95,
  asChild = false,
  ...props
}: ButtonProps) {
  const reducedMotion = useReducedMotion();
  const Component = asChild ? Slot : motion.button;

  return (
    <Component
      whileTap={reducedMotion || props.disabled ? undefined : { scale: tapScale }}
      whileHover={reducedMotion || props.disabled ? undefined : { scale: hoverScale }}
      {...props}
    />
  );
}

export { Button, type ButtonProps };
