
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Heart, 
  ShoppingCart, 
  ChevronLeft,
  Check, 
  ChevronRight,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { getProductById, getRecommendedProducts, Product } from '@/lib/products';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import ProductCard from '@/components/ui/product-card';
import Header from '@/components/layout/header';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProductData = async () => {
      if (!id) return;
      
      try {
        const productData = await getProductById(id);
        
        if (productData) {
          setProduct(productData);
          
          // Set default selections
          if (productData.colors.length > 0) {
            setSelectedColor(productData.colors[0]);
          }
          
          if (productData.sizes.length > 0) {
            setSelectedSize(productData.sizes[0]);
          }
          
          // Get recommended products
          const recommended = await getRecommendedProducts(id);
          setRecommendedProducts(recommended);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        // Handle error state if needed
      } finally {
        setLoading(false);
      }
    };
    
    fetchProductData();
  }, [id]);

  useEffect(() => {
    // Reset scroll position when component mounts
    window.scrollTo(0, 0);
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    
    if (product.sizes.length > 0 && !selectedSize) {
      toast({
        title: "Please select a size",
        variant: "destructive"
      });
      return;
    }
    
    if (product.colors.length > 0 && !selectedColor) {
      toast({
        title: "Please select a color",
        variant: "destructive"
      });
      return;
    }
    
    addToCart(product, quantity);
    
    toast({
      title: "Added to cart",
      description: `${product.name} (Qty: ${quantity})`,
    });
  };

  const handleWishlistToggle = () => {
    if (!product) return;
    
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
  
  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`full-${i}`} size={16} className="fill-yellow-400 text-yellow-400" />);
    }
    
    if (hasHalfStar) {
      stars.push(
        <Star
          key="half"
          size={16}
          className="text-yellow-400"
          strokeWidth={2}
          fill="url(#half-star)"
        />
      );
    }
    
    // Add remaining empty stars
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} size={16} className="text-gray-300" />);
    }
    
    return (
      <>
        <svg width="0" height="0" className="hidden">
          <defs>
            <linearGradient id="half-star" x1="0" x2="100%" y1="0" y2="0">
              <stop offset="50%" stopColor="#facc15" />
              <stop offset="50%" stopColor="transparent" />
            </linearGradient>
          </defs>
        </svg>
        <div className="flex">{stars}</div>
      </>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-semibold mb-4">Product Not Found</h2>
        <p className="text-gray-600 mb-6">The product you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => navigate('/')}>Return to Shop</Button>
      </div>
    );
  }

  const discountPercentage = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  return (
    <>
      <Header />
      <div className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-black transition-colors mb-6"
          >
            <ChevronLeft size={16} />
            <span>Back</span>
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {/* Product Images */}
            <div className="space-y-4">
              <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden relative">
                <img 
                  src={product.images[currentImageIndex]}
                  alt={product.name}
                  className="w-full h-full object-cover object-center animate-fade-in"
                />
                
                {/* Image navigation arrows */}
                {product.images.length > 1 && (
                  <>
                    <button
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center shadow-sm opacity-80 hover:opacity-100 transition-opacity"
                      onClick={() => setCurrentImageIndex(prev => 
                        prev === 0 ? product.images.length - 1 : prev - 1
                      )}
                      aria-label="Previous image"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center shadow-sm opacity-80 hover:opacity-100 transition-opacity"
                      onClick={() => setCurrentImageIndex(prev => 
                        prev === product.images.length - 1 ? 0 : prev + 1
                      )}
                      aria-label="Next image"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </>
                )}
                
                {/* Status badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {product.isNew && (
                    <Badge variant="secondary" className="bg-white/90 text-black font-medium">
                      New
                    </Badge>
                  )}
                  {product.isBestSeller && (
                    <Badge variant="secondary" className="bg-black/90 text-white font-medium">
                      Best Seller
                    </Badge>
                  )}
                  {discountPercentage > 0 && (
                    <Badge variant="destructive">
                      {discountPercentage}% OFF
                    </Badge>
                  )}
                </div>
              </div>
              
              {/* Thumbnail navigation */}
              {product.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {product.images.map((image, idx) => (
                    <button
                      key={idx}
                      className={`w-20 h-20 rounded-md overflow-hidden flex-shrink-0 transition-all ${
                        idx === currentImageIndex 
                          ? 'ring-2 ring-black opacity-100' 
                          : 'opacity-70 hover:opacity-100'
                      }`}
                      onClick={() => setCurrentImageIndex(idx)}
                    >
                      <img 
                        src={image} 
                        alt={`${product.name} - view ${idx + 1}`} 
                        className="w-full h-full object-cover object-center"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Product Details */}
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-semibold mb-2">{product.name}</h1>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-sm">{product.category}</span>
                  <Separator orientation="vertical" className="h-4" />
                  <div className="flex items-center gap-1">
                    {renderStars(product.rating)}
                    <span className="text-sm text-gray-500">({product.rating.toFixed(1)})</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 mb-6">
                  {product.discountPrice ? (
                    <>
                      <span className="text-2xl font-semibold">${product.discountPrice.toFixed(2)}</span>
                      <span className="text-gray-500 line-through">${product.price.toFixed(2)}</span>
                      <Badge variant="outline" className="text-red-500 border-red-200 font-medium bg-red-50">
                        Save ${(product.price - product.discountPrice).toFixed(2)}
                      </Badge>
                    </>
                  ) : (
                    <span className="text-2xl font-semibold">${product.price.toFixed(2)}</span>
                  )}
                </div>
                
                <p className="text-gray-600 mb-8">
                  {product.description}
                </p>
                
                {/* Color Selection */}
                {product.colors.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium mb-3">Color: {selectedColor}</h3>
                    <div className="flex gap-2">
                      {product.colors.map(color => (
                        <button
                          key={color}
                          className={`w-9 h-9 rounded-full border transition-all flex items-center justify-center ${
                            selectedColor === color 
                              ? 'border-black border-2' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setSelectedColor(color)}
                          aria-label={`Select ${color} color`}
                        >
                          <span 
                            className={`w-7 h-7 rounded-full ${
                              color === 'Black' ? 'bg-black' :
                              color === 'White' ? 'bg-white' :
                              color === 'Gray' ? 'bg-gray-400' :
                              'bg-gray-200'
                            }`}
                          />
                          {selectedColor === color && (
                            <Check 
                              size={14} 
                              className={`absolute ${
                                color === 'Black' ? 'text-white' : 'text-black'
                              }`} 
                            />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Size Selection */}
                {product.sizes.length > 0 && (
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-medium">Size: {selectedSize}</h3>
                      <button className="text-xs text-gray-500 underline">Size Guide</button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {product.sizes.map(size => (
                        <button
                          key={size}
                          className={`min-w-[3rem] h-10 px-3 rounded-md transition-all text-sm ${
                            selectedSize === size 
                              ? 'bg-black text-white' 
                              : 'bg-gray-100 hover:bg-gray-200'
                          }`}
                          onClick={() => setSelectedSize(size)}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Quantity and Add to Cart */}
                <div className="flex flex-col gap-3 mb-6 sm:flex-row">
                  <div className="flex h-11 border border-gray-200 rounded-md">
                    <button
                      className="w-10 flex items-center justify-center text-gray-600 hover:bg-gray-50 rounded-l-md"
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1}
                    >
                      -
                    </button>
                    <div className="w-12 flex items-center justify-center font-medium">
                      {quantity}
                    </div>
                    <button
                      className="w-10 flex items-center justify-center text-gray-600 hover:bg-gray-50 rounded-r-md"
                      onClick={() => handleQuantityChange(quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                  
                  <div className="flex flex-1 gap-2">
                    <Button
                      className="flex-1 h-11"
                      onClick={handleAddToCart}
                      disabled={!product.inStock}
                    >
                      <ShoppingCart size={18} className="mr-2" />
                      {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="icon"
                      className={`h-11 w-11 ${
                        isInWishlist(product.id) 
                          ? 'bg-red-50 text-red-500 border-red-200 hover:bg-red-100 hover:text-red-600' 
                          : ''
                      }`}
                      onClick={handleWishlistToggle}
                      aria-label={isInWishlist(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                    >
                      <Heart 
                        size={18} 
                        className={isInWishlist(product.id) ? 'fill-current' : ''} 
                      />
                    </Button>
                  </div>
                </div>
                
                {/* Stock Status */}
                <div className={`flex items-center gap-2 text-sm mb-8 ${
                  product.inStock ? 'text-green-600' : 'text-red-500'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    product.inStock ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                  <span>
                    {product.inStock ? 'In Stock' : 'Currently Out of Stock'}
                  </span>
                </div>
              </div>
              
              {/* Product Information Tabs */}
              <Tabs defaultValue="features">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="features">Features</TabsTrigger>
                  <TabsTrigger value="shipping">Shipping</TabsTrigger>
                  <TabsTrigger value="returns">Returns</TabsTrigger>
                </TabsList>
                <TabsContent value="features" className="space-y-4">
                  <ul className="space-y-2">
                    {product.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check size={16} className="mt-1 text-green-500 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </TabsContent>
                <TabsContent value="shipping" className="space-y-4">
                  <p className="text-gray-600">
                    Free standard shipping on orders over $50. Expedited and international shipping options available at checkout.
                  </p>
                  <p className="text-gray-600">
                    Standard delivery: 3-5 business days<br />
                    Express delivery: 1-2 business days
                  </p>
                </TabsContent>
                <TabsContent value="returns" className="space-y-4">
                  <p className="text-gray-600">
                    We offer a 30-day return policy. Items must be unused and in original packaging.
                  </p>
                  <p className="text-gray-600">
                    Initiate returns through your account or contact customer support for assistance.
                  </p>
                </TabsContent>
              </Tabs>
            </div>
          </div>
          
          {/* Recommended Products */}
          {recommendedProducts.length > 0 && (
            <div className="mt-16">
              <h2 className="text-xl font-semibold mb-8">You May Also Like</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {recommendedProducts.map((product, index) => (
                  <ProductCard 
                    key={product.id} 
                    product={product}
                    index={index} 
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ProductDetail;
