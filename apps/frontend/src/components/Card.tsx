import React from 'react';

type Props = {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
};

export default function Card({ children, onClick, className = '', style }: Props) {
  if (onClick) {
    return (
      <button
        className={'card ' + className}
        style={{ width: '100%', textAlign: 'left', ...style }}
        onClick={onClick}
      >
        {children}
      </button>
    );
  }
  return (
    <div className={'card ' + className} style={style}>
      {children}
    </div>
  );
}
