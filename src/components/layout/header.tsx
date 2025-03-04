
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Heart, Menu, X, Search, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import CartItem from '@/components/ui/cart-item';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
  SheetFooter,
} from '@/components/ui/sheet';

const Header: React.FC = () => {
  const { cartItems, toggleCart, isCartOpen, cartCount, cartTotal, clearCart } = useCart();
  const { wishlistCount } = useWishlist();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Track scroll position
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isCartEmpty = cartItems.length === 0;

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/' },
    { name: 'Categories', path: '/' },
    { name: 'Sale', path: '/' },
    { name: 'About', path: '/' },
  ];

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled 
          ? "bg-white/90 backdrop-blur-md shadow-sm py-3" 
          : "bg-transparent py-5"
      )}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between">
          {/* Mobile menu button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu size={24} />
          </Button>

          {/* Logo */}
          <Link to="/" className="text-xl font-display font-semibold">
            EMINENCE
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="text-sm font-medium text-gray-600 hover:text-black transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:right-0 after:h-[2px] after:bg-black after:scale-x-0 after:origin-right after:transition-transform hover:after:scale-x-100 hover:after:origin-left"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Header Actions */}
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="hidden md:flex">
              <Search size={20} />
            </Button>
            
            <Link to="/">
              <Button variant="ghost" size="icon">
                <User size={20} />
              </Button>
            </Link>
            
            <Link to="/">
              <Button variant="ghost" size="icon" className="relative">
                <Heart size={20} />
                {wishlistCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-[10px] font-medium"
                  >
                    {wishlistCount}
                  </Badge>
                )}
              </Button>
            </Link>

            <Sheet open={isCartOpen} onOpenChange={toggleCart}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <ShoppingCart size={20} />
                  {cartCount > 0 && (
                    <Badge 
                      className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-[10px] font-medium"
                    >
                      {cartCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="flex flex-col">
                <SheetHeader className="border-b pb-4">
                  <SheetTitle>Shopping Cart ({cartCount})</SheetTitle>
                </SheetHeader>
                
                <div className="flex-1 overflow-y-auto py-4">
                  {isCartEmpty ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <ShoppingCart size={48} className="text-gray-300 mb-4" />
                      <h3 className="text-lg font-medium mb-1">Your cart is empty</h3>
                      <p className="text-sm text-gray-500 mb-6">
                        Looks like you haven't added anything to your cart yet.
                      </p>
                      <SheetClose asChild>
                        <Button>Start Shopping</Button>
                      </SheetClose>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {cartItems.map((item) => (
                        <CartItem key={item.product.id} item={item} />
                      ))}
                    </div>
                  )}
                </div>
                
                {!isCartEmpty && (
                  <SheetFooter className="border-t pt-4 block space-y-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Subtotal</span>
                      <span className="font-semibold">${cartTotal.toFixed(2)}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                      <span>Shipping and taxes calculated at checkout</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" onClick={clearCart}>
                        Clear Cart
                      </Button>
                      <Button>Checkout</Button>
                    </div>
                  </SheetFooter>
                )}
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Mobile navigation menu */}
      <div 
        className={cn(
          "fixed inset-0 bg-black/40 z-50 md:hidden transition-opacity",
          isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none" 
        )}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        <div 
          className={cn(
            "fixed inset-y-0 left-0 w-[70%] max-w-xs bg-white transform transition-transform duration-300 ease-out p-5",
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-8">
            <span className="text-xl font-semibold">Menu</span>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <X size={20} />
            </Button>
          </div>
          
          <nav className="space-y-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="block py-2 text-lg font-medium hover:text-primary transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
