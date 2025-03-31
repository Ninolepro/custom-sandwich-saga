import { useState, useEffect, useRef } from "react";
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
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Upload, 
  Image 
} from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Drawer, DrawerClose, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";

interface Ingredient {
  id: string;
  name: string;
  price: number;
  type: string;
  image?: string;
  created_at: string;
  updated_at: string;
}

const ingredientTypes = [
  { value: 'bread', label: 'Pain' },
  { value: 'protein', label: 'Protéine' },
  { value: 'veggie', label: 'Légume' },
  { value: 'sauce', label: 'Sauce' }
];

const AdminIngredients = () => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newIngredient, setNewIngredient] = useState<Partial<Ingredient>>({
    name: "",
    price: 0,
    type: "",
    image: "/placeholder.svg"
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [editSelectedFile, setEditSelectedFile] = useState<File | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

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
      fetchIngredients();
      setNewIngredient({
        name: "",
        price: 0,
        type: "",
        image: "/placeholder.svg"
      });
      setSelectedFile(null);
      setIsDrawerOpen(false);
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleUpdateIngredient = async (id: string) => {
    setIsLoading(true);
    
    try {
      const currentIngredient = ingredients.find(i => i.id === id);
      if (!currentIngredient) return;
      
      let imageUrl = currentIngredient.image || "/placeholder.svg";
      
      if (editSelectedFile) {
        const uploadedUrl = await uploadImage(editSelectedFile, currentIngredient.name);
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
  
  const getTypeLabel = (type: string) => {
    const typeObj = ingredientTypes.find(t => t.value === type);
    return typeObj ? typeObj.label : type;
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, isEdit: boolean = false) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      if (isEdit) {
        setEditSelectedFile(file);
      } else {
        setSelectedFile(file);
      }
    }
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
          <div className="flex items-center gap-4">
            <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
              <DrawerTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Ajouter un ingrédient
                </Button>
              </DrawerTrigger>
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
                            onChange={(e) => handleFileChange(e)} 
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
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Rechercher un ingrédient..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
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
                  <TableRow key={ingredient.id} className={editingId === ingredient.id ? "bg-blue-50" : ""}>
                    <TableCell>
                      <div className="h-14 w-14 rounded overflow-hidden">
                        {editingId === ingredient.id && editSelectedFile ? (
                          <img 
                            src={URL.createObjectURL(editSelectedFile)} 
                            alt={ingredient.name} 
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <img 
                            src={ingredient.image || '/placeholder.svg'} 
                            alt={ingredient.name} 
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>
                      {editingId === ingredient.id && (
                        <div className="mt-2">
                          <input 
                            type="file" 
                            ref={editFileInputRef} 
                            onChange={(e) => handleFileChange(e, true)} 
                            accept="image/*" 
                            className="hidden" 
                          />
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => editFileInputRef.current?.click()}
                            type="button"
                          >
                            <Upload className="h-3 w-3 mr-1" /> 
                            {editSelectedFile ? "Changer" : "Modifier"}
                          </Button>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === ingredient.id ? (
                        <Input
                          value={ingredient.name}
                          onChange={(e) => setIngredients(items => 
                            items.map(i => i.id === ingredient.id ? {...i, name: e.target.value} : i)
                          )}
                        />
                      ) : (
                        ingredient.name
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === ingredient.id ? (
                        <Select 
                          value={ingredient.type} 
                          onValueChange={(value) => setIngredients(items => 
                            items.map(i => i.id === ingredient.id ? {...i, type: value} : i)
                          )}
                        >
                          <SelectTrigger className="max-w-[180px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ingredientTypes.map(type => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        getTypeLabel(ingredient.type)
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === ingredient.id ? (
                        <Input
                          type="number"
                          value={ingredient.price}
                          onChange={(e) => setIngredients(items => 
                            items.map(i => i.id === ingredient.id ? {...i, price: parseFloat(e.target.value)} : i)
                          )}
                          min="0"
                          step="0.01"
                          className="max-w-[100px]"
                        />
                      ) : (
                        `${ingredient.price.toFixed(2)} €`
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {editingId === ingredient.id ? (
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              fetchIngredients();
                              setEditingId(null);
                              setEditSelectedFile(null);
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="default"
                            size="icon"
                            onClick={() => handleUpdateIngredient(ingredient.id)}
                            disabled={isLoading}
                          >
                            <Save className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setEditingId(ingredient.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => handleDeleteIngredient(ingredient.id)}
                            disabled={isLoading}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
};

export default AdminIngredients;
