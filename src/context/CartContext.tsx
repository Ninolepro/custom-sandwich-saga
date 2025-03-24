
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { CartContextType, CartItemType, Sandwich, OrderDetails } from "../types";
import { toast } from "sonner";

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItemType[]>(() => {
    const savedCart = localStorage.getItem("sandwich-cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });
  
  useEffect(() => {
    localStorage.setItem("sandwich-cart", JSON.stringify(cart));
  }, [cart]);
  
  const addToCart = (item: Sandwich) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === item.id);
      
      if (existingItem) {
        return prevCart.map(cartItem => 
          cartItem.id === item.id 
            ? { ...cartItem, quantity: cartItem.quantity + 1 } 
            : cartItem
        );
      } else {
        return [...prevCart, { ...item, quantity: 1 }];
      }
    });
  };
  
  const removeFromCart = (id: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== id));
  };
  
  const updateQuantity = (id: string, quantity: number) => {
    setCart(prevCart => 
      prevCart.map(item => 
        item.id === id ? { ...item, quantity } : item
      )
    );
  };
  
  const clearCart = () => {
    setCart([]);
  };
  
  const sendOrderNotification = async (orderDetails: OrderDetails): Promise<boolean> => {
    try {
      // Simulation d'un appel à une API pour envoyer une notification
      console.log("Envoi de la notification au préparateur:", orderDetails);
      
      // Dans un environnement de production, vous appelleriez ici votre API
      // Par exemple: await fetch('https://votre-api.com/notifications', {method: 'POST', body: JSON.stringify(orderDetails)})
      
      // Simulation d'attente pour une meilleure expérience utilisateur
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Notification envoyée au préparateur de sandwiches");
      return true;
    } catch (error) {
      console.error("Erreur lors de l'envoi de la notification:", error);
      toast.error("Échec de l'envoi de la notification au préparateur");
      return false;
    }
  };
  
  return (
    <CartContext.Provider value={{ 
      cart, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart,
      sendOrderNotification
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
