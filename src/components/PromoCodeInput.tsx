
import React, { useState } from "react";
import { useCart } from "../context/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const PromoCodeInput = () => {
  const { promoCode, applyPromoCode, setPromoCode, promoDetails } = useCart();
  const [inputCode, setInputCode] = useState(promoCode);
  const [isLoading, setIsLoading] = useState(false);

  const handleApplyPromo = async () => {
    if (!inputCode) {
      toast.error("Veuillez saisir un code promo");
      return;
    }

    setIsLoading(true);
    const success = await applyPromoCode(inputCode);
    if (success) {
      setPromoCode(inputCode);
    }
    setIsLoading(false);
  };

  const handleRemovePromo = () => {
    // Réinitialise le code promo dans le contexte du panier
    setPromoCode("");
    // Réinitialise également l'input local
    setInputCode("");
    toast.success("Code promo supprimé");
  };

  return (
    <div className="border border-dashed border-muted rounded-lg p-4 space-y-3">
      <p className="text-sm font-medium">Avez-vous un code promo?</p>

      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="PROMO2023"
          value={inputCode}
          onChange={(e) => setInputCode(e.target.value.toUpperCase())}
          className="flex-grow"
          disabled={isLoading || !!promoDetails}
        />
        {!promoDetails ? (
          <Button 
            onClick={handleApplyPromo} 
            disabled={isLoading || !inputCode}
            className="shrink-0"
          >
            {isLoading ? (
              <span className="flex items-center gap-1">
                <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-1"></span>
                Vérification...
              </span>
            ) : "Appliquer"}
          </Button>
        ) : (
          <Button 
            variant="outline" 
            className="shrink-0"
            onClick={handleRemovePromo}
          >
            Supprimer
          </Button>
        )}
      </div>

      {promoDetails && (
        <div className="bg-green-50 text-green-700 p-2 rounded-md text-sm animate-fade-in">
          <p className="font-medium">
            Code promo appliqué: {promoDetails.discount}€ de réduction
          </p>
        </div>
      )}
    </div>
  );
};

export default PromoCodeInput;
