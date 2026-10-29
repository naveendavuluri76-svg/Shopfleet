import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, useLocation, useParams, Router as WouterRouter, Link } from 'wouter';
import { ArrowDownRight, ArrowLeft, ArrowRight, BriefcaseBusiness, CarFront, Check, Cpu, Grid2X2, Heart, House, Minus, Plus, Search, ShoppingBag, Sparkles, UserRound, X, Shirt, Dumbbell, SlidersHorizontal, Menu, Star, Truck, ShieldCheck, RotateCcw, ChevronDown, Brush } from 'lucide-react';
import carMount from '@assets/generated_images/shopfleet-car-mount.jpg';
import inflator from '@assets/generated_images/shopfleet-inflator.jpg';
import kettle from '@assets/generated_images/shopfleet-kettle.jpg';
import organizer from '@assets/generated_images/shopfleet-organizer.jpg';
import earbuds from '@assets/generated_images/shopfleet-earbuds.jpg';
import laptopStand from '@assets/generated_images/shopfleet-stand.jpg';
import slingVisual from '@assets/generated_images/shopfleet-sling.jpg';
import bottle from '@assets/generated_images/shopfleet-bottle.jpg';
import promoBanner from '@assets/generated_images/shopfleet-promo-banner.jpg';
import hairDryer from '@assets/generated_images/shopfleet-hair-dryer.jpg';

const queryClient = new QueryClient();
type Category = 'Car Accessories' | 'Home & Kitchen' | 'Electronics' | 'Lifestyle' | 'Fashion' | 'Beauty & Personal Care' | 'Sports & Fitness';
type Product = { id: string; name: string; category: Category; price: number; compareAt: number; description: string; details: string; image: string; rating: number; badge: 'Best Seller' | 'New Arrival' | 'Everyday Find' };
type CartItem = { id: string; quantity: number };
const products: Product[] = [
  {
    id: 'rgb-gaming-phone-cooler',
    name: 'RGB Gaming Phone Cooler',
    category: 'Electronics',
    price: 699,
    compareAt: 899,
    description: 'RGB LED phone cooler with a digital temperature display for gaming.',
    details: 'Features RGB lighting and a digital temperature display. Check device compatibility and power requirements before ordering.',
    image: '/file_000000004c1c8211b70c4e6e33deeb24.png',
    rating: 4.5,
    badge: 'New Arrival',
  },
];
const productCategories = ['Electronics', 'Home & Kitchen', 'Car Accessories', 'Fashion', 'Beauty & Personal Care', 'Sports & Fitness'] as const;
const categoryIcons = {
  'Car Accessories': CarFront,
  'Home & Kitchen': House,
  Electronics: Cpu,
  Lifestyle: BriefcaseBusiness,
  Fashion: Shirt,
  'Beauty & Personal Care': Brush,
  'Sports & Fitness': Dumbbell,
} as const;
type StoreControls = {
  search: string;
  setSearch: (value: string) => void;
  activeCategory: string;
  setActiveCategory: (value: string) => void;
  onAccount: () => void;
  openCart: () => void;
  addToCart: (id: string) => void;
  view: string;
  setView: (value: string) => void;
};
const StoreControlsContext = createContext<StoreControls | null>(null);
const money = (value: number) => `₹${value.toFixed(2)}`;
const discount = (product: Product) => `${Math.round((1 - product.price / product.compareAt) * 100)}% OFF`;
const readStorage = <T,>(key: string, fallback: T): T => {
  try { const value = localStorage.getItem(key); return value ? JSON.parse(value) as T : fallback; } catch { return fallback; }
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <StoreRouter />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

function StoreRouter() {
  return (
    <RoutedErrorBoundary>
      <StoreShell>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/product/:id" component={ProductRoute} />
          <Route component={NotFound} />
        </Switch>
      </StoreShell>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function StoreShell({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(() => readStorage('shopfleet-cart', []));
  const [wishlist, setWishlist] = useState<string[]>(() => readStorage('shopfleet-wishlist', []));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState<'cart' | 'wishlist'>('cart');
  const [notice, setNotice] = useState('');
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('Everything');
  const [view, setView] = useState('All Products');
  const [categoryMenu, setCategoryMenu] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [location, setLocation] = useLocation();
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const detailedCart = cart.map((item) => ({ ...item, product: products.find((product) => product.id === item.id) })).filter((item) => item.product);
  const subtotal = detailedCart.reduce((sum, item) => sum + item.product!.price * item.quantity, 0);
  const savedProducts = wishlist.map((id) => products.find((product) => product.id === id)).filter((product): product is Product => Boolean(product));

  useEffect(() => { localStorage.setItem('shopfleet-cart', JSON.stringify(cart)); }, [cart]);
  useEffect(() => { localStorage.setItem('shopfleet-wishlist', JSON.stringify(wishlist)); }, [wishlist]);
  useEffect(() => {
    const syncCart = () => setCart(readStorage<CartItem[]>('shopfleet-cart', []));
    const syncWishlist = () => setWishlist(readStorage<string[]>('shopfleet-wishlist', []));
    window.addEventListener('shopfleet-cart-change', syncCart);
    window.addEventListener('shopfleet-wishlist-change', syncWishlist);
    return () => {
      window.removeEventListener('shopfleet-cart-change', syncCart);
      window.removeEventListener('shopfleet-wishlist-change', syncWishlist);
    };
  }, []);
  useEffect(() => {
    const product = products.find((item) => location === `/product/${item.id}`);
    const title = product ? `${product.name} | ShopFleet` : 'ShopFleet — Smart finds for everyday';
    const description = product ? product.description : 'Useful everyday finds across car accessories, home and kitchen, electronics, and lifestyle. ShopFleet prototype collection.';
    document.title = title;
    const setMeta = (selector: string, attr: string, value: string) => {
      let element = document.head.querySelector(selector);
      if (!element) { element = document.createElement('meta'); document.head.appendChild(element); }
      element.setAttribute(attr, value);
    };
    setMeta('meta[name="description"]', 'content', description);
    setMeta('meta[property="og:title"]', 'content', title);
    setMeta('meta[property="og:description"]', 'content', description);
    setMeta('meta[property="og:type"]', 'content', 'website');
    setMeta('meta[name="twitter:title"]', 'content', title);
    setMeta('meta[name="twitter:description"]', 'content', description);
  }, [location]);
  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(''), 2300);
    return () => window.clearTimeout(timer);
  }, [notice]);
  useEffect(() => {
    if (!drawerOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setDrawerOpen(false); };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [drawerOpen]);

  const addToCart = (id: string) => {
    setCart((current) => {
      const found = current.find((item) => item.id === id);
      return found ? current.map((item) => item.id === id ? { ...item, quantity: item.quantity + 1 } : item) : [...current, { id, quantity: 1 }];
    });
    const product = products.find((item) => item.id === id);
    setNotice(`${product?.name ?? 'Item'} added to cart`);
  };
  const changeQuantity = (id: string, amount: number) => setCart((current) => current.map((item) => item.id === id ? { ...item, quantity: item.quantity + amount } : item).filter((item) => item.quantity > 0));
  const removeFromCart = (id: string) => setCart((current) => current.filter((item) => item.id !== id));
  const toggleWishlist = (id: string) => {
    const saved = wishlist.includes(id);
    setWishlist((current) => saved ? current.filter((item) => item !== id) : [...current, id]);
    setNotice(saved ? 'Removed from wishlist' : 'Saved to wishlist');
  };
  const openDrawer = (tab: 'cart' | 'wishlist') => { setDrawerTab(tab); setDrawerOpen(true); };
  const onAccount = () => setNotice('Account features are not enabled in this prototype.');
  const updateSearch = (value: string) => {
    setSearch(value);
    if (location.startsWith('/product/')) setLocation('/');
  };
  const chooseView = (next: string) => {
    setView(next);
    setActiveCategory('Everything');
    setCategoryMenu(false);
    setMobileMenu(false);
    if (location !== '/') setLocation('/');
  };
  const chooseCategory = (category: string) => {
    setActiveCategory(category);
    setView('All Products');
    setCategoryMenu(false);
    setMobileMenu(false);
    if (location !== '/') setLocation('/');
  };
  const storeControls: StoreControls = { search, setSearch, activeCategory, setActiveCategory, onAccount, openCart: () => openDrawer('cart'), addToCart, view, setView: chooseView };

  return (
    <div className="store-shell">
      <div className="announcement" data-testid="text-store-notice">SHOPFLEET SAMPLE EDIT &nbsp;·&nbsp; PROTOTYPE PREVIEW — ITEMS ARE NOT FOR SALE</div>
      <header className="header">
        <Link href="/" className="brand" aria-label="ShopFleet home" data-testid="link-home"><span className="brand-mark">S</span>ShopFleet</Link>
        <label className="header-search search-box"><Search size={17} aria-hidden="true" /><input type="search" placeholder="Search sample finds" value={search} onChange={(event) => updateSearch(event.target.value)} aria-label="Search products" data-testid="input-product-search" /></label>
        <button className="mobile-menu-toggle" type="button" aria-label="Open category menu" aria-expanded={mobileMenu} onClick={() => setMobileMenu(!mobileMenu)} data-testid="button-mobile-menu"><Menu size={19} /></button>
        <nav className={`header-nav ${mobileMenu ? 'mobile-open' : ''}`} aria-label="Main navigation">
          <div className="all-category-wrap">
            <button type="button" className="nav-link category-menu-trigger" onClick={() => setCategoryMenu(!categoryMenu)} aria-expanded={categoryMenu} data-testid="button-all-categories"><Grid2X2 size={13} /> All Categories <ChevronDown size={12} /></button>
            {categoryMenu && <div className="category-menu" role="menu">
              <button type="button" role="menuitem" onClick={() => chooseCategory('Everything')} data-testid="menu-all-products">All Products</button>
              {productCategories.map((category) => <button type="button" role="menuitem" key={category} onClick={() => chooseCategory(category)} data-testid={`menu-category-${category.toLowerCase().replaceAll(' ', '-').replaceAll('&', 'and')}`}>{category}</button>)}
              <button type="button" role="menuitem" onClick={() => chooseCategory('Lifestyle')}>Lifestyle</button>
            </div>}
          </div>
          <button className="nav-link" type="button" onClick={() => chooseView('All Products')} data-testid="link-shop">Home</button>
          <button className="nav-link" type="button" onClick={() => chooseView('Best Sellers')} data-testid="link-best-sellers">Best Sellers</button>
          <button className="nav-link" type="button" onClick={() => chooseView('New Arrivals')} data-testid="link-new-arrivals">New Arrivals</button>
          <button className="nav-link" type="button" onClick={() => chooseView('Deals')} data-testid="link-deals">Deals</button>
          <a className="nav-link" href="#contact" onClick={() => setMobileMenu(false)} data-testid="link-contact">Contact</a>
          <div className="nav-actions">
            <button className="nav-action account-action" type="button" onClick={onAccount} aria-label="Account features are not enabled" data-testid="button-account"><UserRound size={16} /> Account</button>
            <button className="nav-action" type="button" onClick={() => openDrawer('wishlist')} aria-label={`Open wishlist, ${wishlist.length} items`} data-testid="button-open-wishlist"><Heart size={16} /> Wishlist <span className="count-dot">{wishlist.length}</span></button>
            <button className="nav-action" type="button" onClick={() => openDrawer('cart')} aria-label={`Open cart, ${cartCount} items`} data-testid="button-open-cart"><ShoppingBag size={16} /> Cart <span className="count-dot" data-testid="text-cart-count">{cartCount}</span></button>
          </div>
        </nav>
      </header>

      <StoreControlsContext.Provider value={storeControls}>
        {children}
      </StoreControlsContext.Provider>
      
      <nav className="mobile-bottom-nav" aria-label="Quick navigation">
        <Link href="/" className="mobile-nav-item" aria-label="Home" onClick={() => { setActiveCategory('Everything'); setView('All Products'); }} data-testid="mobile-link-home"><House size={18} /><span>Home</span></Link>
        <button className="mobile-nav-item" type="button" aria-label="Categories" onClick={() => setMobileMenu(!mobileMenu)} data-testid="mobile-link-categories"><Grid2X2 size={18} /><span>Categories</span></button>
        <button className="mobile-nav-item" type="button" onClick={() => openDrawer('cart')} aria-label={`Cart, ${cartCount} items`} data-testid="mobile-button-cart"><ShoppingBag size={18} /><span>Cart</span>{cartCount > 0 && <i>{cartCount}</i>}</button>
        <button className="mobile-nav-item" type="button" onClick={() => openDrawer('wishlist')} aria-label="Wishlist" data-testid="mobile-button-wishlist"><Heart size={18} /><span>Wishlist</span>{wishlist.length > 0 && <i>{wishlist.length}</i>}</button>
        <button className="mobile-nav-item" type="button" onClick={onAccount} aria-label="Account features are not enabled" data-testid="mobile-button-account"><UserRound size={18} /><span>Account</span></button>
      </nav>
      <footer className="footer" id="contact">
        <div><div className="footer-brand"><span className="brand-mark">S</span>ShopFleet</div><p>Good picks for the everyday miles.</p></div>
        <span>Prototype only · These samples are not for sale.</span>
        <span>No payment, delivery, returns, or real checkout services are provided.</span>
      </footer>
      <div className={`cart-overlay ${drawerOpen ? 'open' : ''}`} onClick={() => setDrawerOpen(false)} aria-hidden="true" />
      <aside className={`cart-drawer ${drawerOpen ? 'open' : ''}`} aria-label={drawerTab === 'cart' ? 'Shopping cart' : 'Wishlist'} aria-modal={drawerOpen} role="dialog" data-testid="panel-cart">
        <div className="drawer-head">
          <h2>{drawerTab === 'cart' ? 'Your cart' : 'Your wishlist'} <span className="eyebrow">({drawerTab === 'cart' ? cartCount : wishlist.length})</span></h2>
          <button className="icon-button" type="button" onClick={() => setDrawerOpen(false)} aria-label="Close panel" data-testid="button-close-drawer"><X size={18} /></button>
        </div>
        <div className="drawer-tabs" role="tablist" aria-label="Cart and wishlist">
          <button type="button" role="tab" aria-selected={drawerTab === 'cart'} className={`drawer-tab ${drawerTab === 'cart' ? 'active' : ''}`} onClick={() => setDrawerTab('cart')} data-testid="tab-cart"><ShoppingBag size={14} /> Cart <span>{cartCount}</span></button>
          <button type="button" role="tab" aria-selected={drawerTab === 'wishlist'} className={`drawer-tab ${drawerTab === 'wishlist' ? 'active' : ''}`} onClick={() => setDrawerTab('wishlist')} data-testid="tab-wishlist"><Heart size={14} /> Wishlist <span>{wishlist.length}</span></button>
        </div>
        {drawerTab === 'cart' ? <>
          {detailedCart.length ? <div className="drawer-items">
            {detailedCart.map(({ id, quantity, product }) => <div className="cart-row" key={id} data-testid={`row-cart-${id}`}>
              {product ? <img src={product.image} alt="" /> : null}
              <div><h3>{product!.name}</h3><span className="cart-row-price">{money(product!.price)} each</span>
                <div className="quantity" aria-label={`Quantity for ${product!.name}`}>
                  <button type="button" onClick={() => changeQuantity(id, -1)} aria-label={`Decrease ${product!.name} quantity`} data-testid={`button-decrease-${id}`}><Minus size={13} /></button>
                  <span data-testid={`text-quantity-${id}`}>{quantity}</span>
                  <button type="button" onClick={() => changeQuantity(id, 1)} aria-label={`Increase ${product!.name} quantity`} data-testid={`button-increase-${id}`}><Plus size={13} /></button>
                </div>
                <button type="button" className="remove-button" onClick={() => removeFromCart(id)} data-testid={`button-remove-${id}`}>Remove</button>
              </div>
              <span className="cart-row-price">{money(product!.price * quantity)}</span>
            </div>)}
          </div> : <div className="cart-empty" data-testid="text-cart-empty"><strong>Your cart is ready for a good find.</strong>Save a sample item here to see how the shop experience works.</div>}
          <div className="cart-summary">
            <div className="subtotal" data-testid="text-cart-subtotal"><span>Subtotal</span><strong>{money(subtotal)}</strong></div>
            <div className="demo-warning" role="status" data-testid="text-checkout-disclaimer">Prototype only. Sample products are not for sale. No payment or real checkout is implemented.</div>
            <button className="checkout-button" type="button" disabled data-testid="button-demo-checkout">Checkout unavailable in prototype</button>
          </div>
        </> : <>
          {savedProducts.length ? <div className="drawer-items">
            {savedProducts.map((product) => <div className="cart-row" key={product.id} data-testid={`row-wishlist-${product.id}`}>
              <Link href={`/product/${product.id}`} onClick={() => setDrawerOpen(false)}><img src={product.image} alt={product.name} /></Link>
              <div><h3>{product.name}</h3><span className="cart-row-price">{money(product.price)}</span>
                <button type="button" className="remove-button" onClick={() => addToCart(product.id)} data-testid={`button-wishlist-add-${product.id}`}>Add to cart</button>
              </div>
              <button type="button" className="remove-button" aria-label={`Remove ${product.name} from wishlist`} onClick={() => toggleWishlist(product.id)} data-testid={`button-wishlist-remove-${product.id}`}>Remove</button>
            </div>)}
          </div> : <div className="cart-empty" data-testid="text-wishlist-empty"><strong>Keep the good ones close.</strong>Tap the heart on a sample product and it will be saved here.</div>}
          <div className="cart-summary"><div className="demo-warning">Wishlist is saved on this device for this prototype. Sample items are not for sale.</div></div>
        </>}
      </aside>
      <div className={`toast ${notice ? 'visible' : ''}`} role="status" aria-live="polite" data-testid="status-store-notice">{notice}</div>
    </div>
  );
}

function Home() {
  const controls = useContext(StoreControlsContext);
  if (!controls) throw new Error('Store controls are unavailable.');
  const { activeCategory, setActiveCategory, search, view, setView, addToCart } = controls;
  const filteredProducts = useMemo(() => products.filter((product) => {
    const categoryMatch = activeCategory === 'Everything' || product.category === activeCategory || (activeCategory === 'Lifestyle' && ['daytrip-crossbody-sling', 'flexflow-steel-bottle'].includes(product.id));
    const viewMatch = view === 'All Products' || view === 'Deals' || (view === 'Best Sellers' && product.badge === 'Best Seller') || (view === 'New Arrivals' && product.badge === 'New Arrival');
    const query = search.trim().toLowerCase();
    return categoryMatch && viewMatch && (!query || `${product.name} ${product.category} ${product.description}`.toLowerCase().includes(query));
  }), [activeCategory, search, view]);
  const selectCategory = (category: string) => { setActiveCategory(category); setView('All Products'); };
  const sectionTitle = view === 'All Products' ? 'Best Deals' : view;
  return (
    <main>
      <section className="hero" aria-label="ShopFleet promotion">
        <div className="promo">
          <img className="promo-image" src={promoBanner} alt="ShopFleet's curated everyday essentials collection" data-testid="img-promo-banner" />
          <div className="promo-copy">
            <div className="eyebrow">Small upgrades. Better everyday.</div>
            <h1>Make room for <span>good finds.</span></h1>
            <p className="hero-copy">Useful picks for your car, your home, your setup, and everywhere in between.</p>
            <a className="button-primary" href="#shop" data-testid="button-browse-shop">Shop Now <ArrowDownRight size={16} /></a>
            <div className="trust-row"><span><Check size={13} /> Six sample categories</span><span><Sparkles size={13} /> Curated product discovery</span></div>
          </div>
        </div>
        <div className="prototype-note" role="note" data-testid="text-prototype-disclaimer"><Sparkles size={15} /><span><strong>Prototype storefront.</strong> These sample products are not for sale. No payment or real checkout is implemented.</span></div>
      </section>
      <section className="shop-section" id="shop">
        <div className="section-heading category-heading">
          <div><div className="eyebrow">Shop by category</div><h2>Trending Categories</h2><p className="section-subtitle">Explore practical sample finds for every day.</p></div>
        </div>
        <div className="category-filter" id="categories" role="group" aria-label="Filter products by category">
          <button type="button" className={`category-reset ${activeCategory === 'Everything' ? 'active' : ''}`} aria-pressed={activeCategory === 'Everything'} onClick={() => selectCategory('Everything')} data-testid="filter-category-everything"><Grid2X2 size={15} /> All Products</button>
          <div className="category-row">
          {productCategories.map((category) => {
            const CategoryIcon = categoryIcons[category];
            const count = products.filter((product) => product.category === category || (category === 'Sports & Fitness' && product.id === 'flexflow-steel-bottle')).length;
            return <button key={category} type="button" className={`category-card ${activeCategory === category ? 'active' : ''}`} aria-pressed={activeCategory === category} onClick={() => selectCategory(category)} data-testid={`filter-category-${category.toLowerCase().replaceAll(' ', '-').replaceAll('&', 'and')}`}><span className="category-card-icon"><CategoryIcon size={18} aria-hidden="true" /></span><span className="category-card-copy"><strong>{category}</strong><small>{count} sample {count === 1 ? 'find' : 'finds'}</small></span><ArrowRight className="category-card-arrow" size={15} aria-hidden="true" /></button>;
          })}
          </div>
        </div>
        <div className="section-heading deals-heading">
          <div><div className="eyebrow">The ShopFleet edit</div><h2>{sectionTitle}</h2><p className="section-subtitle">Sample prices and ratings are illustrative, for discovery only.</p></div>
          {view !== 'All Products' && <button className="category-reset" type="button" onClick={() => setView('All Products')} data-testid="button-clear-view"><SlidersHorizontal size={14} /> Show all products</button>}
        </div>
        <div className="product-grid" aria-live="polite" data-testid="list-products">
          {filteredProducts.length ? filteredProducts.map((product, index) => <ProductCard key={product.id} product={product} index={index} onAdd={() => addToCart(product.id)} />)
            : <div className="empty-results" data-testid="text-empty-results">No products found. Try a different search or category.</div>}
        </div>
      </section>
      <section className="category-story">
        <div className="story-panel"><div><div className="eyebrow">ShopFleet sample showcase</div><h2>MEGA SALE</h2><p>Browse sample finds with illustrative current and comparison prices. Products are for display only — ShopFleet is a prototype, not a live store.</p></div><a className="button-primary" href="#shop" onClick={() => { selectCategory('Everything'); setView('Deals'); }} data-testid="button-return-to-products">Explore sample deals <ArrowRight size={15} /></a></div>
      </section>
      <section className="trending-strip" aria-labelledby="trending-title">
        <div className="trending-title"><div className="eyebrow">A quick route in</div><h2 id="trending-title">Trending Categories</h2><p>Choose a collection to filter the sample catalog.</p></div>
        <div className="trending-cards">{productCategories.map((category) => {
          const product = products.find((item) => item.category === category);
          const CategoryIcon = categoryIcons[category];
          return <button className="trending-card" key={category} type="button" onClick={() => { selectCategory(category); document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' }); }} data-testid={`trending-${category.toLowerCase().replaceAll(' ', '-').replaceAll('&', 'and')}`}>{product ? <img src={product.image} alt="" loading="lazy" /> : null}<span><CategoryIcon size={13} />{category}</span></button>;
        })}</div>
      </section>
      <section className="service-row" aria-label="Prototype service information">
        <div><Truck size={20} /><span><strong>Delivery information</strong><small>No delivery service or timing is offered in this demo.</small></span></div>
        <div><ShieldCheck size={20} /><span><strong>Payment information</strong><small>No payments are collected or processed.</small></span></div>
        <div><RotateCcw size={20} /><span><strong>Returns information</strong><small>Returns are not available for sample listings.</small></span></div>
      </section>
    </main>
  );
}

function ProductCard({ product, index, onAdd }: { product: Product; index: number; onAdd: () => void }) {
  const [, setLocation] = useLocation();
  const [wishlist, setWishlist] = useState<string[]>(() => readStorage('shopfleet-wishlist', []));
  const saved = wishlist.includes(product.id);
  useEffect(() => {
    const syncWishlist = () => setWishlist(readStorage<string[]>('shopfleet-wishlist', []));
    window.addEventListener('shopfleet-wishlist-change', syncWishlist);
    return () => window.removeEventListener('shopfleet-wishlist-change', syncWishlist);
  }, []);
  const toggleWish = () => {
    const next = saved ? wishlist.filter((id) => id !== product.id) : [...wishlist, product.id];
    setWishlist(next);
    localStorage.setItem('shopfleet-wishlist', JSON.stringify(next));
    window.dispatchEvent(new CustomEvent('shopfleet-wishlist-change'));
  };
  return (
    <article className="product-card" style={{ animationDelay: `${index * 45}ms` }} data-testid={`card-product-${product.id}`}>
      <div className="product-art">
        <Link href={`/product/${product.id}`} className="product-art-link" aria-label={`View ${product.name}`} data-testid={`link-product-image-${product.id}`}><img src={product.image} alt={product.name} loading="lazy" data-testid={`img-product-${product.id}`} /></Link>
        <span className="discount-tag">{discount(product)}</span>
        <span className="product-badge">{product.badge}</span>
        <button className={`wish-on-card ${saved ? 'saved' : ''}`} type="button" aria-label={`${saved ? 'Remove from' : 'Add to'} wishlist: ${product.name}`} aria-pressed={saved} onClick={toggleWish} data-testid={`button-wishlist-${product.id}`}><Heart size={18} fill={saved ? 'currentColor' : 'none'} /></button>
      </div>
      <div className="product-info">
        <div><Link href={`/product/${product.id}`} className="product-title-link" data-testid={`link-product-title-${product.id}`}><h3 className="product-name" data-testid={`text-product-name-${product.id}`}>{product.name}</h3></Link><p className="product-category">{product.category}</p><p className="sample-rating" aria-label={`Sample rating ${product.rating} out of 5`} data-testid={`text-rating-${product.id}`}><Star size={11} fill="currentColor" /> {product.rating.toFixed(1)} <span>Sample rating</span></p><p className="product-desc">{product.description}</p></div>
        <div className="price-stack"><span className="sale-price" data-testid={`text-product-price-${product.id}`}>{money(product.price)}</span><span className="compare-price">{money(product.compareAt)}</span></div>
      </div>
      <div className="card-actions"><Link href={`/product/${product.id}`} className="detail-link" data-testid={`button-view-${product.id}`}>Details</Link><button className="add-button" type="button" onClick={onAdd} data-testid={`button-add-card-${product.id}`}>Add to Cart <Plus size={14} /></button></div>
    </article>
  );
}

function ProductRoute() {
  const params = useParams<{ id: string }>();
  const product = products.find((item) => item.id === params.id);
  if (!product) return <NotFound />;
  return <ProductDetail product={product} />;
}

function ProductDetail({ product }: { product: Product }) {
  const [saved, setSaved] = useState(() => readStorage<string[]>('shopfleet-wishlist', []).includes(product.id));
  const [notice, setNotice] = useState('');
  const [, setLocation] = useLocation();
  useEffect(() => {
    const onWishlist = () => setSaved(readStorage<string[]>('shopfleet-wishlist', []).includes(product.id));
    window.addEventListener('shopfleet-wishlist-change', onWishlist);
    return () => window.removeEventListener('shopfleet-wishlist-change', onWishlist);
  }, [product.id]);
  useEffect(() => { if (!notice) return; const timer = window.setTimeout(() => setNotice(''), 2200); return () => window.clearTimeout(timer); }, [notice]);
  const toggleWish = () => {
    const wishlist = readStorage<string[]>('shopfleet-wishlist', []);
    const next = wishlist.includes(product.id) ? wishlist.filter((id) => id !== product.id) : [...wishlist, product.id];
    localStorage.setItem('shopfleet-wishlist', JSON.stringify(next));
    window.dispatchEvent(new CustomEvent('shopfleet-wishlist-change'));
    setSaved(next.includes(product.id));
    setNotice(next.includes(product.id) ? 'Saved to wishlist' : 'Removed from wishlist');
  };
  const addCart = () => {
    const cart = readStorage<CartItem[]>('shopfleet-cart', []);
    const found = cart.find((item) => item.id === product.id);
    const next = found ? cart.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item) : [...cart, { id: product.id, quantity: 1 }];
    localStorage.setItem('shopfleet-cart', JSON.stringify(next));
    setNotice('Added to cart');
    window.dispatchEvent(new CustomEvent('shopfleet-cart-change'));
  };
  return (
    <main className="detail-wrap" data-testid={`page-product-${product.id}`}>
      <div className="breadcrumbs"><Link href="/" data-testid="link-back-to-shop">ShopFleet</Link><span>/</span><span>{product.category}</span></div>
      <div className="detail-layout">
        <img className="detail-image" src={product.image} alt={product.name} data-testid={`img-detail-${product.id}`} />
        <section className="detail-copy">
          <div className="eyebrow">{product.category}</div>
          <h1 data-testid={`text-detail-name-${product.id}`}>{product.name}</h1>
          <p className="product-desc">{product.description}</p>
          <div className="detail-price"><strong data-testid={`text-detail-price-${product.id}`}>{money(product.price)}</strong><del data-testid={`text-compare-price-${product.id}`}>{money(product.compareAt)}</del><span className="save-label" data-testid={`text-discount-${product.id}`}>{discount(product)}</span></div>
          <div className="detail-description" data-testid={`text-detail-description-${product.id}`}>{product.details}</div>
          <ul className="detail-bullets"><li><Check size={15} /> Useful by design, easy to make your own</li><li><Check size={15} /> A sample item in the ShopFleet prototype</li><li><Check size={15} /> Not for sale; no real checkout or payment</li></ul>
          <div className="detail-actions">
            <button className="detail-add" type="button" onClick={addCart} data-testid={`button-add-to-cart-${product.id}`}>Add to cart <Plus size={16} /></button>
            <button className={`detail-wish ${saved ? 'saved' : ''}`} type="button" onClick={toggleWish} aria-label={`${saved ? 'Remove from' : 'Add to'} wishlist`} aria-pressed={saved} data-testid={`button-detail-wishlist-${product.id}`}><Heart size={19} fill={saved ? 'currentColor' : 'none'} /></button>
          </div>
          <div className="demo-warning" role="note">Prototype preview only. This sample product is not for sale. No payment or real checkout is implemented.</div>
          <button className="button-outline" type="button" onClick={() => setLocation('/')} data-testid="button-back-to-shop"><ArrowLeft size={15} /> Back to collection</button>
        </section>
      </div>
      <div className={`toast ${notice ? 'visible' : ''}`} role="status" aria-live="polite" data-testid="status-product-notice">{notice}</div>
    </main>
  );
}

export default App;
