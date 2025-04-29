
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Import components and utilities
import SearchBar from "@/components/admin/common/SearchBar";
import AddIngredientDrawer from "@/components/admin/ingredient/AddIngredientDrawer";
import IngredientListItem from "@/components/admin/ingredient/IngredientListItem";
import { ingredientTypes, getTypeLabel, uploadImage } from "@/components/admin/ingredient/utils";

interface Ingredient {
  id: string;
  name: string;
  price: number;
  type: string;
  image?: string;
  created_at: string;
  updated_at: string;
}

const AdminIngredients = () => {
  // State
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editSelectedFile, setEditSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    fetchIngredients();
  }, []);
  
  const fetchIngredients = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('ingredients')
      .select('*')
      .order('type')
      .order('name');
    
    if (error) {
      toast.error("Erreur lors du chargement des ingrédients");
      console.error(error);
    } else {
      setIngredients(data || []);
    }
    setIsLoading(false);
  };
  
  const handleUpdateIngredient = async (id: string) => {
    setIsLoading(true);
    
    try {
      const currentIngredient = ingredients.find(i => i.id === id);
      if (!currentIngredient) return;
      
      let imageUrl = currentIngredient.image || "/placeholder.svg";
      
      if (editSelectedFile) {
        const uploadedUrl = await uploadImage(editSelectedFile, currentIngredient.name, supabase);
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        }
      }
      
      const { error } = await supabase
        .from('ingredients')
        .update({
          name: currentIngredient.name,
          price: Number(currentIngredient.price),
          type: currentIngredient.type,
          image: imageUrl
        })
        .eq('id', id);
      
      if (error) {
        toast.error("Erreur lors de la mise à jour de l'ingrédient");
        console.error(error);
        return;
      }
      
      toast.success("Ingrédient mis à jour avec succès");
      fetchIngredients();
      setEditingId(null);
      setEditSelectedFile(null);
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteIngredient = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet ingrédient ?")) {
      return;
    }
    
    setIsLoading(true);
    
    const { error } = await supabase
      .from('ingredients')
      .delete()
      .eq('id', id);
    
    if (error) {
      toast.error("Erreur lors de la suppression de l'ingrédient");
      console.error(error);
    } else {
      toast.success("Ingrédient supprimé avec succès");
      fetchIngredients();
    }
    
    setIsLoading(false);
  };

  const filteredIngredients = ingredients.filter(ingredient => {
    const matchesSearch = ingredient.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !filterType || ingredient.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <>
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-muted/60 mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <h2 className="text-xl font-semibold">Gérer les ingrédients</h2>
          <Button onClick={() => setIsDrawerOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Ajouter un ingrédient
          </Button>
        </div>
        
        <SearchBar 
          searchTerm={searchTerm} 
          setSearchTerm={setSearchTerm} 
          placeholder="Rechercher un ingrédient..."
        />
        
        <div className="flex mb-6">
          <div className="w-full sm:w-[200px]">
            <Select 
              value={filterType} 
              onValueChange={setFilterType}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tous les types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tous les types</SelectItem>
                {ingredientTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableCaption>Liste des ingrédients disponibles</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Image</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Prix</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <div className="flex justify-center items-center">
                      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredIngredients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    {searchTerm || filterType ? "Aucun résultat trouvé" : "Aucun ingrédient disponible"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredIngredients.map((ingredient) => (
                  <IngredientListItem
                    key={ingredient.id}
                    ingredient={ingredient}
                    editingId={editingId}
                    isLoading={isLoading}
                    setEditingId={setEditingId}
                    setIngredients={setIngredients}
                    handleUpdateIngredient={handleUpdateIngredient}
                    handleDeleteIngredient={handleDeleteIngredient}
                    ingredientTypes={ingredientTypes}
                    getTypeLabel={getTypeLabel}
                    editSelectedFile={editSelectedFile}
                    setEditSelectedFile={setEditSelectedFile}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <AddIngredientDrawer
        isOpen={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        refreshIngredients={fetchIngredients}
      />
    </>
  );
};

export default AdminIngredients;
