"use client";
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { cartService } from "@/services/cart.service";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

/**
 * Normalize cart API response so item.product is always a plain ID string,
 * and item.name / item.price / item.subtotal / item.productDetails are available.
 */
function normalizeCart(raw) {
  if (!raw) return null;
  return {
    ...raw,
    items: (raw.items || []).map((item) => {
      const prod = item.product;
      // product may be a populated object or a plain ID string
      const isObj = prod && typeof prod === "object";
      const productId = isObj ? (prod._id || prod.id) : prod;
      const productDetails = isObj ? prod : item.productDetails || null;
      const price = productDetails?.price ?? item.price ?? 0;
      return {
        ...item,
        product: productId,          // always a plain string ID
        productDetails,              // populated product fields
        name: productDetails?.name ?? item.name ?? "",
        price,
        subtotal: price * item.quantity,
      };
    }),
  };
}

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState(null);
  const [cartLoading, setCartLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!user) {
      setCart(null);
      return;
    }
    setCartLoading(true);
    try {
      const data = await cartService.get();
      setCart(normalizeCart(data));
    } catch {
      setCart(null);
    } finally {
      setCartLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (productId, quantity = 1) => {
    const data = await cartService.addItem(productId, quantity);
    setCart(normalizeCart(data));
    return data;
  };

  const updateQuantity = async (productId, quantity) => {
    const data = await cartService.updateItem(productId, quantity);
    setCart(normalizeCart(data));
    return data;
  };

  const removeFromCart = async (productId) => {
    const data = await cartService.removeItem(productId);
    setCart(normalizeCart(data));
    return data;
  };

  const clearCart = async () => {
    const data = await cartService.clear();
    setCart(normalizeCart(data));
    return data;
  };

  const cartCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const cartTotal = cart?.items?.reduce((sum, item) => sum + item.subtotal, 0) || 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        cartLoading,
        cartCount,
        cartTotal,
        fetchCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
