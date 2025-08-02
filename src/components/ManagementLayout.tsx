import { ReactNode } from 'react';

interface ManagementLayoutProps {
  children: ReactNode;
}

const ManagementLayout = ({ children }: ManagementLayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
};

export default ManagementLayout;
