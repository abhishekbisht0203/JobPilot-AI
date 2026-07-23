import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Text, TextStyle } from 'react-native';

interface AnimatedNumberProps {
  value: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  style?: TextStyle | TextStyle[];
  decimals?: number;
}

export function AnimatedNumber({
  value, suffix = '', prefix = '', duration = 1200,
  style, decimals = 0,
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const startRef = useRef(0);
  const startTimeRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  const animate = useCallback(() => {
    const elapsed = Date.now() - startTimeRef.current;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = startRef.current + (value - startRef.current) * eased;
    setDisplayValue(current);

    if (progress < 1) {
      rafRef.current = requestAnimationFrame(animate);
    } else {
      setDisplayValue(value);
    }
  }, [value, duration]);

  useEffect(() => {
    startRef.current = 0;
    startTimeRef.current = Date.now();
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [value, animate]);

  return (
    <Text style={style}>
      {prefix}{displayValue.toFixed(decimals)}{suffix}
    </Text>
  );
}
