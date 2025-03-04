
export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  discountPrice?: number;
  rating: number;
  description: string;
  features: string[];
  images: string[];
  colors: string[];
  sizes: string[];
  inStock: boolean;
  isNew: boolean;
  isBestSeller: boolean;
}

export const categories = [
  "All",
  "Electronics",
  "Clothing",
  "Home",
  "Kitchen",
  "Beauty",
];

// Transform DummyJSON product to our Product interface
const transformDummyProduct = (product: any): Product => {
  // Ensure we have an object with expected fields
  if (!product || typeof product !== 'object') {
    console.error('Invalid product data:', product);
    return {
      id: 'error',
      name: 'Error loading product',
      category: 'Unknown',
      price: 0,
      rating: 0,
      description: 'There was an error loading this product',
      features: [],
      images: [],
      colors: [],
      sizes: [],
      inStock: false,
      isNew: false,
      isBestSeller: false,
    };
  }

  return {
    id: product.id?.toString() || 'unknown',
    name: product.title || 'Unnamed Product',
    category: product.category || 'Uncategorized',
    price: product.price || 0,
    discountPrice: product.discountPercentage ? Math.round(product.price * (1 - product.discountPercentage / 100)) : undefined,
    rating: product.rating || 0,
    description: product.description || 'No description available',
    features: [
      "Premium quality materials",
      "Elegant minimalist design",
      "Durable construction",
      "Easy to use interface",
    ],
    images: Array.isArray(product.images) ? product.images : [],
    colors: ["Black", "White", "Gray"],
    sizes: product.category?.toLowerCase() === "clothing" ? ["S", "M", "L", "XL"] : [],
    inStock: (product.stock || 0) > 0,
    isNew: (product.id || 0) % 5 === 0, // Make some products "new"
    isBestSeller: (product.id || 0) % 7 === 0, // Make some products "best sellers"
  };
};

// Fetch all products from DummyJSON API
export const getProducts = async (): Promise<Product[]> => {
  try {
    const response = await fetch('https://dummyjson.com/products?limit=100');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.products || !Array.isArray(data.products)) {
      console.error('Invalid products data format:', data);
      return [];
    }
    
    return data.products.map(transformDummyProduct);
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
};

// Get product by ID from DummyJSON API
export const getProductById = async (id: string): Promise<Product | null> => {
  try {
    const response = await fetch(`https://dummyjson.com/products/${id}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch product ${id}: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data || typeof data !== 'object') {
      console.error(`Invalid product data for ID ${id}:`, data);
      return null;
    }
    
    return transformDummyProduct(data);
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error);
    return null;
  }
};

// Get recommended products (random selection)
export const getRecommendedProducts = async (
  currentProductId: string | null = null,
  count: number = 4
): Promise<Product[]> => {
  try {
    // Using the search endpoint with random categories to get varied results
    const randomCategories = ['smartphones', 'laptops', 'fragrances', 'skincare'];
    const randomCategory = randomCategories[Math.floor(Math.random() * randomCategories.length)];
    
    const response = await fetch(`https://dummyjson.com/products/category/${randomCategory}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch recommended products: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.products || !Array.isArray(data.products)) {
      console.error('Invalid recommended products data format:', data);
      return [];
    }
    
    // Filter out current product if provided
    const products = data.products
      .filter((product: any) => currentProductId ? product.id.toString() !== currentProductId : true)
      .map(transformDummyProduct);
    
    // Sort randomly to get different recommendations each time and limit to count
    return products
      .sort(() => Math.random() - 0.5)
      .slice(0, count);
  } catch (error) {
    console.error('Error fetching recommended products:', error);
    return [];
  }
};

// Get best selling products
export const getBestSellingProducts = async (count: number = 4): Promise<Product[]> => {
  try {
    // Using the top-rated products as "best sellers"
    const response = await fetch('https://dummyjson.com/products?limit=30');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch best selling products: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.products || !Array.isArray(data.products)) {
      console.error('Invalid best selling products data format:', data);
      return [];
    }
    
    return data.products
      .sort((a: any, b: any) => b.rating - a.rating)
      .slice(0, count)
      .map(transformDummyProduct);
  } catch (error) {
    console.error('Error fetching best selling products:', error);
    return [];
  }
};

// Get new arrivals
export const getNewArrivals = async (count: number = 4): Promise<Product[]> => {
  try {
    // We'll use the skip parameter to get "newer" products (just for simulation)
    const response = await fetch('https://dummyjson.com/products?limit=30&skip=50');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch new arrivals: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.products || !Array.isArray(data.products)) {
      console.error('Invalid new arrivals data format:', data);
      return [];
    }
    
    return data.products
      .slice(0, count)
      .map(transformDummyProduct);
  } catch (error) {
    console.error('Error fetching new arrivals:', error);
    return [];
  }
};
