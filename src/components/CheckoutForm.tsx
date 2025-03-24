
import { useState } from "react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { CustomerInfo } from "../types";

const CheckoutForm = () => {
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CustomerInfo>({
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    city: "",
    zipCode: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate processing
    setTimeout(() => {
      // Store order details in local storage for confirmation page
      localStorage.setItem("orderDetails", JSON.stringify({
        customerInfo: formData,
        orderItems: cart,
        orderDate: new Date().toISOString(),
        orderTotal: cart.reduce((total, item) => total + item.price * item.quantity, 0),
      }));
      
      clearCart();
      setIsLoading(false);
      toast.success("Redirection vers la plateforme de paiement...");
      navigate("/payment");
    }, 1500);
  };

  return (
    <motion.div 
      className="w-full max-w-xl mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="firstName" className="text-sm font-medium">
              Prénom
            </label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              required
              value={formData.firstName}
              onChange={handleChange}
              className="w-full p-3 rounded-lg border border-input bg-background focus:ring-2 focus:ring-sandwich/30 transition-all"
              placeholder="Jean"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="lastName" className="text-sm font-medium">
              Nom
            </label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              required
              value={formData.lastName}
              onChange={handleChange}
              className="w-full p-3 rounded-lg border border-input bg-background focus:ring-2 focus:ring-sandwich/30 transition-all"
              placeholder="Dupont"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="phone" className="text-sm font-medium">
            Numéro de téléphone
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            required
            value={formData.phone}
            onChange={handleChange}
            className="w-full p-3 rounded-lg border border-input bg-background focus:ring-2 focus:ring-sandwich/30 transition-all"
            placeholder="06 12 34 56 78"
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="address" className="text-sm font-medium">
            Adresse de livraison
          </label>
          <input
            id="address"
            name="address"
            type="text"
            required
            value={formData.address}
            onChange={handleChange}
            className="w-full p-3 rounded-lg border border-input bg-background focus:ring-2 focus:ring-sandwich/30 transition-all"
            placeholder="123 rue du Sandwich"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="city" className="text-sm font-medium">
              Ville
            </label>
            <input
              id="city"
              name="city"
              type="text"
              required
              value={formData.city}
              onChange={handleChange}
              className="w-full p-3 rounded-lg border border-input bg-background focus:ring-2 focus:ring-sandwich/30 transition-all"
              placeholder="Paris"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="zipCode" className="text-sm font-medium">
              Code postal
            </label>
            <input
              id="zipCode"
              name="zipCode"
              type="text"
              required
              value={formData.zipCode}
              onChange={handleChange}
              className="w-full p-3 rounded-lg border border-input bg-background focus:ring-2 focus:ring-sandwich/30 transition-all"
              placeholder="75000"
            />
          </div>
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className="w-full sandwich-button py-3 mt-6 relative overflow-hidden group"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Traitement en cours...
            </span>
          ) : (
            <>
              <span className="group-hover:translate-y-[-100%] inline-block transition-transform duration-300">
                Procéder au paiement
              </span>
              <span className="absolute inset-0 flex items-center justify-center translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300">
                Continuer
              </span>
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
};

export default CheckoutForm;
