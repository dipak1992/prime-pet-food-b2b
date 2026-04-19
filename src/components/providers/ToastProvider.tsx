"use client";

import { Toaster } from "react-hot-toast";

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      toastOptions={{
        duration: 4000,
        style: {
          background: "#fff",
          color: "#111827",
          borderRadius: "0.5rem",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
          padding: "1rem",
          fontSize: "0.875rem",
          fontWeight: "500",
        },
        success: {
          style: {
            background: "#f0fdf4",
            color: "#166534",
            border: "1px solid #dcfce7",
          },
          iconTheme: {
            primary: "#22c55e",
            secondary: "#fff",
          },
        },
        error: {
          style: {
            background: "#fef2f2",
            color: "#991b1b",
            border: "1px solid #fee2e2",
          },
          iconTheme: {
            primary: "#ef4444",
            secondary: "#fff",
          },
        },
      }}
    />
  );
}
