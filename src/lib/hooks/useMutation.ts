"use client";

import { useState } from "react";
import toast from "react-hot-toast";

interface UseMutationOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

export function useMutation(
  fn: (data: any) => Promise<Response>,
  options?: UseMutationOptions
) {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = async (
    data: any,
    successMessage?: string,
    errorMessage?: string
  ) => {
    setIsPending(true);
    setError(null);

    const toastId = toast.loading("Processing...");

    try {
      const response = await fn(data);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "An error occurred");
      }

      const result = await response.json();

      toast.success(successMessage || "Success!", { id: toastId });
      options?.onSuccess?.(result.data);

      return result.data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Unknown error");
      setError(error);
      toast.error(errorMessage || error.message, { id: toastId });
      options?.onError?.(error);
      throw error;
    } finally {
      setIsPending(false);
    }
  };

  return { mutate, isPending, error };
}
