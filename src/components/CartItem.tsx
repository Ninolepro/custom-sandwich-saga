
import { Plus, Minus, Trash2 } from "lucide-react";
import { useCart } from "../context/CartContext";
import { motion } from "framer-motion";
import { CartItemType } from "../types";

interface CartItemProps {
  item: CartItemType;
}

const CartItem = ({ item }: CartItemProps) => {
  const { updateQuantity, removeFromCart } = useCart();

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col sm:flex-row items-start sm:items-center py-4 border-b border-muted"
    >
      <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden mb-4 sm:mb-0">
        <img
          src={item.image || "/placeholder.svg"}
          alt={item.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
      
      <div className="sm:ml-6 flex-grow">
        <h3 className="font-medium text-lg">{item.name}</h3>
        <p className="text-sm text-muted-foreground line-clamp-1">
          {item.description}
        </p>
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-2">
          <div className="flex items-center space-x-2 mb-4 sm:mb-0">
            <button
              onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
              className="rounded-full p-1 border border-muted hover:border-sandwich/20 transition-all"
              aria-label="Diminuer la quantité"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="font-medium text-center w-8">{item.quantity}</span>
            <button
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
              className="rounded-full p-1 border border-muted hover:border-sandwich/20 transition-all"
              aria-label="Augmenter la quantité"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          
          <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto sm:space-x-6">
            <span className="font-semibold">{(item.price * item.quantity).toFixed(2)} €</span>
            <button
              onClick={() => removeFromCart(item.id)}
              className="text-muted-foreground hover:text-destructive transition-colors"
              aria-label="Supprimer du panier"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CartItem;
