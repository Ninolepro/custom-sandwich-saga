
import { motion } from "framer-motion";
import { useCart } from "../context/CartContext";
import { toast } from "sonner";
import { Sandwich } from "../types";

interface SandwichCardProps {
  sandwich: Sandwich;
}

const SandwichCard = ({ sandwich }: SandwichCardProps) => {
  const { addToCart } = useCart();
  
  const handleAddToCart = () => {
    addToCart(sandwich);
    toast.success(`${sandwich.name} ajouté au panier!`, {
      description: "Vous pouvez modifier votre commande dans le panier."
    });
  };

  return (
    <motion.div 
      className="sandwich-card hover-ring"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="aspect-square rounded-xl overflow-hidden mb-4">
        <img 
          src={sandwich.image || '/placeholder.svg'} 
          alt={sandwich.name} 
          className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
          loading="lazy"
        />
      </div>
      <h3 className="text-lg font-medium">{sandwich.name}</h3>
      <p className="text-sm text-muted-foreground mt-1 line-clamp-2 h-10">{sandwich.description}</p>
      <div className="flex items-center justify-between mt-4">
        <span className="text-lg font-semibold">{sandwich.price.toFixed(2)} €</span>
        <button 
          onClick={handleAddToCart}
          className="sandwich-button"
        >
          Ajouter
        </button>
      </div>
    </motion.div>
  );
};

export default SandwichCard;
