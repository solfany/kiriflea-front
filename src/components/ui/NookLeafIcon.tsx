import React from 'react';

interface NookLeafIconProps {
  className?: string;
  size?: number;
  color?: string;
  cutoutColor?: string;
}

export function NookLeafIcon({
  className = '',
  size = 24,
  color = '#46834B',
  cutoutColor = 'currentColor',
}: NookLeafIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <mask id="nook-leaf-bite-mask">
        <rect width="100" height="100" fill="white" />
        {/* Circle bite cutout at bottom right */}
        <circle cx="70" cy="76" r="16" fill="black" />
      </mask>
      <g mask="url(#nook-leaf-bite-mask)">
        {/* Leaf Stem */}
        <path
          d="M 72 26 L 90 6 C 93 3 98 8 95 12 L 78 30 Z"
          fill={color}
        />
        {/* Leaf Main Shape */}
        <path
          d="M 76 28 C 50 2 18 10 5 38 C -7 65 12 95 50 97 C 78 98 98 75 97 48 C 96 36 88 28 76 28 Z"
          fill={color}
        />
      </g>
    </svg>
  );
}
