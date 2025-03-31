
import { useEffect } from "react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import CheckoutForm from "../components/CheckoutForm";

const CheckoutPage = () => {
  const { cart, promoDetails } = useCart();
  const navigate = useNavigate();
  
  const subtotal = cart.reduce(
    (total, item) => total + item.price * item.quantity, 
    0
  );
  
  const discount = promoDetails?.discount || 0;
  const shippingFee = subtotal > 15 ? 0 : 2.5;
  const totalAmount = Math.max(0, subtotal + shippingFee - discount);
  
  useEffect(() => {
    if (cart.length === 0) {
      navigate("/cart");
    }
  }, [cart, navigate]);

  return (
    <div className="page-transition container mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-16"
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          Finaliser votre commande
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Veuillez compléter vos informations de livraison pour finaliser votre commande.
        </p>
      </motion.div>
      
      <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-2/3">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-muted/60 mb-6">
            <h2 className="text-xl font-medium mb-6">Informations de livraison</h2>
            <CheckoutForm />
          </div>
        </div>
        
        <div className="w-full lg:w-1/3">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-muted/60 sticky top-24">
            <h2 className="text-xl font-medium mb-4">Résumé de commande</h2>
            
            <div className="space-y-4 mb-6 max-h-72 overflow-y-auto pr-2">
              {cart.map(item => (
                <div key={item.id} className="flex items-center space-x-3 py-2 border-b border-muted">
                  <div className="flex-shrink-0 w-12 h-12 rounded-md overflow-hidden">
                    <img 
                      src={item.image || "/placeholder.svg"} 
                      alt={item.name} 
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-medium text-sm">{item.name}</h3>
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">
                        {item.quantity} x {item.price.toFixed(2)} €
                      </span>
                      <span className="text-sm font-medium">
                        {(item.price * item.quantity).toFixed(2)} €
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="pt-4 border-t border-muted">
              <div className="flex justify-between mb-2">
                <span className="text-muted-foreground">Sous-total</span>
                <span>{subtotal.toFixed(2)} €</span>
              </div>
              
              {promoDetails && (
                <div className="flex justify-between mb-2 text-green-600">
                  <span>Réduction (Code: {promoDetails.code})</span>
                  <span>-{promoDetails.discount.toFixed(2)} €</span>
                </div>
              )}
              
              <div className="flex justify-between mb-4">
                <span className="text-muted-foreground">Frais de livraison</span>
                <span>{subtotal > 15 ? "Gratuit" : "2.50 €"}</span>
              </div>
              
              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span>{totalAmount.toFixed(2)} €</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
