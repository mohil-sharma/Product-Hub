
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart } from 'lucide-react';
import { Product } from '@/lib/products';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';

interface ProductCardProps {
  product: Product;
  index?: number;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, index = 0 }) => {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { toast } = useToast();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // Safety check to prevent errors with undefined images
  const hasImages = product.images && product.images.length > 0;
  const productImage = hasImages ? product.images[currentImageIndex] : '';

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsAddingToCart(true);
    
    setTimeout(() => {
      addToCart(product);
      setIsAddingToCart(false);
      
      toast({
        title: "Added to cart",
        description: product.name,
      });
    }, 300);
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
      toast({
        title: "Removed from wishlist",
        description: product.name,
      });
    } else {
      addToWishlist(product);
      toast({
        title: "Added to wishlist",
        description: product.name,
      });
    }
  };

  const handleImageNav = (e: React.MouseEvent, direction: 'prev' | 'next') => {
    e.preventDefault();
    e.stopPropagation();

    if (!hasImages) return;

    if (direction === 'prev') {
      setCurrentImageIndex(prev => 
        prev === 0 ? product.images.length - 1 : prev - 1
      );
    } else {
      setCurrentImageIndex(prev => 
        prev === product.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  // Animation delay for staggered entrance
  const animationDelay = `${(index % 8) * 0.1}s`;

  return (
    <div 
      className="opacity-0 animate-fade-in"
      style={{ animationDelay, animationFillMode: 'forwards' }}
    >
      <Link 
        to={`/product/${product.id}`}
        className="group block relative rounded-xl overflow-hidden bg-white hover-card-animation transition-all duration-500"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Badge indicators */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
          {product.isNew && (
            <Badge variant="secondary" className="bg-white/90 text-black font-medium text-xs">
              New
            </Badge>
          )}
          {product.isBestSeller && (
            <Badge variant="secondary" className="bg-black/90 text-white font-medium text-xs">
              Best Seller
            </Badge>
          )}
          {product.discountPrice && (
            <Badge variant="destructive" className="font-medium text-xs">
              Sale
            </Badge>
          )}
        </div>

        {/* Wishlist button */}
        <button
          className={`absolute top-3 right-3 z-10 p-2 rounded-full transition-all duration-300 ${
            isInWishlist(product.id) 
              ? 'bg-red-50 text-red-500' 
              : 'bg-white/80 text-gray-600 hover:bg-white hover:text-black'
          }`}
          onClick={handleWishlistToggle}
          aria-label={isInWishlist(product.id) ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart 
            size={18} 
            className={isInWishlist(product.id) ? 'fill-red-500' : ''} 
          />
        </button>

        {/* Image carousel */}
        <div className="relative overflow-hidden aspect-[3/4] bg-slate-50">
          {hasImages ? (
            <img
              src={productImage}
              alt={product.name}
              className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              No image available
            </div>
          )}
          
          {/* Image navigation dots */}
          {hasImages && product.images.length > 1 && (
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
              {product.images.map((_, idx) => (
                <button
                  key={idx}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 
                    ${idx === currentImageIndex ? 'bg-black scale-110' : 'bg-black/30'}`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setCurrentImageIndex(idx);
                  }}
                  aria-label={`View image ${idx + 1}`}
                />
              ))}
            </div>
          )}
          
          {/* Image navigation arrows - only visible on hover */}
          {isHovered && hasImages && product.images.length > 1 && (
            <>
              <button
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity"
                onClick={(e) => handleImageNav(e, 'prev')}
                aria-label="Previous image"
              >
                <span className="sr-only">Previous</span>
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 3L5 7.5L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity"
                onClick={(e) => handleImageNav(e, 'next')}
                aria-label="Next image"
              >
                <span className="sr-only">Next</span>
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 3L10 7.5L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </>
          )}
        </div>

        <div className="p-4">
          {/* Product details */}
          <div className="space-y-1 mb-3">
            <h3 className="font-medium text-base tracking-tight line-clamp-1">
              {product.name}
            </h3>
            <p className="text-sm text-gray-500 line-clamp-1">
              {product.category}
            </p>
          </div>
          
          {/* Price */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {product.discountPrice ? (
                <>
                  <span className="font-semibold">${product.discountPrice}</span>
                  <span className="text-gray-400 line-through text-sm">${product.price}</span>
                </>
              ) : (
                <span className="font-semibold">${product.price}</span>
              )}
            </div>
            
            {/* Add to cart button */}
            <Button
              variant="ghost"
              size="icon"
              className={`rounded-full transition-all duration-300 ${
                isAddingToCart ? 'animate-cart-bounce' : ''
              }`}
              onClick={handleAddToCart}
              aria-label="Add to cart"
            >
              <ShoppingCart size={18} />
            </Button>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
