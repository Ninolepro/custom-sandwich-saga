
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { OrderDetails } from "../types";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

const ConfirmationPage = () => {
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  
  useEffect(() => {
    const storedOrderDetails = localStorage.getItem("orderDetails");
    
    if (!storedOrderDetails) {
      navigate("/");
      return;
    }
    
    try {
      setOrderDetails(JSON.parse(storedOrderDetails));
    } catch (e) {
      console.error("Error parsing order details:", e);
      navigate("/");
    }
  }, [navigate]);
  
  if (!orderDetails) {
    return null;
  }
  
  return (
    <div className="page-transition container mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-10 text-center"
      >
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-green-100 p-3 w-24 h-24 flex items-center justify-center">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-12 w-12 text-green-600" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path 
                fillRule="evenodd" 
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                clipRule="evenodd" 
              />
            </svg>
          </div>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          Commande Confirmée
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Votre commande a été confirmée et est en cours de préparation. Vous recevrez bientôt une notification de suivi.
        </p>
      </motion.div>
      
      <div className="max-w-4xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8 mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-muted/60"
          >
            <h3 className="font-semibold text-lg mb-4">Détails de la commande</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date</span>
                <span>{new Date(orderDetails.orderDate).toLocaleDateString()}</span>
              </div>
              
              {orderDetails.promoCode && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Code Promo</span>
                  <span className="font-medium">{orderDetails.promoCode}</span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total</span>
                <span className="font-semibold">{orderDetails.orderTotal.toFixed(2)} €</span>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-muted/60"
          >
            <h3 className="font-semibold text-lg mb-4">Informations de livraison</h3>
            <div className="space-y-2">
              <div>
                <p className="font-medium">
                  {orderDetails.customerInfo.firstName} {orderDetails.customerInfo.lastName}
                </p>
                <p>{orderDetails.customerInfo.phone}</p>
              </div>
              <div className="pt-2">
                <p>{orderDetails.customerInfo.address}</p>
                <p>{orderDetails.customerInfo.city}, {orderDetails.customerInfo.zipCode}</p>
              </div>
            </div>
          </motion.div>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-muted/60 mb-10"
        >
          <h3 className="font-semibold text-lg mb-4">Résumé de la commande</h3>
          
          <Table>
            <TableCaption>Récapitulatif des articles commandés</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Produit</TableHead>
                <TableHead className="text-right">Prix</TableHead>
                <TableHead className="text-right">Quantité</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orderDetails.orderItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="text-right">{item.price.toFixed(2)} €</TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">{(item.price * item.quantity).toFixed(2)} €</TableCell>
                </TableRow>
              ))}
              
              {orderDetails.discount && orderDetails.discount > 0 && (
                <TableRow>
                  <TableCell className="font-medium text-green-600">Réduction</TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                  <TableCell className="text-right text-green-600">-{orderDetails.discount.toFixed(2)} €</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </motion.div>
        
        <div className="text-center">
          <Link 
            to="/" 
            className="sandwich-button px-6 py-3 inline-block"
          >
            Retour à la page d'accueil
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationPage;
