
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '@/lib/products';
import { useToast } from '@/components/ui/use-toast';

interface WishlistContextType {
  wishlistItems: Product[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
  wishlistCount: number;
}

const WishlistContext = createContext<WishlistContextType | null>(null);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState<Product[]>([]);
  const [wishlistCount, setWishlistCount] = useState(0);
  const { toast } = useToast();

  // Load wishlist from localStorage on first render
  useEffect(() => {
    try {
      const savedWishlist = localStorage.getItem('wishlist');
      if (savedWishlist) {
        setWishlistItems(JSON.parse(savedWishlist));
      }
    } catch (error) {
      console.error('Failed to load wishlist from localStorage:', error);
    }
  }, []);

  // Update localStorage and wishlistCount when wishlistItems change
  useEffect(() => {
    try {
      localStorage.setItem('wishlist', JSON.stringify(wishlistItems));
      setWishlistCount(wishlistItems.length);
    } catch (error) {
      console.error('Failed to save wishlist to localStorage:', error);
    }
  }, [wishlistItems]);

  const addToWishlist = (product: Product) => {
    setWishlistItems(prev => {
      const isProductInWishlist = prev.some(item => item.id === product.id);
      
      if (!isProductInWishlist) {
        toast({
          title: "Added to wishlist",
          description: product.name,
        });
        return [...prev, product];
      }
      
      return prev;
    });
  };

  const removeFromWishlist = (productId: string) => {
    setWishlistItems(prev => {
      const updated = prev.filter(item => item.id !== productId);
      
      if (updated.length !== prev.length) {
        toast({
          title: "Removed from wishlist",
          description: "Item has been removed from your wishlist",
        });
      }
      
      return updated;
    });
  };

  const isInWishlist = (productId: string): boolean => {
    return wishlistItems.some(item => item.id === productId);
  };

  const clearWishlist = () => {
    setWishlistItems([]);
    toast({
      title: "Wishlist cleared",
      description: "All items have been removed from your wishlist",
    });
  };

  return (
    <WishlistContext.Provider 
      value={{ 
        wishlistItems, 
        addToWishlist, 
        removeFromWishlist,
        isInWishlist,
        clearWishlist,
        wishlistCount
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
