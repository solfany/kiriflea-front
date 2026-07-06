import { useEffect, type RefObject } from 'react';

export function useIntersectionObserver(
  ref: RefObject<Element | null>,
  callback: () => void,
  options?: IntersectionObserverInit,
) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) callback();
    }, { threshold: 0.1, ...options });
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, callback, options]);
}
