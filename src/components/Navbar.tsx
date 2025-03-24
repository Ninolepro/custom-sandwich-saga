
import { Link } from "react-router-dom";
import { ShoppingCart, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { cart } = useCart();
  
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${isScrolled ? 'glass shadow-sm' : 'bg-transparent'}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center">
              <span className="text-xl font-semibold text-sandwich-dark">SandwichGourmet</span>
            </Link>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-foreground hover:text-sandwich transition-colors">
              Nos Sandwichs
            </Link>
            <Link to="/custom" className="text-foreground hover:text-sandwich transition-colors">
              Composer
            </Link>
            <Link to="/cart" className="relative">
              <ShoppingCart className="h-6 w-6 text-foreground hover:text-sandwich transition-colors" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-sandwich text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-scale-in">
                  {totalItems}
                </span>
              )}
            </Link>
          </nav>
          
          <div className="md:hidden flex items-center">
            <Link to="/cart" className="relative mr-4">
              <ShoppingCart className="h-6 w-6 text-foreground" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-sandwich text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
            <button 
              onClick={() => setIsOpen(!isOpen)} 
              className="inline-flex items-center justify-center p-2 rounded-md text-foreground hover:text-sandwich"
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {isOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-sm animate-slide-down">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/"
              className="block px-3 py-2 rounded-md text-base font-medium text-foreground hover:bg-secondary"
              onClick={() => setIsOpen(false)}
            >
              Nos Sandwichs
            </Link>
            <Link
              to="/custom"
              className="block px-3 py-2 rounded-md text-base font-medium text-foreground hover:bg-secondary"
              onClick={() => setIsOpen(false)}
            >
              Composer
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
