
import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Drawer, 
  DrawerClose, 
  DrawerContent, 
  DrawerFooter, 
  DrawerHeader, 
  DrawerTitle 
} from "@/components/ui/drawer";

interface AddIngredientDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  refreshIngredients: () => Promise<void>;
}

const ingredientTypes = [
  { value: 'bread', label: 'Pain' },
  { value: 'protein', label: 'Protéine' },
  { value: 'veggie', label: 'Légume' },
  { value: 'sauce', label: 'Sauce' }
];

const AddIngredientDrawer = ({ isOpen, onOpenChange, refreshIngredients }: AddIngredientDrawerProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [newIngredient, setNewIngredient] = useState<{
    name: string;
    price: number;
    type: string;
    image: string;
  }>({
    name: "",
    price: 0,
    type: "",
    image: "/placeholder.svg"
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const uploadImage = async (file: File, ingredientName: string): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `ingredient-${ingredientName.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.${fileExt}`;
      
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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleAddIngredient = async () => {
    if (!newIngredient.name || !newIngredient.price || !newIngredient.type) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }
    
    setIsLoading(true);
    
    try {
      let imageUrl = newIngredient.image || "/placeholder.svg";
      
      if (selectedFile) {
        const uploadedUrl = await uploadImage(selectedFile, newIngredient.name);
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        }
      }
      
      const { data, error } = await supabase
        .from('ingredients')
        .insert([{
          name: newIngredient.name,
          price: Number(newIngredient.price),
          type: newIngredient.type,
          image: imageUrl
        }])
        .select();
      
      if (error) {
        toast.error("Erreur lors de l'ajout de l'ingrédient");
        console.error(error);
        return;
      }
      
      toast.success("Ingrédient ajouté avec succès");
      await refreshIngredients();
      setNewIngredient({
        name: "",
        price: 0,
        type: "",
        image: "/placeholder.svg"
      });
      setSelectedFile(null);
      onOpenChange(false);
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent>
        <div className="mx-auto w-full max-w-lg">
          <DrawerHeader>
            <DrawerTitle>Ajouter un nouvel ingrédient</DrawerTitle>
          </DrawerHeader>
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nom</label>
              <Input
                placeholder="Nom de l'ingrédient"
                value={newIngredient.name}
                onChange={(e) => setNewIngredient({...newIngredient, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Type d'ingrédient</label>
              <Select 
                value={newIngredient.type} 
                onValueChange={(value) => setNewIngredient({...newIngredient, type: value})}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sélectionner un type" />
                </SelectTrigger>
                <SelectContent>
                  {ingredientTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Prix (€)</label>
              <Input
                type="number"
                placeholder="0.50"
                min="0"
                step="0.01"
                value={newIngredient.price || ""}
                onChange={(e) => setNewIngredient({...newIngredient, price: parseFloat(e.target.value)})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Image</label>
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 h-24 w-24 rounded-md overflow-hidden border">
                  <img 
                    src={selectedFile ? URL.createObjectURL(selectedFile) : newIngredient.image} 
                    alt="Prévisualisation" 
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept="image/*" 
                    className="hidden" 
                  />
                  <Button 
                    variant="outline" 
                    onClick={() => fileInputRef.current?.click()}
                    className="mb-2"
                    type="button"
                  >
                    <Upload className="h-4 w-4 mr-2" /> 
                    {selectedFile ? "Changer l'image" : "Choisir une image"}
                  </Button>
                  {selectedFile && (
                    <p className="text-sm text-muted-foreground">
                      {selectedFile.name}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
          <DrawerFooter>
            <Button onClick={handleAddIngredient} disabled={isLoading}>
              {isLoading ? 'Chargement...' : 'Ajouter l\'ingrédient'}
            </Button>
            <DrawerClose asChild>
              <Button variant="outline">Annuler</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default AddIngredientDrawer;
