
import { useState, useEffect } from "react";
import { PromoCodeDetails } from "@/types";
import AddPromoCodeForm from "./promo/AddPromoCodeForm";
import PromoCodeList from "./promo/PromoCodeList";
import { fetchPromoCodes, updatePromoCode, deletePromoCode } from "./promo/utils";

const AdminPromoCodes = () => {
  const [promoCodes, setPromoCodes] = useState<PromoCodeDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPromoCodes();
  }, []);
  
  const loadPromoCodes = async () => {
    setIsLoading(true);
    const data = await fetchPromoCodes();
    setPromoCodes(data);
    setIsLoading(false);
  };
  
  const handleUpdatePromo = async (id: string, updates: Partial<PromoCodeDetails>) => {
    const success = await updatePromoCode(id, updates);
    if (success) {
      await loadPromoCodes();
    }
  };
  
  const handleDeletePromo = async (id: string) => {
    const success = await deletePromoCode(id);
    if (success) {
      await loadPromoCodes();
    }
  };

  return (
    <>
      <AddPromoCodeForm onPromoAdded={loadPromoCodes} />
      
      <PromoCodeList 
        promoCodes={promoCodes}
        isLoading={isLoading}
        onUpdate={handleUpdatePromo}
        onDelete={handleDeletePromo}
        onRefresh={loadPromoCodes}
      />
    </>
  );
};

export default AdminPromoCodes;
