
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PromoCodeDetails } from "@/types";

export const fetchPromoCodes = async (): Promise<PromoCodeDetails[]> => {
  const { data, error } = await supabase
    .from('promo_codes')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    toast.error("Erreur lors du chargement des codes promo");
    console.error(error);
    return [];
  }
  
  return data || [];
};

export const updatePromoCode = async (id: string, updates: Partial<PromoCodeDetails>): Promise<boolean> => {
  const { error } = await supabase
    .from('promo_codes')
    .update(updates)
    .eq('id', id);
  
  if (error) {
    toast.error("Erreur lors de la mise à jour du code promo");
    console.error(error);
    return false;
  }
  
  toast.success("Code promo mis à jour avec succès");
  return true;
};

export const deletePromoCode = async (id: string): Promise<boolean> => {
  if (!confirm("Êtes-vous sûr de vouloir supprimer ce code promo ?")) {
    return false;
  }
  
  const { error } = await supabase
    .from('promo_codes')
    .delete()
    .eq('id', id);
  
  if (error) {
    toast.error("Erreur lors de la suppression du code promo");
    console.error(error);
    return false;
  }
  
  toast.success("Code promo supprimé avec succès");
  return true;
};
