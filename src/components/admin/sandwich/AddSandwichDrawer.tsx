
import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Sandwich } from "../../../types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Upload } from "lucide-react";
import FormField from "../common/FormField";
import { 
  Drawer, 
  DrawerClose, 
  DrawerContent, 
  DrawerFooter, 
  DrawerHeader, 
  DrawerTitle 
} from "@/components/ui/drawer";

interface AddSandwichDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  refreshSandwiches: () => void;
}

const AddSandwichDrawer = ({ isOpen, onOpenChange, refreshSandwiches }: AddSandwichDrawerProps) => {
  const [newSandwich, setNewSandwich] = useState<Partial<Sandwich>>({
    name: "",
    description: "",
    price: 0,
    image: "/placeholder.svg",
    quantity: 1
  });
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleAddSandwich = async () => {
    if (!newSandwich.name || !newSandwich.description || !newSandwich.price) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }
    
    setIsLoading(true);
    
    try {
      let imageUrl = newSandwich.image || "/placeholder.svg";
      
      if (selectedFile) {
        const uploadedUrl = await uploadImage(selectedFile, newSandwich.name);
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        }
      }
      
      const { data, error } = await supabase
        .from('sandwiches')
        .insert([{
          name: newSandwich.name,
          description: newSandwich.description,
          price: Number(newSandwich.price),
          image: imageUrl
        }])
        .select();
      
      if (error) {
        toast.error("Erreur lors de l'ajout du sandwich");
        console.error(error);
        return;
      }
      
      toast.success("Sandwich ajouté avec succès");
      refreshSandwiches();
      setNewSandwich({
        name: "",
        description: "",
        price: 0,
        image: "/placeholder.svg",
        quantity: 1
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
            <DrawerTitle>Ajouter un nouveau sandwich</DrawerTitle>
          </DrawerHeader>
          <div className="p-4 space-y-4">
            <FormField label="Nom" required>
              <Input
                placeholder="L'Américain"
                value={newSandwich.name}
                onChange={(e) => setNewSandwich({...newSandwich, name: e.target.value})}
              />
            </FormField>
            
            <FormField label="Description" required>
              <Textarea
                placeholder="Steak haché, cheddar, salade, tomate, oignon, sauce spéciale"
                value={newSandwich.description}
                onChange={(e) => setNewSandwich({...newSandwich, description: e.target.value})}
                rows={3}
              />
            </FormField>
            
            <FormField label="Prix (€)" required>
              <Input
                type="number"
                placeholder="8.50"
                min="0"
                step="0.01"
                value={newSandwich.price || ""}
                onChange={(e) => setNewSandwich({...newSandwich, price: parseFloat(e.target.value)})}
              />
            </FormField>
            
            <FormField label="Image">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 h-24 w-24 rounded-md overflow-hidden border">
                  <img 
                    src={selectedFile ? URL.createObjectURL(selectedFile) : newSandwich.image} 
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
            </FormField>
          </div>
          <DrawerFooter>
            <Button onClick={handleAddSandwich} disabled={isLoading}>
              {isLoading ? 'Chargement...' : 'Ajouter le sandwich'}
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

export default AddSandwichDrawer;
