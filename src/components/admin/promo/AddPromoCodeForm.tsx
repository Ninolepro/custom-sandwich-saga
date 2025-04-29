
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PromoCodeDetails } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";

interface AddPromoCodeFormProps {
  onPromoAdded: () => void;
}

const AddPromoCodeForm = ({ onPromoAdded }: AddPromoCodeFormProps) => {
  const [newPromo, setNewPromo] = useState<Partial<PromoCodeDetails>>({
    code: "",
    discount: 0,
    delivery_address: "",
    delivery_city: "",
    delivery_zipcode: "",
    active: true
  });

  const handleAddPromo = async () => {
    if (!newPromo.code || !newPromo.discount || !newPromo.delivery_address || 
        !newPromo.delivery_city || !newPromo.delivery_zipcode) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }
    
    const { error } = await supabase
      .from('promo_codes')
      .insert([{
        code: newPromo.code.toUpperCase(),
        discount: Number(newPromo.discount),
        delivery_address: newPromo.delivery_address,
        delivery_city: newPromo.delivery_city,
        delivery_zipcode: newPromo.delivery_zipcode,
        active: true
      }])
      .select();
    
    if (error) {
      toast.error("Erreur lors de l'ajout du code promo");
      console.error(error);
      return;
    }
    
    toast.success("Code promo ajouté avec succès");
    onPromoAdded();
    setNewPromo({
      code: "",
      discount: 0,
      delivery_address: "",
      delivery_city: "",
      delivery_zipcode: "",
      active: true
    });
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-muted/60 mb-8">
      <h2 className="text-xl font-semibold mb-4">Ajouter un nouveau code promo</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">Code</label>
          <Input
            placeholder="NOEL2023"
            value={newPromo.code}
            onChange={(e) => setNewPromo({...newPromo, code: e.target.value.toUpperCase()})}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Réduction (€)</label>
          <Input
            type="number"
            placeholder="10.00"
            min="0"
            step="0.01"
            value={newPromo.discount || ""}
            onChange={(e) => setNewPromo({...newPromo, discount: parseFloat(e.target.value)})}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Adresse de livraison</label>
          <Input
            placeholder="123 Rue du Commerce"
            value={newPromo.delivery_address}
            onChange={(e) => setNewPromo({...newPromo, delivery_address: e.target.value})}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Ville</label>
          <Input
            placeholder="Paris"
            value={newPromo.delivery_city}
            onChange={(e) => setNewPromo({...newPromo, delivery_city: e.target.value})}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Code Postal</label>
          <Input
            placeholder="75000"
            value={newPromo.delivery_zipcode}
            onChange={(e) => setNewPromo({...newPromo, delivery_zipcode: e.target.value})}
          />
        </div>
        <div className="flex items-end">
          <Button 
            className="w-full" 
            onClick={handleAddPromo}
          >
            <Plus className="mr-2 h-4 w-4" /> Ajouter
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddPromoCodeForm;
