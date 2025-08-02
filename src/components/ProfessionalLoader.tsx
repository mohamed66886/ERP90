import React from 'react';

interface ProfessionalLoaderProps {
  message?: string;
  variant?: string;
  size?: 'sm' | 'md' | 'lg';
}

const ProfessionalLoader: React.FC<ProfessionalLoaderProps> = ({ message = 'Loading...', variant = 'purple', size = 'md' }) => (
  <div style={{ textAlign: 'center', padding: 24 }}>
    <div style={{ fontSize: size === 'sm' ? 24 : size === 'lg' ? 48 : 36, color: variant }}>{message}</div>
  </div>
);

export default ProfessionalLoader;
