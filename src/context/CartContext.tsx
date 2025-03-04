
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '@/lib/products';
import { useToast } from '@/components/ui/use-toast';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  toggleCart: () => void;
  cartCount: number;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | null>(null);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);
  const { toast } = useToast();

  // Load cart from localStorage on first render
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      }
    } catch (error) {
      console.error('Failed to load cart from localStorage:', error);
    }
  }, []);

  // Update localStorage, cartCount and cartTotal when cartItems change
  useEffect(() => {
    try {
      localStorage.setItem('cart', JSON.stringify(cartItems));
      
      // Update cart count and total
      const count = cartItems.reduce((sum, item) => sum + item.quantity, 0);
      setCartCount(count);
      
      const total = cartItems.reduce(
        (sum, item) => sum + (item.product.discountPrice ?? item.product.price) * item.quantity, 
        0
      );
      setCartTotal(total);
    } catch (error) {
      console.error('Failed to save cart to localStorage:', error);
    }
  }, [cartItems]);

  const addToCart = (product: Product, quantity = 1) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => item.product.id === product.id);
      
      if (existingItem) {
        // Item exists, update quantity
        return prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + quantity } 
            : item
        );
      } else {
        // Item doesn't exist, add new item
        return [...prev, { product, quantity }];
      }
    });
    
    toast({
      title: "Added to cart",
      description: `${product.name} (Qty: ${quantity})`,
    });
    
    // Automatically open cart when adding items
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string) => {
    setCartItems(prev => prev.filter(item => item.product.id !== productId));
    
    toast({
      title: "Removed from cart",
      description: "Item has been removed from your cart",
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCartItems(prev => 
      prev.map(item => 
        item.product.id === productId 
          ? { ...item, quantity } 
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    toast({
      title: "Cart cleared",
      description: "All items have been removed from your cart",
    });
  };

  const toggleCart = () => {
    setIsCartOpen(prev => !prev);
  };

  return (
    <CartContext.Provider 
      value={{ 
        cartItems, 
        addToCart, 
        removeFromCart, 
        updateQuantity,
        clearCart,
        isCartOpen,
        toggleCart,
        cartCount,
        cartTotal
      }}
    >
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
