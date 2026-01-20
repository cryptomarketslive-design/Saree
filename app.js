const { useState, useEffect } = React;

// Get Lucide icons
const ShoppingCart = () => React.createElement('i', { 'data-lucide': 'shopping-cart' });
const Menu = () => React.createElement('i', { 'data-lucide': 'menu' });
const X = () => React.createElement('i', { 'data-lucide': 'x' });
const ChevronLeft = () => React.createElement('i', { 'data-lucide': 'chevron-left' });
const ChevronRight = () => React.createElement('i', { 'data-lucide': 'chevron-right' });
const Minus = () => React.createElement('i', { 'data-lucide': 'minus' });
const Plus = () => React.createElement('i', { 'data-lucide': 'plus' });
const Upload = () => React.createElement('i', { 'data-lucide': 'upload' });

// Initialize Lucide icons after component renders
const useLucide = () => {
  useEffect(() => {
    if (window.lucide) {
      window.lucide.createIcons();
    }
  });
};

// PRODUCT DATA
const defaultProducts = [
  {
    id: 1,
    name: "Banarasi Silk Wedding Sari - Royal Red",
    originalPrice: 8999,
    discountedPrice: 6499,
    images: [
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&h=600&fit=crop&q=80",
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&h=600&fit=crop&q=80",
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&h=600&fit=crop&q=80"
    ],
    tags: ["Banarasi", "Silk", "Wedding"],
    description: "Exquisite handwoven Banarasi silk sari in royal red with intricate gold zari work. Perfect for weddings and grand celebrations. Features traditional Mughal-inspired motifs and a rich pallu design."
  },
  {
    id: 2,
    name: "Cotton Handloom Sari - Ocean Blue",
    originalPrice: 3999,
    discountedPrice: 2799,
    images: [
      "https://images.unsplash.com/photo-1583391733956-6c78276477e5?w=400&h=600&fit=crop&q=80",
      "https://images.unsplash.com/photo-1583391733956-6c78276477e5?w=400&h=600&fit=crop&q=80",
      "https://images.unsplash.com/photo-1583391733956-6c78276477e5?w=400&h=600&fit=crop&q=80"
    ],
    tags: ["Cotton", "Handloom", "Casual"],
    description: "Soft and breathable pure cotton handloom sari in ocean blue. Ideal for daily wear and office settings. Features elegant border work and comfortable drape."
  },
  {
    id: 3,
    name: "Kanjivaram Silk Temple Sari - Green",
    originalPrice: 12999,
    discountedPrice: 9999,
    images: [
      "https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=400&h=600&fit=crop&q=80",
      "https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=400&h=600&fit=crop&q=80",
      "https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=400&h=600&fit=crop&q=80"
    ],
    tags: ["Kanjivaram", "Silk", "Traditional"],
    description: "Authentic Kanjivaram silk sari with temple border design in rich emerald green. Handcrafted by master weavers with pure gold zari. A timeless piece for special occasions."
  }
];

const SariEcommerce = () => {
  useLucide();
  
  const [currentPage, setCurrentPage] = useState('home');
  const [pageNumber, setPageNumber] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cart, setCart] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [orderComplete, setOrderComplete] = useState(false);
  const [uploadedProducts, setUploadedProducts] = useState(null);
  const [showUploadInfo, setShowUploadInfo] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: ''
  });

  const ADMIN_MODE = true;

  const generateMockProducts = () => {
    const baseProducts = uploadedProducts || defaultProducts;
    
    if (baseProducts.length >= 156) {
      return baseProducts.slice(0, 156);
    }
    
    const sariTypes = ['Silk', 'Cotton', 'Georgette', 'Chiffon', 'Banarasi', 'Kanjivaram', 'Tussar', 'Chanderi'];
    const colors = ['Crimson', 'Sapphire', 'Emerald', 'Gold', 'Rose', 'Ivory', 'Burgundy', 'Teal', 'Mauve', 'Coral'];
    const patterns = ['Floral', 'Paisley', 'Zari', 'Embroidered', 'Printed', 'Woven', 'Bandhani'];
    
    const mockProducts = Array.from({ length: 156 - baseProducts.length }, (_, i) => {
      const index = i + baseProducts.length;
      const originalPrice = Math.floor(Math.random() * 15000) + 3000;
      const discount = [10, 15, 20, 25, 30][Math.floor(Math.random() * 5)];
      const discountedPrice = Math.floor(originalPrice * (1 - discount / 100));
      
      return {
        id: index + 1,
        name: `${sariTypes[index % sariTypes.length]} ${colors[index % colors.length]} ${patterns[index % patterns.length]} Sari`,
        originalPrice,
        discountedPrice,
        images: [
          `https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&h=600&fit=crop&q=80`,
          `https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&h=600&fit=crop&q=80`,
          `https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&h=600&fit=crop&q=80`
        ],
        tags: [sariTypes[index % sariTypes.length], colors[index % colors.length], patterns[index % patterns.length]],
        description: `Exquisite ${sariTypes[index % sariTypes.length]} sari in stunning ${colors[index % colors.length]} with intricate ${patterns[index % patterns.length]} work. Perfect for weddings, festivals, and special occasions.`
      };
    });
    
    return [...baseProducts, ...mockProducts];
  };

  const allProducts = generateMockProducts();

  const productsPerPage = 12;
  const totalPages = Math.ceil(allProducts.length / productsPerPage);
  const startIdx = (pageNumber - 1) * productsPerPage;
  const currentProducts = allProducts.slice(startIdx, startIdx + productsPerPage);

  const addToCart = (product, quantity = 1) => {
    setCart(prevCart => {
      const existing = prevCart.find(item => item.id === product.id);
      if (existing) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prevCart, { ...product, quantity }];
    });
  };

  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity === 0) {
      removeFromCart(productId);
    } else {
      setCart(prevCart =>
        prevCart.map(item =>
          item.id === productId ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  const getRandomProducts = (excludeId, count = 12) => {
    const filtered = allProducts.filter(p => p.id !== excludeId);
    const shuffled = [...filtered].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  };

  const getTotalItems = () => cart.reduce((sum, item) => sum + item.quantity, 0);
  const getTotalPrice = () => cart.reduce((sum, item) => sum + item.discountedPrice * item.quantity, 0);

  const calculateDiscount = (original, discounted) => {
    return Math.round(((original - discounted) / original) * 100);
  };

  const handleCSVUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim());
    const dataLines = lines.slice(1);
    
    const parsedProducts = dataLines.map((line, index) => {
      const regex = /(?:,|\n|^)("(?:(?:"")*[^"]*)*"|[^",\n]*|(?:\n|$))/g;
      const fields = [];
      let match;
      
      while ((match = regex.exec(line)) !== null) {
        fields.push(match[1].replace(/^"|"$/g, '').replace(/""/g, '"'));
      }
      
      const [id, name, originalPrice, discountedPrice, images, tags, description] = fields;
      const imageUrls = images ? images.split('|').map(url => url.trim()) : ["https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&h=600&fit=crop&q=80"];
      const tagList = tags ? tags.split('|').map(tag => tag.trim()) : [];
      
      return {
        id: parseInt(id) || index + 1,
        name: name || `Product ${index + 1}`,
        originalPrice: parseFloat(originalPrice) || 0,
        discountedPrice: parseFloat(discountedPrice) || parseFloat(originalPrice) || 0,
        images: imageUrls.length >= 3 ? imageUrls.slice(0, 3) : [...imageUrls, ...Array(3 - imageUrls.length).fill(imageUrls[0] || "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&h=600&fit=crop&q=80")],
        tags: tagList,
        description: description || 'No description available.'
      };
    });
    
    setUploadedProducts(parsedProducts);
    setPageNumber(1);
    alert(`Successfully uploaded ${parsedProducts.length} products!`);
    event.target.value = '';
  };

  const handleCheckout = () => {
    setCurrentPage('checkout');
    setCheckoutStep(1);
  };

  const handleOrderSubmit = () => {
    setOrderComplete(true);
    setCart([]);
  };

  const Header = () => (
    React.createElement('header', { className: "sticky top-0 z-50 bg-white shadow-md" },
      React.createElement('div', { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" },
        React.createElement('div', { className: "flex justify-between items-center h-16" },
          React.createElement('h1', { 
            className: "text-2xl font-serif text-rose-900 cursor-pointer",
            onClick: () => { setCurrentPage('home'); setPageNumber(1); }
          }, "Suvarna Sarees"),

          React.createElement('nav', { className: "hidden md:flex space-x-8" },
            React.createElement('button', { onClick: () => setCurrentPage('home'), className: "text-gray-700 hover:text-rose-900" }, "Home"),
            React.createElement('button', { onClick: () => setCurrentPage('faq'), className: "text-gray-700 hover:text-rose-900" }, "FAQ"),
            React.createElement('button', { onClick: () => setCurrentPage('about'), className: "text-gray-700 hover:text-rose-900" }, "About"),
            React.createElement('button', { onClick: () => setCurrentPage('contact'), className: "text-gray-700 hover:text-rose-900" }, "Contact"),
            React.createElement('button', { onClick: () => setCurrentPage('policy'), className: "text-gray-700 hover:text-rose-900" }, "Policy")
          ),

          React.createElement('div', { className: "flex items-center space-x-4" },
            ADMIN_MODE && React.createElement('button', {
              onClick: () => setShowUploadInfo(!showUploadInfo),
              className: "hidden md:flex items-center gap-2 px-3 py-1.5 bg-rose-100 text-rose-900 rounded-lg hover:bg-rose-200 transition"
            },
              React.createElement(Upload),
              React.createElement('span', { className: "text-sm" }, "Upload CSV")
            ),
            React.createElement('button', { 
              onClick: () => setCurrentPage('cart'),
              className: "relative text-gray-700 hover:text-rose-900"
            },
              React.createElement(ShoppingCart),
              getTotalItems() > 0 && React.createElement('span', { 
                className: "absolute -top-2 -right-2 bg-rose-900 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
              }, getTotalItems())
            ),
            React.createElement('button', { 
              onClick: () => setMobileMenuOpen(!mobileMenuOpen),
              className: "md:hidden text-gray-700"
            }, mobileMenuOpen ? React.createElement(X) : React.createElement(Menu))
          )
        ),

        ADMIN_MODE && showUploadInfo && React.createElement('div', { className: "bg-rose-50 p-4 mb-4 rounded-lg border-2 border-rose-200" },
          React.createElement('h3', { className: "font-semibold text-rose-900 mb-2" }, "Upload Your Products CSV"),
          React.createElement('p', { className: "text-sm text-gray-700 mb-3" }, "Create a CSV file with these columns: id, name, originalPrice, discountedPrice, images, tags, description"),
          React.createElement('div', { className: "text-xs text-gray-600 mb-3 space-y-1" },
            React.createElement('p', null, React.createElement('strong', null, "images:"), " Separate multiple URLs with | (pipe). Example: url1.jpg|url2.jpg|url3.jpg"),
            React.createElement('p', null, React.createElement('strong', null, "tags:"), " Separate tags with | (pipe). Example: Silk|Wedding|Premium")
          ),
          React.createElement('input', { type: "file", accept: ".csv", onChange: handleCSVUpload, className: "text-sm" })
        ),

        mobileMenuOpen && React.createElement('nav', { className: "md:hidden pb-4 space-y-2" },
          React.createElement('button', { onClick: () => { setCurrentPage('home'); setMobileMenuOpen(false); }, className: "block w-full text-left px-4 py-2 text-gray-700 hover:bg-rose-50" }, "Home"),
          React.createElement('button', { onClick: () => { setCurrentPage('faq'); setMobileMenuOpen(false); }, className: "block w-full text-left px-4 py-2 text-gray-700 hover:bg-rose-50" }, "FAQ"),
          React.createElement('button', { onClick: () => { setCurrentPage('about'); setMobileMenuOpen(false); }, className: "block w-full text-left px-4 py-2 text-gray-700 hover:bg-rose-50" }, "About"),
          React.createElement('button', { onClick: () => { setCurrentPage('contact'); setMobileMenuOpen(false); }, className: "block w-full text-left px-4 py-2 text-gray-700 hover:bg-rose-50" }, "Contact"),
          React.createElement('button', { onClick: () => { setCurrentPage('policy'); setMobileMenuOpen(false); }, className: "block w-full text-left px-4 py-2 text-gray-700 hover:bg-rose-50" }, "Policy")
        )
      )
    )
  );

  const Footer = () => (
    React.createElement('footer', { className: "bg-rose-900 text-white mt-16" },
      React.createElement('div', { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" },
        React.createElement('div', { className: "text-center mb-8" },
          React.createElement('h3', { className: "text-2xl font-serif mb-2" }, "Suvarna Sarees"),
          React.createElement('p', { className: "text-rose-200" }, "Celebrating the timeless elegance of traditional Indian sarees.")
        ),
        React.createElement('div', { className: "border-t border-rose-800 pt-8 text-center text-rose-200" },
          React.createElement('p', null, "© 2026 Suvarna Sarees. All rights reserved.")
        )
      )
    )
  );

  const ProductCard = ({ product }) => {
    const discountPercent = calculateDiscount(product.originalPrice, product.discountedPrice);
    
    return React.createElement('div', { 
      onClick: () => { setSelectedProduct(product); setCurrentPage('product'); },
      className: "bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transform transition hover:scale-105 hover:shadow-xl"
    },
      React.createElement('div', { className: "aspect-[2/3] overflow-hidden bg-gray-100 relative" },
        React.createElement('img', { src: product.images[0], alt: product.name, className: "w-full h-full object-cover" }),
        discountPercent > 0 && React.createElement('div', { className: "absolute top-2 right-2 bg-rose-600 text-white px-2 py-1 rounded-md text-sm font-semibold" }, `${discountPercent}% OFF`)
      ),
      React.createElement('div', { className: "p-4" },
        React.createElement('h3', { className: "font-medium text-gray-900 mb-2 line-clamp-2" }, product.name),
        React.createElement('div', { className: "flex items-center gap-2" },
          React.createElement('p', { className: "text-xl font-semibold text-rose-900" }, `₹${product.discountedPrice.toLocaleString()}`),
          product.originalPrice !== product.discountedPrice && React.createElement('p', { className: "text-sm text-gray-500 line-through" }, `₹${product.originalPrice.toLocaleString()}`)
        )
      )
    );
  };

  const HomePage = () => (
    React.createElement('div', { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" },
      React.createElement('h2', { className: "text-3xl font-serif text-rose-900 mb-8" }, "Our Collection"),
      React.createElement('div', { className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 mb-8" },
        currentProducts.map(product => React.createElement(ProductCard, { key: product.id, product }))
      ),
      React.createElement('div', { className: "flex justify-center items-center space-x-4" },
        React.createElement('button', {
          onClick: () => setPageNumber(Math.max(1, pageNumber - 1)),
          disabled: pageNumber === 1,
          className: "p-2 rounded-lg bg-rose-900 text-white disabled:bg-gray-300 disabled:cursor-not-allowed"
        }, React.createElement(ChevronLeft)),
        React.createElement('div', { className: "flex space-x-2" },
          Array.from({ length: totalPages }, (_, i) => i + 1).map(page =>
            React.createElement('button', {
              key: page,
              onClick: () => setPageNumber(page),
              className: `px-4 py-2 rounded-lg ${page === pageNumber ? 'bg-rose-900 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`
            }, page)
          )
        ),
        React.createElement('button', {
          onClick: () => setPageNumber(Math.min(totalPages, pageNumber + 1)),
          disabled: pageNumber === totalPages,
          className: "p-2 rounded-lg bg-rose-900 text-white disabled:bg-gray-300 disabled:cursor-not-allowed"
        }, React.createElement(ChevronRight))
      )
    )
  );

  const ProductDetailPage = () => {
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);
    const recommendedProducts = getRandomProducts(selectedProduct.id);
    const discountPercent = calculateDiscount(selectedProduct.originalPrice, selectedProduct.discountedPrice);

    return React.createElement('div', { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" },
      React.createElement('div', { className: "grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16" },
        React.createElement('div', { className: "space-y-4" },
          React.createElement('div', { className: "aspect-[2/3] overflow-hidden rounded-lg bg-gray-100 relative" },
            React.createElement('img', { src: selectedProduct.images[selectedImage], alt: selectedProduct.name, className: "w-full h-full object-cover" }),
            discountPercent > 0 && React.createElement('div', { className: "absolute top-4 right-4 bg-rose-600 text-white px-4 py-2 rounded-lg text-lg font-bold shadow-lg" }, `${discountPercent}% OFF`)
          ),
          React.createElement('div', { className: "grid grid-cols-3 gap-4" },
            selectedProduct.images.map((img, idx) =>
              React.createElement('div', {
                key: idx,
                onClick: () => setSelectedImage(idx),
                className: `aspect-[2/3] overflow-hidden rounded-lg cursor-pointer border-2 ${selectedImage === idx ? 'border-rose-900' : 'border-transparent'}`
              }, React.createElement('img', { src: img, alt: "", className: "w-full h-full object-cover" }))
            )
          )
        ),
        React.createElement('div', { className: "space-y-6" },
          React.createElement('h1', { className: "text-3xl font-serif text-gray-900" }, selectedProduct.name),
          React.createElement('div', { className: "flex items-center gap-3" },
            React.createElement('p', { className: "text-3xl font-semibold text-rose-900" }, `₹${selectedProduct.discountedPrice.toLocaleString()}`),
            selectedProduct.originalPrice !== selectedProduct.discountedPrice && React.createElement(React.Fragment, null,
              React.createElement('p', { className: "text-xl text-gray-500 line-through" }, `₹${selectedProduct.originalPrice.toLocaleString()}`),
              React.createElement('span', { className: "bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold" }, `Save ${discountPercent}%`)
            )
          ),
          React.createElement('div', { className: "flex flex-wrap gap-2" },
            selectedProduct.tags.map(tag => React.createElement('span', { key: tag, className: "px-3 py-1 bg-rose-100 text-rose-900 rounded-full text-sm" }, tag))
          ),
          React.createElement('div', { className: "space-y-2" },
            React.createElement('label', { className: "block text-sm font-medium text-gray-700" }, "Quantity"),
            React.createElement('select', {
              value: quantity,
              onChange: (e) => setQuantity(Number(e.target.value)),
              className: "w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-900 focus:border-transparent"
            }, [1, 2, 3, 4, 5].map(num => React.createElement('option', { key: num, value: num }, num)))
          ),
          React.createElement('button', {
            onClick: () => { addToCart(selectedProduct, quantity); alert('Added to cart!'); },
            className: "w-full bg-rose-900 text-white py-3 rounded-lg font-semibold hover:bg-rose-800 transition"
          }, "Add to Cart"),
          React.createElement('div', { className: "border-t pt-6" },
            React.createElement('h3', { className: "font-semibold text-lg mb-3" }, "Description"),
            React.createElement('p', { className: "text-gray-600 leading-relaxed" }, selectedProduct.description)
          )
        )
      ),
      React.createElement('div', { className: "border-t pt-12" },
        React.createElement('h2', { className: "text-2xl font-serif text-rose-900 mb-8" }, "You Might Also Like"),
        React.createElement('div', { className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6" },
          recommendedProducts.map(product => React.createElement(ProductCard, { key: product.id, product }))
        )
      )
    );
  };

  const CartPage = () => (
    React.createElement('div', { className: "max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8" },
      React.createElement('h2', { className: "text-3xl font-serif text-rose-900 mb-8" }, "Shopping Cart"),
      cart.length === 0 ? React.createElement('div', { className: "text-center py-16" },
        React.createElement('p', { className: "text-gray-500 mb-4" }, "Your cart is empty"),
        React.createElement('button', { onClick: () => setCurrentPage('home'), className: "text-rose-900 hover:underline" }, "Continue Shopping")
      ) : React.createElement(React.Fragment, null,
        React.createElement('div', { className: "space-y-4 mb-8" },
          cart.map(item =>
            React.createElement('div', { key: item.id, className: "flex gap-4 bg-white p-4 rounded-lg shadow" },
              React.createElement('img', { src: item.images[0], alt: item.name, className: "w-24 h-36 object-cover rounded" }),
              React.createElement('div', { className: "flex-1" },
                React.createElement('h3', { className: "font-medium text-gray-900" }, item.name),
                React.createElement('div', { className: "flex items-center gap-2" },
                  React.createElement('p', { className: "text-rose-900 font-semibold" }, `₹${item.discountedPrice.toLocaleString()}`),
                  item.originalPrice !== item.discountedPrice && React.createElement('p', { className: "text-sm text-gray-500 line-through" }, `₹${item.originalPrice.toLocaleString()}`)
                ),
                React.createElement('div', { className: "flex items-center gap-2 mt-2" },
                  React.createElement('button', { onClick: () => updateQuantity(item.id, item.quantity - 1), className: "p-1 rounded bg-gray-200 hover:bg-gray-300" }, React.createElement(Minus)),
                  React.createElement('span', { className: "px-4" }, item.quantity),
                  React.createElement('button', { onClick: () => updateQuantity(item.id, Math.min(5, item.quantity + 1)), className: "p-1 rounded bg-gray-200 hover:bg-gray-300" }, React.createElement(Plus)),
                  React.createElement('button', { onClick: () => removeFromCart(item.id), className: "ml-auto text-red-600 hover:text-red-800" }, "Remove")
                )
              )
            )
          )
        ),
        React.createElement('div', { className: "bg-rose-50 p-6 rounded-lg" },
          React.createElement('div', { className: "flex justify-between text-lg mb-4" },
            React.createElement('span', null, "Subtotal:"),
            React.createElement('span', { className: "font-semibold" }, `₹${getTotalPrice().toLocaleString()}`)
          ),
          React.createElement('button', { onClick: handleCheckout, className: "w-full bg-rose-900 text-white py-3 rounded-lg font-semibold hover:bg-rose-800 transition" }, "Proceed to Checkout")
        )
      )
    )
  );

  const CheckoutPage = () => {
    const handleSubmit = () => {
      if (formData.name && formData.address && formData.phone && formData.email) {
        handleOrderSubmit();
      } else {
        alert('Please fill in all fields');
      }
    };

    if (orderComplete) {
      return React.createElement('div', { className: "max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center" },
        React.createElement('div', { className: "bg-green-50 p-8 rounded-lg" },
          React.createElement('h2', { className: "text-3xl font-serif text-green-900 mb-4" }, "Thank You!"),
          React.createElement('p', { className: "text-gray-700 mb-6" }, "Your order has been successfully placed."),
          React.createElement('p', { className: "text-sm text-gray-600 mb-8" }, `Order confirmation has been sent to ${formData.email}`),
          React.createElement('button', {
            onClick: () => {
              setCurrentPage('home');
              setOrderComplete(false);
              setFormData({ name: '', address: '', phone: '', email: '' });
            },
            className: "bg-rose-900 text-white px-8 py-3 rounded-lg hover:bg-rose-800"
          }, "Continue Shopping")
        )
      );
    }

    return React.createElement('div', { className: "max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8" },
      React.createElement('h2', { className: "text-3xl font-serif text-rose-900 mb-8" }, "Checkout"),
      React.createElement('div', { className: "space-y-6" },
        React.createElement('div', null,
          React.createElement('label', { className: "block text-sm font-medium text-gray-700 mb-2" }, "Full Name"),
          React.createElement('input', {
            type: "text",
            value: formData.name,
            onChange: (e) => setFormData({ ...formData, name: e.target.value }),
            className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-900 focus:border-transparent"
          })
        ),
        React.createElement('div', null,
          React.createElement('label', { className: "block text-sm font-medium text-gray-700 mb-2" }, "Address"),
          React.createElement('textarea', {
            value: formData.address,
            onChange: (e) => setFormData({ ...formData, address: e.target.value }),
            rows: "3",
            className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-900 focus:border-transparent"
          })
        ),
        React.createElement('div', null,
          React.createElement('label', { className: "block text-sm font-medium text-gray-700 mb-2" }, "Phone Number"),
          React.createElement('input', {
            type: "tel",
            value: formData.phone,
            onChange: (e) => setFormData({ ...formData, phone: e.target.value }),
            className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-900 focus:border-transparent"
          })
        ),
        React.createElement('div', null,
          React.createElement('label', { className: "block text-sm font-medium text-gray-700 mb-2" }, "Email"),
          React.createElement('input', {
            type: "email",
            value: formData.email,
            onChange: (e) => setFormData({ ...formData, email: e.target.value }),
            className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-900 focus:border-transparent"
          })
        ),
        React.createElement('div', { className: "bg-rose-50 p-6 rounded-lg" },
          React.createElement('h3', { className: "font-semibold mb-4" }, "Order Summary"),
          React.createElement('div', { className: "space-y-2 mb-4" },
            cart.map(item =>
              React.createElement('div', { key: item.id, className: "flex justify-between text-sm" },
                React.createElement('span', null, `${item.name} x ${item.quantity}`),
                React.createElement('span', null, `₹${(item.discountedPrice * item.quantity).toLocaleString()}`)
              )
            )
          ),
          React.createElement('div', { className: "border-t pt-4 flex justify-between font-semibold text-lg" },
            React.createElement('span', null, "Total:"),
            React.createElement('span', null, `₹${getTotalPrice().toLocaleString()}`)
          )
        ),
        React.createElement('button', {
          onClick: handleSubmit,
          className: "w-full bg-rose-900 text-white py-3 rounded-lg font-semibold hover:bg-rose-800 transition"
        }, "Place Order")
      )
    );
  };

  const InfoPage = ({ title, content }) => (
    React.createElement('div', { className: "max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8" },
      React.createElement('h2', { className: "text-3xl font-serif text-rose-900 mb-8" }, title),
      React.createElement('div', { className: "prose prose-lg" }, content)
    )
  );

  return React.createElement('div', { className: "min-h-screen bg-gray-50 flex flex-col" },
    React.createElement(Header),
    React.createElement('main', { className: "flex-1" },
      currentPage === 'home' && React.createElement(HomePage),
      currentPage === 'product' && selectedProduct && React.createElement(ProductDetailPage),
      currentPage === 'cart' && React.createElement(CartPage),
      currentPage === 'checkout' && React.createElement(CheckoutPage),
      currentPage === 'faq' && React.createElement(InfoPage, { 
        title: "Frequently Asked Questions",
        content: React.createElement('div', { className: "space-y-6" },
          React.createElement('div', null,
            React.createElement('h3', { className: "font-semibold text-lg mb-2" }, "How do I place an order?"),
            React.createElement('p', { className: "text-gray-600" }, "Browse our collection, add items to cart, and proceed to checkout to complete your purchase.")
          ),
          React.createElement('div', null,
            React.createElement('h3', { className: "font-semibold text-lg mb-2" }, "What is your return policy?"),
            React.createElement('p', { className: "text-gray-600" }, "We accept returns within 7 days of delivery. Items must be unused with original tags.")
          ),
          React.createElement('div', null,
            React.createElement('h3', { className: "font-semibold text-lg mb-2" }, "How long does shipping take?"),
            React.createElement('p', { className: "text-gray-600" }, "Standard shipping takes 5-7 business days. Express shipping is available.")
          )
        )
      }),
      currentPage === 'about' && React.createElement(InfoPage, { 
        title: "About Suvarna Sarees",
        content: React.createElement('p', { className: "text-gray-600 leading-relaxed" }, "Suvarna Sarees is dedicated to preserving and celebrating the timeless elegance of traditional Indian sarees. Our collection features handpicked sarees from master weavers across India, each piece telling a unique story of craftsmanship and heritage.")
      }),
      currentPage === 'contact' && React.createElement(InfoPage, { 
        title: "Contact Us",
        content: React.createElement('div', { className: "space-y-4 text-gray-600" },
          React.createElement('p', null, React.createElement('strong', null, "Email:"), " contact@suvarnasarees.com"),
          React.createElement('p', null, React.createElement('strong', null, "Phone:"), " +91 98765 43210"),
          React.createElement('p', null, React.createElement('strong', null, "Address:"), " 123 Silk Street, Mumbai, Maharashtra 400001"),
          React.createElement('p', null, React.createElement('strong', null, "Business Hours:"), " Monday - Saturday, 10:00 AM - 7:00 PM")
        )
      }),
      currentPage === 'policy' && React.createElement(InfoPage, { 
        title: "Privacy & Return Policy",
        content: React.createElement('div', { className: "space-y-6 text-gray-600" },
          React.createElement('div', null,
            React.createElement('h3', { className: "font-semibold text-lg text-gray-900 mb-2" }, "Privacy Policy"),
            React.createElement('p', null, "We respect your privacy and are committed to protecting your personal information. All data collected is used solely for order processing and customer service.")
          ),
          React.createElement('div', null,
            React.createElement('h3', { className: "font-semibold text-lg text-gray-900 mb-2" }, "Return Policy"),
            React.createElement('p', null, "Items can be returned within 7 days of delivery in original condition with tags attached. Refunds will be processed within 7-10 business days.")
          ),
          React.createElement('div', null,
            React.createElement('h3', { className: "font-semibold text-lg text-gray-900 mb-2" }, "Shipping Policy"),
            React.createElement('p', null, "We offer standard and express shipping options. Shipping charges vary based on location and order value.")
          )
        )
      })
    ),
    React.createElement(Footer)
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(SariEcommerce));
