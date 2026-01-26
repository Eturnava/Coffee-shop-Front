import React, { createContext, useContext, useState, ReactNode } from 'react';
import { toast } from 'sonner';

export interface CartItem {
  id: string;
  name: string;
  priceUsd: number;
  priceGel: number;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  getCartCount: () => number;
  getTotalUsd: () => number;
  getTotalGel: () => number;
  purchase: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const addToCart = (item: Omit<CartItem, 'quantity'>) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => 
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    
    toast.success(`${item.name} added to cart!`, {
      style: {
        background: 'hsl(142, 76%, 36%)',
        color: 'white',
        border: 'none',
      },
    });
  };

  const removeFromCart = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const clearCart = () => {
    setItems([]);
  };

  const getCartCount = () => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  };

  const getTotalUsd = () => {
    return items.reduce((sum, item) => sum + item.priceUsd * item.quantity, 0);
  };

  const getTotalGel = () => {
    return items.reduce((sum, item) => sum + item.priceGel * item.quantity, 0);
  };

  const purchase = () => {
    toast.success('Purchase successful! Thank you for your order.', {
      style: {
        background: 'hsl(142, 76%, 36%)',
        color: 'white',
        border: 'none',
      },
    });
    clearCart();
  };

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      clearCart,
      getCartCount,
      getTotalUsd,
      getTotalGel,
      purchase
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
