"use client";

import { useState } from "react";
import toast from "react-hot-toast";

interface UseMutationOptions<TResult = unknown> {
  onSuccess?: (data: TResult) => void;
  onError?: (error: Error) => void;
}

export function useMutation<TInput = unknown, TResult = unknown>(
  fn: (data: TInput) => Promise<Response>,
  options?: UseMutationOptions<TResult>
) {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = async (
    data: TInput,
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
      options?.onSuccess?.(result.data as TResult);

      return result.data as TResult;
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
