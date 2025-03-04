
import React from 'react';
import { Minus, Plus, X } from 'lucide-react';
import { CartItem as CartItemType } from '@/context/CartContext';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';

interface CartItemProps {
  item: CartItemType;
}

const CartItem: React.FC<CartItemProps> = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();
  const { product, quantity } = item;
  
  const displayPrice = product.discountPrice ?? product.price;
  const totalPrice = displayPrice * quantity;

  return (
    <div className="flex py-4 gap-4 border-b border-gray-100 animate-slide-in">
      {/* Product image */}
      <div className="w-20 h-20 flex-shrink-0 rounded-md overflow-hidden bg-gray-50">
        <img 
          src={product.images[0]} 
          alt={product.name} 
          className="w-full h-full object-cover object-center"
        />
      </div>
      
      {/* Product details */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium truncate">{product.name}</h4>
        <p className="text-xs text-gray-500 mb-1">{product.category}</p>
        
        {/* Price display */}
        <div className="flex items-center gap-2 mb-2">
          <span className="font-medium">${displayPrice}</span>
          {product.discountPrice && (
            <span className="text-xs text-gray-400 line-through">${product.price}</span>
          )}
        </div>
        
        {/* Quantity controls */}
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            className="h-6 w-6"
            onClick={() => updateQuantity(product.id, quantity - 1)}
            disabled={quantity <= 1}
            aria-label="Decrease quantity"
          >
            <Minus size={12} />
          </Button>
          
          <span className="text-xs font-medium w-6 text-center">
            {quantity}
          </span>
          
          <Button 
            variant="outline" 
            size="icon" 
            className="h-6 w-6"
            onClick={() => updateQuantity(product.id, quantity + 1)}
            aria-label="Increase quantity"
          >
            <Plus size={12} />
          </Button>
          
          <span className="ml-auto text-sm font-medium">
            ${totalPrice.toFixed(2)}
          </span>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 text-gray-400 hover:text-gray-700"
            onClick={() => removeFromCart(product.id)}
            aria-label="Remove item"
          >
            <X size={14} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
