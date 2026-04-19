"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SectionCard } from "@/components/ui/SectionCard";

interface CartItem {
  id: string;
  productId: string;
  productTitle: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

interface CartResponse {
  cart: {
    id: string;
    status: string;
    items: CartItem[];
    subtotal: number;
  };
}

const FREE_SHIPPING_THRESHOLD = 150;

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartResponse["cart"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>("");
  const [notes, setNotes] = useState("");

  async function fetchCart() {
    try {
      setLoading(true);
      const res = await fetch("/api/cart");
      if (!res.ok) throw new Error("Failed to load cart");
      const data: CartResponse = await res.json();
      setCart(data.cart);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading cart");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCart();
  }, []);

  async function handleCheckout(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: notes || undefined }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Checkout failed");
      }

      const result = await res.json();
      // Redirect to order confirmation or orders list
      router.push(`/orders/${result.order.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error placing order");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <SectionCard title="Checkout" description="Shipping, billing, terms, and order notes.">
        <p className="text-sm text-[#4b5563]">Loading...</p>
      </SectionCard>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <SectionCard title="Checkout" description="Shipping, billing, terms, and order notes.">
        <div className="text-center py-12">
          <p className="text-sm text-[#4b5563] mb-4">Your cart is empty.</p>
          <Link
            href="/products"
            className="inline-block rounded-lg bg-[#1d4b43] px-4 py-2 text-sm font-semibold text-white hover:bg-[#163836]"
          >
            Continue Shopping
          </Link>
        </div>
      </SectionCard>
    );
  }

  const shippingCost = cart.subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 24;
  const tax = Math.round((cart.subtotal + shippingCost) * 0.1 * 100) / 100;
  const total = cart.subtotal + shippingCost + tax;

  return (
    <SectionCard title="Checkout" description="Shipping, billing, terms, and order notes.">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Form */}
        <div className="lg:col-span-2 space-y-6">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Shipping Address Section */}
          <div className="rounded-lg border border-[#e7e4dc] bg-[#fcfbf9] p-4">
            <h3 className="text-sm font-semibold text-[#111827] mb-4">Shipping Information</h3>
            <div className="p-3 rounded bg-[#f5f3f0] text-sm text-[#4b5563]">
              <p>Shipping to your registered business address.</p>
              <p className="text-xs mt-2 text-[#6b7280]">
                Contact support to change your shipping address.
              </p>
            </div>
          </div>

          {/* Order Notes */}
          <form onSubmit={handleCheckout} className="space-y-4">
            <div className="rounded-lg border border-[#e7e4dc] bg-[#fcfbf9] p-4">
              <label htmlFor="notes" className="block text-sm font-semibold text-[#111827] mb-2">
                Order Notes (Optional)
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                maxLength={500}
                rows={4}
                placeholder="Add any special instructions, delivery notes, or comments..."
                className="w-full rounded border border-[#e7e4dc] p-3 text-sm text-[#111827] placeholder-[#9ca3af] focus:border-[#1d4b43] focus:outline-none focus:ring-1 focus:ring-[#1d4b43]"
              />
              <p className="text-xs text-[#4b5563] mt-1">{notes.length}/500 characters</p>
            </div>

            {/* Payment & Terms */}
            <div className="rounded-lg border border-[#e7e4dc] bg-[#fcfbf9] p-4">
              <div className="flex items-start gap-3 mb-4">
                <input
                  type="checkbox"
                  id="terms"
                  required
                  className="mt-1 h-4 w-4 rounded border-[#d1d5db] text-[#1d4b43] focus:ring-[#1d4b43]"
                />
                <label htmlFor="terms" className="text-sm text-[#4b5563]">
                  I agree to the{" "}
                  <a href="#" className="font-semibold text-[#1d4b43] hover:underline">
                    wholesale terms and conditions
                  </a>
                </label>
              </div>
              <p className="text-xs text-[#6b7280]">
                Payment is due upon receipt of invoice. Standard Net 30 terms apply for approved accounts.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Link
                href="/cart"
                className="flex-1 rounded-lg border border-[#e7e4dc] px-4 py-3 text-center text-sm font-semibold text-[#111827] hover:bg-[#f5f3f0]"
              >
                Back to Cart
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 rounded-lg bg-[#1d4b43] px-4 py-3 text-center text-sm font-semibold text-white hover:bg-[#163836] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Placing Order..." : "Place Order"}
              </button>
            </div>
          </form>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="rounded-lg border border-[#e7e4dc] bg-[#fcfbf9] p-4 sticky top-4">
            <h3 className="text-sm font-semibold text-[#111827] mb-4">Order Summary</h3>

            {/* Items */}
            <div className="space-y-2 mb-4 pb-4 border-b border-[#e7e4dc]">
              {cart.items.map((item) => (
                <div key={item.id} className="text-xs text-[#4b5563]">
                  <div className="flex justify-between mb-1">
                    <span className="font-medium">{item.sku}</span>
                    <span>${item.lineTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[#9ca3af]">
                    <span>Qty: {item.quantity}</span>
                    <span>${item.unitPrice.toFixed(2)} ea</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-[#4b5563]">
                <span>Subtotal</span>
                <span>${cart.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[#4b5563]">
                <span>Shipping</span>
                <span>{shippingCost === 0 ? "Free" : `$${shippingCost.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-[#4b5563]">
                <span>Tax (est.)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="border-t border-[#e7e4dc] pt-2 flex justify-between font-semibold text-[#111827]">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment Terms Note */}
            <div className="mt-4 p-3 rounded bg-[#f5f3f0] text-xs text-[#4b5563]">
              <p className="font-medium mb-1">Payment Terms</p>
              <p>Net 30 invoice billing. No prepayment required.</p>
            </div>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
