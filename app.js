const { useState, useEffect, createContext, useContext } = React;
const { ShoppingCart, Menu, X, ChevronLeft, ChevronRight, Plus, Minus, Check } = lucide;

const AppContext = createContext();
const useAppContext = () => useContext(AppContext);

const AppProvider = ({ children }) => {
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [currentPage, setCurrentPage] = useState('home');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [checkoutStep, setCheckoutStep] = useState(1);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadProducts = async () => {
            try {
                const response = await fetch('products.csv');
                const csvText = await response.text();
                const parsed = parseCSV(csvText);
                setProducts(parsed);
                setLoading(false);
            } catch (error) {
                console.error('Error loading products:', error);
                setLoading(false);
            }
        };
        loadProducts();
        const savedCart = localStorage.getItem('cart');
        if (savedCart) setCart(JSON.parse(savedCart));
    }, []);

    useEffect(() => {
        if (cart.length > 0) localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    const parseCSV = (csvText) => {
        const lines = csvText.split('\n').filter(line => line.trim());
        const headers = lines[0].split(',').map(h => h.trim());
        return lines.slice(1).map(line => {
            const values = [];
            let current = '';
            let inQuotes = false;
            for (let char of line) {
                if (char === '"') inQuotes = !inQuotes;
                else if (char === ',' && !inQuotes) { values.push(current.trim()); current = ''; }
                else current += char;
            }
            values.push(current.trim());
            const product = {};
            headers.forEach((header, index) => {
                let value = values[index] || '';
                value = value.replace(/^"|"$/g, '');
                if (header === 'images' || header === 'tags') product[header] = value ? value.split('|').map(v => v.trim()) : [];
                else if (header === 'originalPrice' || header === 'discountedPrice') product[header] = parseFloat(value) || 0;
                else product[header] = value;
            });
            return product;
        });
    };

    const addToCart = (product, quantity) => {
        const existing = cart.find(item => item.id === product.id);
        if (existing) setCart(cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item));
        else setCart([...cart, { ...product, quantity }]);
    };

    const removeFromCart = (productId) => setCart(cart.filter(item => item.id !== productId));

    const updateQuantity = (productId, quantity) => {
        if (quantity === 0) removeFromCart(productId);
        else setCart(cart.map(item => item.id === productId ? { ...item, quantity } : item));
    };

    const clearCart = () => { setCart([]); localStorage.removeItem('cart'); };

    return (
        <AppContext.Provider value={{ products, cart, currentPage, setCurrentPage, selectedProduct, setSelectedProduct, addToCart, removeFromCart, updateQuantity, clearCart, checkoutStep, setCheckoutStep, loading }}>
            {children}
        </AppContext.Provider>
    );
};

const Header = () => {
    const { cart, setCurrentPage } = useAppContext();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    return (
        <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <button onClick={() => setCurrentPage('home')} className="text-2xl font-serif text-gray-900 tracking-wide hover:text-amber-700 transition">SĀRĪ LUXE</button>
                    <nav className="hidden md:flex space-x-8">
                        <button onClick={() => setCurrentPage('home')} className="text-gray-700 hover:text-amber-700 transition font-medium">Collection</button>
                        <button onClick={() => setCurrentPage('home')} className="text-gray-700 hover:text-amber-700 transition font-medium">About</button>
                        <button onClick={() => setCurrentPage('home')} className="text-gray-700 hover:text-amber-700 transition font-medium">Contact</button>
                    </nav>
                    <div className="flex items-center space-x-4">
                        <button onClick={() => setCurrentPage('cart')} className="relative p-2 text-gray-700 hover:text-amber-700 transition">
                            <ShoppingCart size={24} />
                            {cartCount > 0 && <span className="absolute -top-1 -right-1 bg-amber-700 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">{cartCount}</span>}
                        </button>
                        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-gray-700">{mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}</button>
                    </div>
                </div>
            </div>
            {mobileMenuOpen && (
                <div className="md:hidden border-t border-gray-200 bg-white">
                    <div className="px-4 py-3 space-y-3">
                        <button onClick={() => { setCurrentPage('home'); setMobileMenuOpen(false); }} className="block w-full text-left text-gray-700 hover:text-amber-700">Collection</button>
                        <button onClick={() => { setCurrentPage('home'); setMobileMenuOpen(false); }} className="block w-full text-left text-gray-700 hover:text-amber-700">About</button>
                        <button onClick={() => { setCurrentPage('home'); setMobileMenuOpen(false); }} className="block w-full text-left text-gray-700 hover:text-amber-700">Contact</button>
                    </div>
                </div>
            )}
        </header>
    );
};

const ProductCard = ({ product, onClick }) => {
    const discount = product.originalPrice > 0 ? Math.round(((product.originalPrice - product.discountedPrice) / product.originalPrice) * 100) : 0;
    return (
        <div onClick={onClick} className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-xl transition group">
            <div className="aspect-square bg-gray-100 overflow-hidden">
                <img src={product.images[0] || 'https://via.placeholder.com/400'} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
            </div>
            <div className="p-4">
                <p className="text-xs text-amber-700 font-medium uppercase tracking-wide mb-1">{product.sub_category}</p>
                <h3 className="text-lg font-serif text-gray-900 mb-2 line-clamp-2">{product.name}</h3>
                <div className="flex items-center space-x-2">
                    <span className="text-xl font-bold text-gray-900">₹{product.discountedPrice.toLocaleString()}</span>
                    {discount > 0 && (
                        <>
                            <span className="text-sm text-gray-500 line-through">₹{product.originalPrice.toLocaleString()}</span>
                            <span className="text-xs text-green-600 font-semibold">{discount}% OFF</span>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

const HomePage = () => {
    const { products, setCurrentPage, setSelectedProduct, loading } = useAppContext();
    const [page, setPage] = useState(1);
    const itemsPerPage = 12;
    const totalPages = Math.ceil(products.length / itemsPerPage);
    const startIndex = (page - 1) * itemsPerPage;
    const currentProducts = products.slice(startIndex, startIndex + itemsPerPage);
    if (loading) return (<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-center"><div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-700 mx-auto mb-4"></div><h2 className="text-2xl font-serif text-gray-900">Loading Collection...</h2></div></div>);
    if (products.length === 0) return (<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-center"><h2 className="text-2xl font-serif text-gray-900 mb-4">No Products Available</h2><p className="text-gray-600">Please check back soon for our latest collection</p></div></div>);
    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-serif text-gray-900 mb-4">Exquisite Saree Collection</h1>
                    <p className="text-gray-600 max-w-2xl mx-auto">Discover timeless elegance with our curated selection of luxury sarees</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {currentProducts.map(product => (<ProductCard key={product.id} product={product} onClick={() => { setSelectedProduct(product); setCurrentPage('detail'); }} />))}
                </div>
                {totalPages > 1 && (
                    <div className="flex justify-center items-center space-x-4 mt-12">
                        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition"><ChevronLeft size={20} /></button>
                        <div className="flex items-center space-x-2">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                let pageNum = totalPages <= 5 ? i + 1 : page <= 3 ? i + 1 : page >= totalPages - 2 ? totalPages - 4 + i : page - 2 + i;
                                return (<button key={pageNum} onClick={() => setPage(pageNum)} className={`w-10 h-10 rounded-lg font-medium transition ${page === pageNum ? 'bg-amber-700 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'}`}>{pageNum}</button>);
                            })}
                        </div>
                        <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition"><ChevronRight size={20} /></button>
                    </div>
                )}
            </div>
        </div>
    );
};
const ProductDetailPage = () => {
    const { selectedProduct, products, addToCart, setSelectedProduct, setCurrentPage, cart } = useAppContext();
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);
    if (!selectedProduct) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Product not found</div>;
    const isInCart = cart.some(item => item.id === selectedProduct.id);
    const recommendations = products.filter(p => p.id !== selectedProduct.id).sort(() => 0.5 - Math.random()).slice(0, 12);
    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
                    <div className="space-y-4">
                        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                            <img src={selectedProduct.images[selectedImage] || 'https://via.placeholder.com/600'} alt={selectedProduct.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                            {selectedProduct.images.map((img, idx) => (
                                <button key={idx} onClick={() => setSelectedImage(idx)} className={`aspect-square rounded-lg overflow-hidden border-2 transition ${selectedImage === idx ? 'border-amber-700' : 'border-gray-200'}`}>
                                    <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-6">
                        <div>
                            <p className="text-sm text-amber-700 font-medium uppercase tracking-wide mb-2">{selectedProduct.category} • {selectedProduct.sub_category}</p>
                            <h1 className="text-4xl font-serif text-gray-900 mb-4">{selectedProduct.name}</h1>
                            <div className="flex items-center space-x-3 mb-6">
                                <span className="text-3xl font-bold text-gray-900">₹{selectedProduct.discountedPrice.toLocaleString()}</span>
                                {selectedProduct.originalPrice > selectedProduct.discountedPrice && (
                                    <>
                                        <span className="text-xl text-gray-500 line-through">₹{selectedProduct.originalPrice.toLocaleString()}</span>
                                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">{Math.round(((selectedProduct.originalPrice - selectedProduct.discountedPrice) / selectedProduct.originalPrice) * 100)}% OFF</span>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="border-t border-gray-200 pt-6"><p className="text-gray-700 leading-relaxed">{selectedProduct.description}</p></div>
                        {selectedProduct.tags.length > 0 && (
                            <div className="border-t border-gray-200 pt-6">
                                <h3 className="text-sm font-semibold text-gray-900 mb-3">TAGS</h3>
                                <div className="flex flex-wrap gap-2">{selectedProduct.tags.map((tag, idx) => (<span key={idx} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">{tag}</span>))}</div>
                            </div>
                        )}
                        <div className="border-t border-gray-200 pt-6">
                            <h3 className="text-sm font-semibold text-gray-900 mb-3">QUANTITY</h3>
                            <div className="flex items-center space-x-4">
                                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition"><Minus size={16} /></button>
                                <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
                                <button onClick={() => setQuantity(Math.min(5, quantity + 1))} className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition"><Plus size={16} /></button>
                            </div>
                        </div>
                        <button onClick={isInCart ? () => setCurrentPage('cart') : () => addToCart(selectedProduct, quantity)} className="w-full bg-amber-700 text-white py-4 rounded-lg font-semibold hover:bg-amber-800 transition flex items-center justify-center space-x-2">
                            <ShoppingCart size={20} /><span>{isInCart ? 'Proceed to Cart' : 'Add to Cart'}</span>
                        </button>
                    </div>
                </div>
                <div className="border-t border-gray-200 pt-16">
                    <h2 className="text-3xl font-serif text-gray-900 mb-8 text-center">You Might Also Like</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {recommendations.map(product => (<ProductCard key={product.id} product={product} onClick={() => { setSelectedProduct(product); setSelectedImage(0); setQuantity(1); window.scrollTo(0, 0); }} />))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const CartPage = () => {
    const { cart, updateQuantity, removeFromCart, setCurrentPage } = useAppContext();
    const total = cart.reduce((sum, item) => sum + (item.discountedPrice * item.quantity), 0);
    if (cart.length === 0) return (<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-center"><h2 className="text-2xl font-serif text-gray-900 mb-4">Your Cart is Empty</h2><button onClick={() => setCurrentPage('home')} className="bg-amber-700 text-white px-6 py-3 rounded-lg hover:bg-amber-800 transition">Continue Shopping</button></div></div>);
    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-4xl mx-auto px-4">
                <h1 className="text-3xl font-serif text-gray-900 mb-8">Shopping Cart</h1>
                <div className="bg-white rounded-lg shadow-md divide-y">
                    {cart.map(item => (
                        <div key={item.id} className="p-6 flex items-center space-x-4">
                            <img src={item.images[0]} alt={item.name} className="w-24 h-24 object-cover rounded-lg" />
                            <div className="flex-1">
                                <h3 className="font-semibold text-gray-900">{item.name}</h3>
                                <p className="text-sm text-gray-600">{item.sub_category}</p>
                                <p className="text-lg font-bold text-gray-900 mt-1">₹{item.discountedPrice.toLocaleString()}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                                <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 border rounded hover:bg-gray-100"><Minus size={16} /></button>
                                <span className="w-8 text-center">{item.quantity}</span>
                                <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 border rounded hover:bg-gray-100"><Plus size={16} /></button>
                            </div>
                            <button onClick={() => removeFromCart(item.id)} className="text-red-600 hover:text-red-800"><X size={20} /></button>
                        </div>
                    ))}
                </div>
                <div className="mt-6 bg-white rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-xl font-semibold">Total:</span>
                        <span className="text-2xl font-bold text-amber-700">₹{total.toLocaleString()}</span>
                    </div>
                    <button onClick={() => setCurrentPage('checkout')} className="w-full bg-amber-700 text-white py-3 rounded-lg font-semibold hover:bg-amber-800 transition">Proceed to Checkout</button>
                </div>
            </div>
        </div>
    );
};
const CheckoutPage = () => {
    const { cart, clearCart, setCurrentPage, checkoutStep, setCheckoutStep } = useAppContext();
    const [formData, setFormData] = useState({ email: '', phone: '', name: '', street1: '', street2: '', pincode: '', country: 'India' });
    const [orderId] = useState(`ORD-${Date.now()}`);
    const total = cart.reduce((sum, item) => sum + (item.discountedPrice * item.quantity), 0);
    if (checkoutStep === 4) return (<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-center bg-white p-12 rounded-lg shadow-lg max-w-md"><div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"><Check size={32} className="text-green-600" /></div><h2 className="text-3xl font-serif text-gray-900 mb-4">Thank You!</h2><p className="text-gray-600 mb-2">Your order has been placed successfully</p><p className="text-lg font-semibold text-amber-700 mb-8">Order ID: {orderId}</p><button onClick={() => { setCurrentPage('home'); setCheckoutStep(1); }} className="bg-amber-700 text-white px-8 py-3 rounded-lg hover:bg-amber-800 transition">Continue Shopping</button></div></div>);
    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-3xl mx-auto px-4">
                <h1 className="text-3xl font-serif text-gray-900 mb-8">Checkout</h1>
                <div className="flex items-center justify-center mb-8">
                    {[1, 2, 3].map(step => (<React.Fragment key={step}><div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${checkoutStep >= step ? 'bg-amber-700 text-white' : 'bg-gray-200 text-gray-600'}`}>{step}</div>{step < 3 && <div className={`w-16 h-1 ${checkoutStep > step ? 'bg-amber-700' : 'bg-gray-200'}`} />}</React.Fragment>))}
                </div>
                <div className="bg-white rounded-lg shadow-md p-8">
                    {checkoutStep === 1 && (<div className="space-y-6"><h2 className="text-xl font-semibold mb-4">Contact Information</h2><div><label className="block text-sm font-medium text-gray-700 mb-2">Email</label><input type="email" name="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-amber-700 focus:border-transparent" required /></div><div><label className="block text-sm font-medium text-gray-700 mb-2">Phone</label><input type="tel" name="phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-amber-700 focus:border-transparent" required /></div><button onClick={() => setCheckoutStep(2)} disabled={!formData.email || !formData.phone} className="w-full bg-amber-700 text-white py-3 rounded-lg font-semibold hover:bg-amber-800 transition disabled:opacity-50 disabled:cursor-not-allowed">Continue to Shipping</button></div>)}
                    {checkoutStep === 2 && (<div className="space-y-6"><h2 className="text-xl font-semibold mb-4">Shipping Address</h2><div><label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label><input type="text" name="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-amber-700 focus:border-transparent" required /></div><div><label className="block text-sm font-medium text-gray-700 mb-2">Street Address 1</label><input type="text" name="street1" value={formData.street1} onChange={(e) => setFormData({ ...formData, street1: e.target.value })} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-amber-700 focus:border-transparent" required /></div><div><label className="block text-sm font-medium text-gray-700 mb-2">Street Address 2</label><input type="text" name="street2" value={formData.street2} onChange={(e) => setFormData({ ...formData, street2: e.target.value })} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-amber-700 focus:border-transparent" /></div><div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-gray-700 mb-2">Pincode</label><input type="text" name="pincode" value={formData.pincode} onChange={(e) => setFormData({ ...formData, pincode: e.target.value })} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-amber-700 focus:border-transparent" required /></div><div><label className="block text-sm font-medium text-gray-700 mb-2">Country</label><input type="text" name="country" value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-amber-700 focus:border-transparent" required /></div></div><div className="flex space-x-4"><button onClick={() => setCheckoutStep(1)} className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition">Back</button><button onClick={() => setCheckoutStep(3)} disabled={!formData.name || !formData.street1 || !formData.pincode} className="flex-1 bg-amber-700 text-white py-3 rounded-lg font-semibold hover:bg-amber-800 transition disabled:opacity-50 disabled:cursor-not-allowed">Review Order</button></div></div>)}
                    {checkoutStep === 3 && (<div className="space-y-6"><h2 className="text-xl font-semibold mb-4">Order Review</h2><div className="bg-gray-50 rounded-lg p-4 space-y-3"><h3 className="font-semibold text-gray-900">Contact Information</h3><p className="text-sm text-gray-600">Email: {formData.email}</p><p className="text-sm text-gray-600">Phone: {formData.phone}</p></div><div className="bg-gray-50 rounded-lg p-4 space-y-3"><h3 className="font-semibold text-gray-900">Shipping Address</h3><p className="text-sm text-gray-600">{formData.name}</p><p className="text-sm text-gray-600">{formData.street1}</p>{formData.street2 && <p className="text-sm text-gray-600">{formData.street2}</p>}<p className="text-sm text-gray-600"
{formData.pincode}, {formData.country}</p></div><div className="bg-gray-50 rounded-lg p-4 space-y-3"><h3 className="font-semibold text-gray-900 mb-3">Order Items</h3>{cart.map(item => (<div key={item.id} className="flex justify-between text-sm"><span className="text-gray-600">{item.name} x {item.quantity}</span><span className="font-semibold">₹{(item.discountedPrice * item.quantity).toLocaleString()}</span></div>))}<div className="border-t pt-3 flex justify-between font-bold text-lg"><span>Total:</span><span className="text-amber-700">₹{total.toLocaleString()}</span></div></div><div className="flex space-x-4"><button onClick={() => setCheckoutStep(2)} className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition">Back</button><button onClick={() => { clearCart(); setCheckoutStep(4); }} className="flex-1 bg-amber-700 text-white py-3 rounded-lg font-semibold hover:bg-amber-800 transition">Place Order</button></div></div>)}
</div>
</div>
</div>
);
};

const Footer = () => {
const { setCurrentPage } = useAppContext();
const currentYear = new Date().getFullYear();
return (
<footer className="bg-gray-900 text-gray-300 mt-16">
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
<div className="grid grid-cols-1 md:grid-cols-4 gap-8">
<div className="col-span-1 md:col-span-2">
<h3 className="text-2xl font-serif text-white mb-4">SĀRĪ LUXE</h3>
<p className="text-gray-400 mb-4">Discover timeless elegance with our curated collection of luxury sarees. Each piece is carefully selected to bring you the finest in traditional craftsmanship.</p>
<div className="flex space-x-4">
<a href="#" className="text-gray-400 hover:text-white transition"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg></a>
<a href="#" className="text-gray-400 hover:text-white transition"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg></a>
<a href="#" className="text-gray-400 hover:text-white transition"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/></svg></a>
</div>
</div>
<div>
<h4 className="text-white font-semibold mb-4">Quick Links</h4>
<ul className="space-y-2">
<li><button onClick={() => setCurrentPage('home')} className="hover:text-white transition">Collection</button></li>
<li><a href="#" className="hover:text-white transition">About Us</a></li>
<li><button onClick={() => setCurrentPage('cart')} className="hover:text-white transition">Shopping Cart</button></li>
<li><a href="#" className="hover:text-white transition">Contact</a></li>
</ul>
</div>
<div>
<h4 className="text-white font-semibold mb-4">Customer Service</h4>
<ul className="space-y-2">
<li><a href="#" className="hover:text-white transition">Contact Us</a></li>
<li><a href="#" className="hover:text-white transition">Shipping Policy</a></li>
<li><a href="#" className="hover:text-white transition">Returns & Exchanges</a></li>
<li><a href="#" className="hover:text-white transition">FAQs</a></li>
</ul>
</div>
</div>
<div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
<p className="text-gray-400 text-sm">© {currentYear} SĀRĪ LUXE. All rights reserved.</p>
<div className="flex space-x-6 mt-4 md:mt-0">
<a href="#" className="text-gray-400 hover:text-white text-sm transition">Privacy Policy</a>
<a href="#" className="text-gray-400 hover:text-white text-sm transition">Terms of Service</a>
<a href="#" className="text-gray-400 hover:text-white text-sm transition">Cookie Policy</a>
</div>
</div>
</div>
</footer>
);
};
const App = () => {
const { currentPage } = useAppContext();
return (<div className="min-h-screen bg-gray-50 flex flex-col"><Header /><main className="flex-grow">{currentPage === 'home' && <HomePage />}{currentPage === 'detail' && <ProductDetailPage />}{currentPage === 'cart' && <CartPage />}{currentPage === 'checkout' && <CheckoutPage />}</main><Footer /></div>);
};
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<React.StrictMode><AppProvider><App /></AppProvider></React.StrictMode>);
