
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, ArrowLeft, Phone } from "lucide-react";

const ConfirmationPage = () => {
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState<any>(null);
  
  useEffect(() => {
    // Retrieve order details from localStorage
    const details = localStorage.getItem("orderDetails");
    if (!details) {
      navigate("/");
      return;
    }
    
    setOrderDetails(JSON.parse(details));
  }, [navigate]);

  if (!orderDetails) {
    return null;
  }
  
  const formattedDate = new Date(orderDetails.orderDate).toLocaleString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
  
  const expectedDelivery = new Date(new Date(orderDetails.orderDate).getTime() + 45 * 60000).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit"
  });

  return (
    <div className="page-transition container mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-10"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="h-20 w-20 rounded-full bg-sandwich/20 flex items-center justify-center mx-auto mb-4"
        >
          <CheckCircle className="h-12 w-12 text-sandwich" />
        </motion.div>
        
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          Commande confirmée!
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Merci pour votre commande! Un SMS de confirmation a été envoyé à votre numéro de téléphone.
        </p>
      </motion.div>
      
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-muted/60 mb-8">
          <div className="flex items-center mb-8">
            <div className="bg-secondary rounded-lg py-2 px-4 text-sm font-medium">
              N° de commande: #{Math.floor(Math.random() * 10000).toString().padStart(4, '0')}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground uppercase mb-2">Détails de livraison</h3>
              <div className="space-y-2">
                <p className="font-medium">
                  {orderDetails.customerInfo.firstName} {orderDetails.customerInfo.lastName}
                </p>
                <p>
                  {orderDetails.customerInfo.address}<br />
                  {orderDetails.customerInfo.zipCode} {orderDetails.customerInfo.city}
                </p>
                <p className="flex items-center">
                  <Phone className="h-4 w-4 mr-2" />
                  {orderDetails.customerInfo.phone}
                </p>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground uppercase mb-2">Informations</h3>
              <div className="space-y-2">
                <p>
                  <span className="text-muted-foreground">Date de commande:</span><br />
                  {formattedDate}
                </p>
                <p>
                  <span className="text-muted-foreground">Livraison estimée:</span><br />
                  Aujourd'hui, vers {expectedDelivery}
                </p>
                <p>
                  <span className="text-muted-foreground">Méthode de paiement:</span><br />
                  Carte bancaire
                </p>
              </div>
            </div>
          </div>
          
          <h3 className="text-sm font-medium text-muted-foreground uppercase mb-4">Détails de votre commande</h3>
          
          <div className="space-y-4 mb-8">
            {orderDetails.orderItems.map((item: any) => (
              <div key={item.id} className="flex items-center space-x-4 py-3 border-b border-muted">
                <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden">
                  <img 
                    src={item.image || "/placeholder.svg"} 
                    alt={item.name} 
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between">
                    <h3 className="font-medium">{item.name} <span className="text-muted-foreground">× {item.quantity}</span></h3>
                    <span className="font-medium">{(item.price * item.quantity).toFixed(2)} €</span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-1">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="border-t border-muted pt-4">
            <div className="flex justify-between mb-2">
              <span className="text-muted-foreground">Sous-total</span>
              <span>{orderDetails.orderTotal.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between mb-4">
              <span className="text-muted-foreground">Frais de livraison</span>
              <span>{orderDetails.orderTotal > 15 ? "Gratuit" : "2.50 €"}</span>
            </div>
            
            <div className="flex justify-between text-lg font-semibold">
              <span>Total</span>
              <span>{(orderDetails.orderTotal + (orderDetails.orderTotal > 15 ? 0 : 2.5)).toFixed(2)} €</span>
            </div>
          </div>
        </div>
        
        <div className="text-center">
          <Link to="/" className="inline-flex items-center text-sandwich hover:text-sandwich-dark">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationPage;
