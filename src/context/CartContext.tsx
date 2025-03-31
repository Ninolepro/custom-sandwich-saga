
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { CartContextType, CartItemType, Sandwich, OrderDetails, PromoCodeDetails } from "../types";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItemType[]>(() => {
    const savedCart = localStorage.getItem("sandwich-cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });
  
  const [promoCode, setPromoCode] = useState<string>(() => {
    const savedPromo = localStorage.getItem("sandwich-promo");
    return savedPromo || "";
  });
  
  const [promoDetails, setPromoDetails] = useState<PromoCodeDetails | null>(null);
  
  useEffect(() => {
    localStorage.setItem("sandwich-cart", JSON.stringify(cart));
  }, [cart]);
  
  useEffect(() => {
    localStorage.setItem("sandwich-promo", promoCode);
    if (promoCode) {
      applyPromoCode(promoCode);
    } else {
      // Si le promoCode est vide, on réinitialise aussi promoDetails
      setPromoDetails(null);
    }
  }, [promoCode]);
  
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
    setPromoCode("");
    setPromoDetails(null);
  };
  
  const removePromoCode = () => {
    setPromoCode("");
    setPromoDetails(null);
    localStorage.removeItem("sandwich-promo");
  };
  
  const applyPromoCode = async (code: string): Promise<boolean> => {
    if (!code) {
      setPromoDetails(null);
      return false;
    }
    
    try {
      const { data, error } = await supabase
        .from("promo_codes")
        .select("*")
        .eq("code", code)
        .eq("active", true)
        .single();
      
      if (error || !data) {
        toast.error("Code promo invalide ou expiré");
        setPromoDetails(null);
        return false;
      }
      
      setPromoDetails(data as PromoCodeDetails);
      toast.success(`Code promo appliqué : ${data.discount}€ de réduction!`);
      return true;
    } catch (error) {
      console.error("Erreur lors de l'application du code promo:", error);
      toast.error("Erreur lors de l'application du code promo");
      return false;
    }
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
      sendOrderNotification,
      promoCode,
      setPromoCode,
      promoDetails,
      applyPromoCode,
      removePromoCode
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
