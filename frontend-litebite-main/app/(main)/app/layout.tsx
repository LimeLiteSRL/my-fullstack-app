"use client";

import { useFullWidth } from "@/libs/hooks/use-full-width";

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Use the custom hook to manage full width
  useFullWidth(true);

  return (
    <>
      <style jsx global>{`
        html::-webkit-scrollbar {
          width: 12px;
        }
        html::-webkit-scrollbar-track {
          background: #f1f5f9;
        }
        html::-webkit-scrollbar-thumb {
          background: #2563eb;
          border-radius: 6px;
        }
        html::-webkit-scrollbar-thumb:hover {
          background: #1d4ed8;
        }
        
        body::-webkit-scrollbar {
          width: 12px;
        }
        body::-webkit-scrollbar-track {
          background: #f1f5f9;
        }
        body::-webkit-scrollbar-thumb {
          background: #2563eb;
          border-radius: 6px;
        }
        body::-webkit-scrollbar-thumb:hover {
          background: #1d4ed8;
        }
        
        html {
          scrollbar-width: thin;
          scrollbar-color: #2563eb #f1f5f9;
        }
        
        body {
          scrollbar-width: thin;
          scrollbar-color: #2563eb #f1f5f9;
        }
      `}</style>
      <div className="w-full h-full min-h-screen bg-gray-50 overflow-x-hidden">
        {children}
      </div>
    </>
  );
}
