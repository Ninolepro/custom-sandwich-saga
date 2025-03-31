
import { useState, useEffect, useRef } from "react";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Search, Plus, Edit, Trash2, Save, X, Upload } from "lucide-react";
import { Drawer, DrawerClose, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";

const AdminSandwiches = () => {
  const [sandwiches, setSandwiches] = useState<Sandwich[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newSandwich, setNewSandwich] = useState<Partial<Sandwich>>({
    name: "",
    description: "",
    price: 0,
    image: "/placeholder.svg",
    quantity: 1
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [editSelectedFile, setEditSelectedFile] = useState<File | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

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
      // Convertir les données pour correspondre au type Sandwich
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
  
  const handleAddSandwich = async () => {
    if (!newSandwich.name || !newSandwich.description || !newSandwich.price) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }
    
    setIsLoading(true);
    
    try {
      let imageUrl = newSandwich.image || "/placeholder.svg";
      
      // Upload de l'image si une est sélectionnée
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
      fetchSandwiches();
      setNewSandwich({
        name: "",
        description: "",
        price: 0,
        image: "/placeholder.svg",
        quantity: 1
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
  
  const handleUpdateSandwich = async (id: string) => {
    setIsLoading(true);
    
    try {
      const currentSandwich = sandwiches.find(s => s.id === id);
      if (!currentSandwich) return;
      
      let imageUrl = currentSandwich.image || "/placeholder.svg";
      
      // Upload de l'image si une est sélectionnée
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
  
  const filteredSandwiches = sandwiches.filter(sandwich => 
    sandwich.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sandwich.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      {/* Section Ajout de sandwich */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-muted/60 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Gérer les sandwichs</h2>
          <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
            <DrawerTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Ajouter un sandwich
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <div className="mx-auto w-full max-w-lg">
                <DrawerHeader>
                  <DrawerTitle>Ajouter un nouveau sandwich</DrawerTitle>
                </DrawerHeader>
                <div className="p-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Nom</label>
                    <Input
                      placeholder="L'Américain"
                      value={newSandwich.name}
                      onChange={(e) => setNewSandwich({...newSandwich, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <Textarea
                      placeholder="Steak haché, cheddar, salade, tomate, oignon, sauce spéciale"
                      value={newSandwich.description}
                      onChange={(e) => setNewSandwich({...newSandwich, description: e.target.value})}
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Prix (€)</label>
                    <Input
                      type="number"
                      placeholder="8.50"
                      min="0"
                      step="0.01"
                      value={newSandwich.price || ""}
                      onChange={(e) => setNewSandwich({...newSandwich, price: parseFloat(e.target.value)})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Image</label>
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
        </div>
        
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Rechercher un sandwich..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
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
                  <TableRow key={sandwich.id} className={editingId === sandwich.id ? "bg-blue-50" : ""}>
                    <TableCell>
                      <div className="h-14 w-14 rounded overflow-hidden">
                        {editingId === sandwich.id && editSelectedFile ? (
                          <img 
                            src={URL.createObjectURL(editSelectedFile)} 
                            alt={sandwich.name} 
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <img 
                            src={sandwich.image || '/placeholder.svg'} 
                            alt={sandwich.name} 
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>
                      {editingId === sandwich.id && (
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
                      {editingId === sandwich.id ? (
                        <Input
                          value={sandwich.name}
                          onChange={(e) => setSandwiches(items => 
                            items.map(s => s.id === sandwich.id ? {...s, name: e.target.value} : s)
                          )}
                        />
                      ) : (
                        sandwich.name
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === sandwich.id ? (
                        <Textarea
                          value={sandwich.description}
                          onChange={(e) => setSandwiches(items => 
                            items.map(s => s.id === sandwich.id ? {...s, description: e.target.value} : s)
                          )}
                          className="min-h-[80px]"
                        />
                      ) : (
                        <div className="max-w-xs line-clamp-2">{sandwich.description}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === sandwich.id ? (
                        <Input
                          type="number"
                          value={sandwich.price}
                          onChange={(e) => setSandwiches(items => 
                            items.map(s => s.id === sandwich.id ? {...s, price: parseFloat(e.target.value)} : s)
                          )}
                          min="0"
                          step="0.01"
                          className="max-w-[100px]"
                        />
                      ) : (
                        `${sandwich.price.toFixed(2)} €`
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {editingId === sandwich.id ? (
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              fetchSandwiches();
                              setEditingId(null);
                              setEditSelectedFile(null);
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="default"
                            size="icon"
                            onClick={() => handleUpdateSandwich(sandwich.id)}
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
                            onClick={() => setEditingId(sandwich.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => handleDeleteSandwich(sandwich.id)}
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

export default AdminSandwiches;
