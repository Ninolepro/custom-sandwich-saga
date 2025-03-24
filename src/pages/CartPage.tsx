
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import CartItem from "../components/CartItem";
import { useCart } from "../context/CartContext";
import { ShoppingBag } from "lucide-react";

const CartPage = () => {
  const { cart, clearCart } = useCart();
  
  const totalAmount = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  return (
    <div className="page-transition container mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-16"
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          Votre Panier
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Vérifiez et modifiez votre commande avant de finaliser votre achat.
        </p>
      </motion.div>
      
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-muted/60">
          {cart.length === 0 ? (
            <div className="py-16 text-center">
              <ShoppingBag className="h-16 w-16 text-muted mx-auto mb-4" />
              <h2 className="text-xl font-medium mb-2">Votre panier est vide</h2>
              <p className="text-muted-foreground mb-6">Commencez à ajouter des sandwiches pour créer votre commande.</p>
              <Link to="/" className="sandwich-button inline-flex">
                Explorer nos sandwiches
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-4 flex justify-between items-center">
                <h2 className="text-xl font-medium">{cart.length} article{cart.length > 1 ? "s" : ""}</h2>
                <button
                  onClick={clearCart}
                  className="text-sm text-muted-foreground hover:text-sandwich underline"
                >
                  Vider le panier
                </button>
              </div>
              
              <div className="divide-y divide-muted">
                <AnimatePresence>
                  {cart.map(item => (
                    <CartItem key={item.id} item={item} />
                  ))}
                </AnimatePresence>
              </div>
              
              <div className="mt-8 pt-6 border-t border-muted">
                <div className="flex justify-between mb-2">
                  <span className="text-muted-foreground">Sous-total</span>
                  <span>{totalAmount.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between mb-4">
                  <span className="text-muted-foreground">Frais de livraison</span>
                  <span>{totalAmount > 15 ? "Gratuit" : "2.50 €"}</span>
                </div>
                
                <div className="flex justify-between text-lg font-semibold mb-6">
                  <span>Total</span>
                  <span>{(totalAmount + (totalAmount > 15 ? 0 : 2.5)).toFixed(2)} €</span>
                </div>
                
                <Link to="/checkout" className="block w-full">
                  <button className="w-full sandwich-button py-3 relative overflow-hidden group">
                    <span className="group-hover:translate-y-[-100%] inline-block transition-transform duration-300">
                      Passer commande
                    </span>
                    <span className="absolute inset-0 flex items-center justify-center translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300">
                      Finaliser
                    </span>
                  </button>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartPage;
