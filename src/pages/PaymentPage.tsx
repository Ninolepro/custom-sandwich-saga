
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, CreditCard, LockIcon } from "lucide-react";

const PaymentPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  
  useEffect(() => {
    // Retrieve order details from localStorage
    const details = localStorage.getItem("orderDetails");
    if (!details) {
      navigate("/cart");
      return;
    }
    
    setOrderDetails(JSON.parse(details));
    
    // Simulate payment processing
    const timer1 = setTimeout(() => setStep(1), 2000);
    const timer2 = setTimeout(() => setStep(2), 4000);
    const timer3 = setTimeout(() => navigate("/confirmation"), 6000);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [navigate]);

  return (
    <div className="page-transition min-h-[80vh] container mx-auto px-4 py-16 flex flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white rounded-2xl p-8 shadow-sm border border-muted/60 text-center"
      >
        <div className="mb-8">
          {step === 0 && (
            <div className="flex flex-col items-center">
              <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                <CreditCard className="h-8 w-8 text-sandwich" />
              </div>
              <h2 className="text-xl font-medium mb-2">Traitement du paiement</h2>
              <p className="text-muted-foreground">Veuillez patienter pendant que nous traitons votre paiement...</p>
              <div className="h-1 w-full bg-muted mt-8 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-sandwich"
                  initial={{ width: "0%" }}
                  animate={{ width: "40%" }}
                  transition={{ duration: 2 }}
                />
              </div>
            </div>
          )}
          
          {step === 1 && (
            <div className="flex flex-col items-center">
              <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                <LockIcon className="h-8 w-8 text-sandwich" />
              </div>
              <h2 className="text-xl font-medium mb-2">Vérification en cours</h2>
              <p className="text-muted-foreground">Nous sécurisons votre transaction...</p>
              <div className="h-1 w-full bg-muted mt-8 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-sandwich"
                  initial={{ width: "40%" }}
                  animate={{ width: "80%" }}
                  transition={{ duration: 2 }}
                />
              </div>
            </div>
          )}
          
          {step === 2 && (
            <div className="flex flex-col items-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="h-16 w-16 rounded-full bg-sandwich/20 flex items-center justify-center mb-4"
              >
                <CheckCircle className="h-10 w-10 text-sandwich" />
              </motion.div>
              <h2 className="text-xl font-medium mb-2">Paiement approuvé</h2>
              <p className="text-muted-foreground">Votre commande a été confirmée!</p>
              <div className="h-1 w-full bg-muted mt-8 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-sandwich"
                  initial={{ width: "80%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2 }}
                />
              </div>
            </div>
          )}
        </div>
        
        <div className="text-sm text-muted-foreground bg-secondary rounded-lg p-3">
          <p className="mb-2">Vous êtes sur une page de simulation. Dans un environnement de production, vous seriez redirigé vers une plateforme de paiement sécurisée.</p>
          <p>Montant: {orderDetails ? `${(orderDetails.orderTotal + (orderDetails.orderTotal > 15 ? 0 : 2.5)).toFixed(2)} €` : "--,-- €"}</p>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentPage;
