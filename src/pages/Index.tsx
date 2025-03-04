import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Check, ChevronDown, ChevronUp, Search, SlidersHorizontal, X } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import { Product, getProducts, getRecommendedProducts, categories } from '@/lib/products';
import ProductCard from '@/components/ui/product-card';
import Header from '@/components/layout/header';
import { useDebounce } from '@/hooks/use-debounce';
import { Badge } from '@/components/ui/badge';

const Index = () => {
  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [sortBy, setSortBy] = useState<string>('featured');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const debouncedPriceRange = useDebounce(priceRange, 500);
  
  const itemsPerPage = 12;

  // Fetch products data using DummyJSON API
  const { data: allProducts = [], isLoading: isProductsLoading } = useQuery({
    queryKey: ['products'],
    queryFn: getProducts,
  });

  // Fetch recommended products
  const { data: recommendedProducts = [], isLoading: isRecommendedLoading } = useQuery({
    queryKey: ['recommendedProducts'],
    queryFn: () => getRecommendedProducts(),
  });

  // Filter and sort products
  const filteredProducts = allProducts.filter((product: Product) => {
    const matchesSearch = product.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) || 
                          product.category.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
    
    const matchesPrice = (product.discountPrice || product.price) >= debouncedPriceRange[0] && 
                         (product.discountPrice || product.price) <= debouncedPriceRange[1];
    
    const matchesCategory = selectedCategories.length === 0 || 
                           selectedCategories.includes('All') ||
                           selectedCategories.includes(product.category);
    
    return matchesSearch && matchesPrice && matchesCategory;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a: Product, b: Product) => {
    const priceA = a.discountPrice ?? a.price;
    const priceB = b.discountPrice ?? b.price;
    
    switch (sortBy) {
      case 'priceAsc':
        return priceA - priceB;
      case 'priceDesc':
        return priceB - priceA;
      case 'newest':
        return a.isNew ? -1 : b.isNew ? 1 : 0;
      default: // 'featured'
        return b.isBestSeller ? 1 : -1;
    }
  });

  // Pagination logic
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const currentProducts = sortedProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle category selection
  const toggleCategory = (category: string) => {
    if (category === 'All') {
      setSelectedCategories(['All']);
      return;
    }
    
    const newCategories = selectedCategories.includes(category)
      ? selectedCategories.filter(c => c !== category)
      : [...selectedCategories.filter(c => c !== 'All'), category];
    
    setSelectedCategories(newCategories.length ? newCategories : ['All']);
  };

  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setPriceRange([0, 1000]);
    setSortBy('featured');
    setSelectedCategories([]);
    setCurrentPage(1);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 pt-24 pb-16">
        {/* Hero Section */}
        <section className="mb-16 text-center">
          <h1 className="text-4xl md:text-5xl font-semibold mb-4 tracking-tight">Discover Our Collection</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explore our carefully curated selection of products designed for modern living. Quality meets style in every piece.
          </p>
        </section>
        
        {/* Filters and Product Grid */}
        <div className="flex flex-col md:flex-row gap-8">
          {/* Mobile Filter Toggle */}
          <div className="md:hidden">
            <Button 
              variant="outline" 
              className="w-full flex items-center justify-between"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              <span className="flex items-center gap-2">
                <SlidersHorizontal size={16} />
                Filters
              </span>
              {isFilterOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </Button>
          </div>
          
          {/* Filters Sidebar */}
          <aside className={`w-full md:w-72 flex-shrink-0 ${isFilterOpen ? 'block' : 'hidden md:block'}`}>
            <div className="bg-white p-6 rounded-lg border border-gray-100 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-medium text-lg">Filters</h2>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-gray-500 text-xs"
                  onClick={resetFilters}
                >
                  Reset All
                </Button>
              </div>
              
              {/* Search */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <Input
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                  {searchTerm && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 text-gray-400"
                      onClick={() => setSearchTerm('')}
                    >
                      <X size={14} />
                    </Button>
                  )}
                </div>
              </div>
              
              {/* Categories */}
              <div className="mb-6">
                <h3 className="text-sm font-medium mb-3">Categories</h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <div key={category} className="flex items-center">
                      <button
                        className="flex items-center gap-2 text-sm w-full text-left py-1.5 hover:text-black"
                        onClick={() => toggleCategory(category)}
                      >
                        <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                          selectedCategories.includes(category) 
                            ? 'border-black bg-black text-white' 
                            : 'border-gray-300'
                        }`}>
                          {selectedCategories.includes(category) && <Check size={12} />}
                        </div>
                        <span className={selectedCategories.includes(category) ? 'font-medium' : 'text-gray-600'}>
                          {category}
                        </span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Price Range */}
              <div className="mb-6">
                <h3 className="text-sm font-medium mb-3">Price Range</h3>
                <div className="px-2">
                  <Slider
                    value={priceRange}
                    min={0}
                    max={1000}
                    step={10}
                    onValueChange={(value) => setPriceRange(value as [number, number])}
                    className="price-slider mb-4"
                  />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>${priceRange[0]}</span>
                  <span>${priceRange[1]}</span>
                </div>
              </div>
            </div>
          </aside>
          
          {/* Main Content */}
          <div className="flex-1">
            {/* Sort Controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
              <div className="text-sm text-gray-600">
                Showing <span className="font-medium text-black">{filteredProducts.length}</span> products
              </div>
              
              <div className="flex items-center gap-4">
                {/* View Switcher */}
                <div className="hidden sm:flex items-center border rounded-md">
                  <Button
                    variant={view === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    className="h-8 px-3 rounded-r-none"
                    onClick={() => setView('grid')}
                  >
                    Grid
                  </Button>
                  <Button
                    variant={view === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    className="h-8 px-3 rounded-l-none"
                    onClick={() => setView('list')}
                  >
                    List
                  </Button>
                </div>
                
                {/* Sort Dropdown */}
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[160px] h-9">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="priceAsc">Price: Low to High</SelectItem>
                    <SelectItem value="priceDesc">Price: High to Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Active Filters */}
            {(selectedCategories.length > 0 || debouncedSearchTerm || debouncedPriceRange[0] > 0 || debouncedPriceRange[1] < 1000) && (
              <div className="flex flex-wrap gap-2 mb-6">
                {selectedCategories.map((category) => (
                  <Badge key={category} variant="secondary" className="flex items-center gap-1">
                    {category}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-4 w-4 ml-1" 
                      onClick={() => toggleCategory(category)}
                    >
                      <X size={10} />
                    </Button>
                  </Badge>
                ))}
                
                {debouncedSearchTerm && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Search: {debouncedSearchTerm}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-4 w-4 ml-1" 
                      onClick={() => setSearchTerm('')}
                    >
                      <X size={10} />
                    </Button>
                  </Badge>
                )}
                
                {(debouncedPriceRange[0] > 0 || debouncedPriceRange[1] < 1000) && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Price: ${debouncedPriceRange[0]} - ${debouncedPriceRange[1]}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-4 w-4 ml-1" 
                      onClick={() => setPriceRange([0, 1000])}
                    >
                      <X size={10} />
                    </Button>
                  </Badge>
                )}
              </div>
            )}
            
            {/* Product Grid */}
            {isProductsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-stagger">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="aspect-[3/4] bg-gray-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : currentProducts.length > 0 ? (
              <div className={`
                ${view === 'grid' 
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-stagger' 
                  : 'space-y-4'
                }
              `}>
                {currentProducts.map((product, idx) => (
                  <ProductCard key={product.id} product={product} index={idx} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <h3 className="text-lg font-medium mb-2">No products found</h3>
                <p className="text-gray-500 mb-6">Try adjusting your filters or search criteria</p>
                <Button onClick={resetFilters}>Clear Filters</Button>
              </div>
            )}
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-12">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  
                  {[...Array(totalPages)].map((_, i) => (
                    <Button
                      key={i}
                      variant={currentPage === i + 1 ? "default" : "outline"}
                      size="sm"
                      className="w-9"
                      onClick={() => setCurrentPage(i + 1)}
                    >
                      {i + 1}
                    </Button>
                  ))}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Recommended Products */}
        <section className="mt-24">
          <h2 className="text-2xl font-semibold mb-6">Recommended For You</h2>
          
          {isRecommendedLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 animate-fade-stagger">
              {recommendedProducts.slice(0, 4).map((product, idx) => (
                <ProductCard key={product.id} product={product} index={idx} />
              ))}
            </div>
          )}
        </section>
      </main>
      
      {/* Newsletter Section */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-semibold mb-2">Stay Updated</h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Subscribe to our newsletter to receive updates on new arrivals, special offers and more.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Your email address"
              className="flex-1"
            />
            <Button>Subscribe</Button>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-medium mb-4">EMINENCE</h3>
              <p className="text-gray-400 text-sm">
                Premium quality products for the modern lifestyle. Designed with passion and crafted with care.
              </p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium uppercase mb-4">Shop</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">New Arrivals</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Best Sellers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Sale</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Collections</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-sm font-medium uppercase mb-4">Help</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">FAQs</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Shipping & Returns</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-sm font-medium uppercase mb-4">Follow Us</h4>
              <div className="flex gap-4 mb-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd"></path>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.045-1.064.218-1.504.344-1.857.182-.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd"></path>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                  </svg>
                </a>
              </div>
              <p className="text-gray-400 text-xs">
                © 2023 EMINENCE. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
