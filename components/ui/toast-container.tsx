"use client";

import { Toaster } from "sonner";

export function ToastContainer() {
  return (
    <Toaster 
      position="top-right"
      toastOptions={{
        style: {
          borderRadius: '0.375rem', // rounded-md
          fontSize: '0.875rem', // text-sm
        },
        className: "font-medium",
      }}
    />
  );
} 