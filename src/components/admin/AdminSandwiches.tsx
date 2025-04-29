
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Sandwich } from "../../types";
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

// Imported components
import AddSandwichDrawer from "./sandwich/AddSandwichDrawer";
import SandwichListItem from "./sandwich/SandwichListItem";
import SearchBar from "./common/SearchBar";

const AdminSandwiches = () => {
  // State
  const [sandwiches, setSandwiches] = useState<Sandwich[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editSelectedFile, setEditSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    fetchSandwiches();
  }, []);
  
  const fetchSandwiches = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('sandwiches')
      .select('*')
      .order('name');
    
    if (error) {
      toast.error("Erreur lors du chargement des sandwichs");
      console.error(error);
    } else {
      const formattedData: Sandwich[] = (data || []).map(item => ({
        ...item,
        id: item.id,
        quantity: 1
      }));
      setSandwiches(formattedData);
    }
    setIsLoading(false);
  };

  const uploadImage = async (file: File, sandwichName: string): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${sandwichName.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('sandwich-images')
        .upload(filePath, file);
        
      if (uploadError) {
        toast.error("Erreur lors de l'upload de l'image");
        console.error(uploadError);
        return null;
      }
      
      const { data } = supabase.storage
        .from('sandwich-images')
        .getPublicUrl(filePath);
        
      return data.publicUrl;
    } catch (error) {
      console.error("Erreur d'upload:", error);
      return null;
    }
  };
  
  const handleUpdateSandwich = async (id: string) => {
    setIsLoading(true);
    
    try {
      const currentSandwich = sandwiches.find(s => s.id === id);
      if (!currentSandwich) return;
      
      let imageUrl = currentSandwich.image || "/placeholder.svg";
      
      if (editSelectedFile) {
        const uploadedUrl = await uploadImage(editSelectedFile, currentSandwich.name);
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        }
      }
      
      const { error } = await supabase
        .from('sandwiches')
        .update({
          name: currentSandwich.name,
          description: currentSandwich.description,
          price: Number(currentSandwich.price),
          image: imageUrl
        })
        .eq('id', id);
      
      if (error) {
        toast.error("Erreur lors de la mise à jour du sandwich");
        console.error(error);
        return;
      }
      
      toast.success("Sandwich mis à jour avec succès");
      fetchSandwiches();
      setEditingId(null);
      setEditSelectedFile(null);
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteSandwich = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce sandwich ?")) {
      return;
    }
    
    setIsLoading(true);
    
    const { error } = await supabase
      .from('sandwiches')
      .delete()
      .eq('id', id);
    
    if (error) {
      toast.error("Erreur lors de la suppression du sandwich");
      console.error(error);
    } else {
      toast.success("Sandwich supprimé avec succès");
      fetchSandwiches();
    }
    
    setIsLoading(false);
  };

  const filteredSandwiches = sandwiches.filter(sandwich => 
    sandwich.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sandwich.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-muted/60 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Gérer les sandwichs</h2>
          <Button onClick={() => setIsDrawerOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Ajouter un sandwich
          </Button>
        </div>
        
        <SearchBar 
          searchTerm={searchTerm} 
          setSearchTerm={setSearchTerm}
          placeholder="Rechercher un sandwich..." 
        />
        
        <div className="overflow-x-auto">
          <Table>
            <TableCaption>Liste des sandwichs disponibles</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Image</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Description</TableHead>
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
              ) : filteredSandwiches.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    {searchTerm ? "Aucun résultat trouvé" : "Aucun sandwich disponible"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredSandwiches.map((sandwich) => (
                  <SandwichListItem
                    key={sandwich.id}
                    sandwich={sandwich}
                    editingId={editingId}
                    isLoading={isLoading}
                    setEditingId={setEditingId}
                    setSandwiches={setSandwiches}
                    handleUpdateSandwich={handleUpdateSandwich}
                    handleDeleteSandwich={handleDeleteSandwich}
                    editSelectedFile={editSelectedFile}
                    setEditSelectedFile={setEditSelectedFile}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <AddSandwichDrawer
        isOpen={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        refreshSandwiches={fetchSandwiches}
      />
    </>
  );
};

export default AdminSandwiches;
