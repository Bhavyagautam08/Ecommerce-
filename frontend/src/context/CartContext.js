"use client";
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { cartService } from "@/services/cart.service";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

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
      setCart(data);
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
    setCart(data);
    return data;
  };

  const updateQuantity = async (productId, quantity) => {
    const data = await cartService.updateItem(productId, quantity);
    setCart(data);
    return data;
  };

  const removeFromCart = async (productId) => {
    const data = await cartService.removeItem(productId);
    setCart(data);
    return data;
  };

  const clearCart = async () => {
    const data = await cartService.clear();
    setCart(data);
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
