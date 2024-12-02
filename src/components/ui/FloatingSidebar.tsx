import React from 'react';
import { cn } from '@/lib/utils';

export default function FloatingSidebar({
  isOpen,
  onClose,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        'fixed inset-y-0 right-0 w-96 bg-white shadow-lg transform transition-transform duration-300',
        isOpen ? 'translate-x-0' : 'translate-x-full'
      )}
    >
      <div className="p-4">
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-800 focus:outline-none"
        >
          Close
        </button>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}
