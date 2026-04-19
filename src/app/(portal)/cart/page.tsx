"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SectionCard } from "@/components/ui/SectionCard";

interface CartItem {
  id: string;
  productId: string;
  productTitle: string;
  sku: string;
  quantity: number;
  moq: number;
  casePack: number;
  unitPrice: number;
  lineTotal: number;
}

interface CartResponse {
  cart: {
    id: string;
    status: string;
    notes: string | null;
    items: CartItem[];
    subtotal: number;
    shippingTotal: number;
    taxTotal: number;
    grandTotal: number;
    freeShippingThreshold: number;
  };
}

export default function CartPage() {
  const [cart, setCart] = useState<CartResponse["cart"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [updating, setUpdating] = useState(false);

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

  async function updateQuantity(productId: string, newQuantity: number) {
    if (newQuantity < 0) return;
    setUpdating(true);
    try {
      if (newQuantity === 0) {
        await fetch("/api/cart/items", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId }),
        });
      } else {
        const res = await fetch("/api/cart/items", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId, quantity: newQuantity }),
        });
        if (!res.ok) {
          const errData = await res.json();
          setError(errData.error || "Failed to update cart");
          setUpdating(false);
          return;
        }
      }
      await fetchCart();
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error updating cart");
    } finally {
      setUpdating(false);
    }
  }

  if (loading) {
    return (
      <SectionCard title="Cart" description="Case-pack-aware cart and quantity validation.">
        <p className="text-sm text-[#4b5563]">Loading...</p>
      </SectionCard>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <SectionCard title="Cart" description="Case-pack-aware cart and quantity validation.">
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

  const shippingProgress = (cart.subtotal / cart.freeShippingThreshold) * 100;

  return (
    <SectionCard title="Cart" description="Case-pack-aware cart and quantity validation.">
      <div className="space-y-6">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Free Shipping Progress Bar */}
        <div className="rounded-lg border border-[#e7e4dc] bg-[#fcfbf9] p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-[#111827]">Free Shipping Progress</span>
            <span className="text-sm text-[#4b5563]">
              ${cart.subtotal.toFixed(2)} of ${cart.freeShippingThreshold.toFixed(2)}
            </span>
          </div>
          <div className="w-full bg-[#e7e4dc] rounded-full h-2">
            <div
              className="bg-[#1d4b43] h-2 rounded-full transition-all"
              style={{ width: `${Math.min(shippingProgress, 100)}%` }}
            />
          </div>
          {cart.shippingTotal > 0 && (
            <p className="text-xs text-[#4b5563] mt-2">
              Spend ${(cart.freeShippingThreshold - cart.subtotal).toFixed(2)} more for free shipping!
            </p>
          )}
        </div>

        {/* Cart Items */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-[#111827]">Items ({cart.items.length})</h3>
          {cart.items.map((item) => (
            <div
              key={item.id}
              className="rounded-lg border border-[#e7e4dc] bg-[#fcfbf9] p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-medium text-[#111827]">{item.productTitle}</h4>
                  <p className="text-xs text-[#4b5563] mt-1">SKU: {item.sku}</p>
                  <p className="text-xs text-[#4b5563]">
                    MOQ: {item.moq} | Case Pack: {item.casePack}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-[#111827]">${item.lineTotal.toFixed(2)}</p>
                  <p className="text-xs text-[#4b5563]">${item.unitPrice.toFixed(2)} each</p>
                </div>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity - item.casePack)}
                    disabled={updating}
                    className="rounded px-2 py-1 text-xs font-semibold text-[#4b5563] border border-[#e7e4dc] hover:bg-[#f5f3f0] disabled:opacity-50"
                  >
                    − Case
                  </button>
                  <span className="min-w-12 text-center text-sm font-medium text-[#111827]">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity + item.casePack)}
                    disabled={updating}
                    className="rounded px-2 py-1 text-xs font-semibold text-white bg-[#1d4b43] hover:bg-[#163836] disabled:opacity-50"
                  >
                    + Case
                  </button>
                </div>
                <button
                  onClick={() => updateQuantity(item.productId, 0)}
                  disabled={updating}
                  className="text-xs font-semibold text-red-600 hover:text-red-700 disabled:opacity-50"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="rounded-lg border border-[#e7e4dc] bg-[#fcfbf9] p-4">
          <h3 className="text-sm font-semibold text-[#111827] mb-3">Order Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-[#4b5563]">
              <span>Subtotal</span>
              <span>${cart.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[#4b5563]">
              <span>Shipping</span>
              <span>{cart.shippingTotal === 0 ? "Free" : `$${cart.shippingTotal.toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between text-[#4b5563]">
              <span>Tax (est.)</span>
              <span>${cart.taxTotal.toFixed(2)}</span>
            </div>
            <div className="border-t border-[#e7e4dc] pt-2 flex justify-between font-semibold text-[#111827]">
              <span>Total</span>
              <span>${cart.grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Link
            href="/products"
            className="flex-1 rounded-lg border border-[#e7e4dc] px-4 py-3 text-center text-sm font-semibold text-[#111827] hover:bg-[#f5f3f0]"
          >
            Continue Shopping
          </Link>
          <Link
            href="/checkout"
            className="flex-1 rounded-lg bg-[#1d4b43] px-4 py-3 text-center text-sm font-semibold text-white hover:bg-[#163836]"
          >
            Checkout
          </Link>
        </div>
      </div>
    </SectionCard>
  );
}
