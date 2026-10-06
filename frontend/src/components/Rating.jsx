import React, { useState } from 'react';
import { Star } from 'lucide-react';

export const Rating = ({
  value = 0,
  max = 5,
  interactive = false,
  onChange,
  size = 18,
}) => {
  const [hoverVal, setHoverVal] = useState(0);

  const displayVal = hoverVal > 0 ? hoverVal : (value || 0);

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '3px',
      }}
      onMouseLeave={() => interactive && setHoverVal(0)}
    >
      {Array.from({ length: max }).map((_, idx) => {
        const starNumber = idx + 1;
        const isFilled = starNumber <= displayVal;
        const isHalf = !isFilled && starNumber - 0.5 <= displayVal;

        return (
          <span
            key={idx}
            style={{
              cursor: interactive ? 'pointer' : 'default',
              display: 'inline-flex',
              color: isFilled
                ? 'var(--yellow-butter)'
                : isHalf
                ? 'var(--yellow-butter)'
                : 'var(--border-marine)',
              transition: 'transform 0.1s ease, color 0.1s ease',
            }}
            onMouseEnter={() => interactive && setHoverVal(starNumber)}
            onClick={() => interactive && onChange && onChange(starNumber)}
          >
            <Star
              size={size}
              fill={isFilled || isHalf ? 'currentColor' : 'none'}
              strokeWidth={1.75}
            />
          </span>
        );
      })}
      {value > 0 && !interactive && (
        <span
          style={{
            marginLeft: '6px',
            fontSize: '0.85rem',
            fontWeight: 700,
            color: 'var(--yellow-butter)',
          }}
        >
          {Number(value).toFixed(1)}
        </span>
      )}
    </div>
  );
};
