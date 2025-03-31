
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { PromoCodeDetails, UserRole } from "../types";
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
import { Search, Plus, Edit, Trash2, Save, X, Check } from "lucide-react";

const AdminPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [promoCodes, setPromoCodes] = useState<PromoCodeDetails[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newPromo, setNewPromo] = useState<Partial<PromoCodeDetails>>({
    code: "",
    discount: 0,
    delivery_address: "",
    delivery_city: "",
    delivery_zipcode: "",
    active: true
  });

  // Vérification de l'authentification et du rôle admin
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setIsAuthenticated(false);
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }
      
      setIsAuthenticated(true);
      
      // Vérifier si l'utilisateur est admin
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('role', 'admin')
        .single();
      
      if (error || !data) {
        setIsAdmin(false);
      } else {
        setIsAdmin(true);
        fetchPromoCodes();
      }
      
      setIsLoading(false);
    };
    
    checkAuth();
    
    // Configurer un listener d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      checkAuth();
    });
    
    return () => subscription.unsubscribe();
  }, []);
  
  const fetchPromoCodes = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('promo_codes')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      toast.error("Erreur lors du chargement des codes promo");
      console.error(error);
    } else {
      setPromoCodes(data || []);
    }
    setIsLoading(false);
  };
  
  const handleAddPromo = async () => {
    if (!newPromo.code || !newPromo.discount || !newPromo.delivery_address || 
        !newPromo.delivery_city || !newPromo.delivery_zipcode) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }
    
    const { data, error } = await supabase
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
    fetchPromoCodes();
    setNewPromo({
      code: "",
      discount: 0,
      delivery_address: "",
      delivery_city: "",
      delivery_zipcode: "",
      active: true
    });
  };
  
  const handleUpdatePromo = async (id: string, updates: Partial<PromoCodeDetails>) => {
    const { error } = await supabase
      .from('promo_codes')
      .update(updates)
      .eq('id', id);
    
    if (error) {
      toast.error("Erreur lors de la mise à jour du code promo");
      console.error(error);
      return;
    }
    
    toast.success("Code promo mis à jour avec succès");
    fetchPromoCodes();
    setEditingId(null);
  };
  
  const handleDeletePromo = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce code promo ?")) {
      return;
    }
    
    const { error } = await supabase
      .from('promo_codes')
      .delete()
      .eq('id', id);
    
    if (error) {
      toast.error("Erreur lors de la suppression du code promo");
      console.error(error);
      return;
    }
    
    toast.success("Code promo supprimé avec succès");
    fetchPromoCodes();
  };
  
  const filteredPromoCodes = promoCodes.filter(promo => 
    promo.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    promo.delivery_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    promo.delivery_city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-24 flex justify-center items-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-lg">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Accès Restreint</h1>
          <p className="mb-6">Veuillez vous connecter pour accéder à cette page.</p>
          <Button onClick={() => window.location.href = "/login"}>Se connecter</Button>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Accès Restreint</h1>
          <p className="mb-6">Cette page est réservée aux administrateurs.</p>
          <Button onClick={() => window.location.href = "/"}>Retour à l'accueil</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-transition container mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-10"
      >
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Administration des Codes Promo</h1>
        <p className="text-muted-foreground">Gérez les codes promo et leurs adresses de livraison associées</p>
      </motion.div>
      
      {/* Section Ajout de code promo */}
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
      
      {/* Liste des codes promo */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-muted/60">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h2 className="text-xl font-semibold">Codes promo existants</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Rechercher un code promo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full md:w-[300px]"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableCaption>Liste des codes promo disponibles</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Réduction</TableHead>
                <TableHead className="min-w-[200px]">Adresse de livraison</TableHead>
                <TableHead>Ville</TableHead>
                <TableHead>Code Postal</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPromoCodes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    {searchTerm ? "Aucun résultat trouvé" : "Aucun code promo disponible"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredPromoCodes.map((promo) => (
                  <TableRow key={promo.id} className={editingId === promo.id ? "bg-blue-50" : ""}>
                    <TableCell className="font-medium">
                      {editingId === promo.id ? (
                        <Input
                          value={promo.code}
                          onChange={(e) => setPromoCodes(codes => 
                            codes.map(c => c.id === promo.id ? {...c, code: e.target.value.toUpperCase()} : c)
                          )}
                        />
                      ) : (
                        promo.code
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === promo.id ? (
                        <Input
                          type="number"
                          value={promo.discount}
                          onChange={(e) => setPromoCodes(codes => 
                            codes.map(c => c.id === promo.id ? {...c, discount: parseFloat(e.target.value)} : c)
                          )}
                          min="0"
                          step="0.01"
                        />
                      ) : (
                        `${promo.discount.toFixed(2)} €`
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === promo.id ? (
                        <Input
                          value={promo.delivery_address}
                          onChange={(e) => setPromoCodes(codes => 
                            codes.map(c => c.id === promo.id ? {...c, delivery_address: e.target.value} : c)
                          )}
                        />
                      ) : (
                        promo.delivery_address
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === promo.id ? (
                        <Input
                          value={promo.delivery_city}
                          onChange={(e) => setPromoCodes(codes => 
                            codes.map(c => c.id === promo.id ? {...c, delivery_city: e.target.value} : c)
                          )}
                        />
                      ) : (
                        promo.delivery_city
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === promo.id ? (
                        <Input
                          value={promo.delivery_zipcode}
                          onChange={(e) => setPromoCodes(codes => 
                            codes.map(c => c.id === promo.id ? {...c, delivery_zipcode: e.target.value} : c)
                          )}
                        />
                      ) : (
                        promo.delivery_zipcode
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === promo.id ? (
                        <Button
                          variant={promo.active ? "default" : "outline"}
                          size="sm"
                          onClick={() => setPromoCodes(codes => 
                            codes.map(c => c.id === promo.id ? {...c, active: !c.active} : c)
                          )}
                        >
                          {promo.active ? "Actif" : "Inactif"}
                        </Button>
                      ) : (
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          promo.active 
                            ? "bg-green-100 text-green-800" 
                            : "bg-gray-100 text-gray-800"
                        }`}>
                          {promo.active ? "Actif" : "Inactif"}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {editingId === promo.id ? (
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              fetchPromoCodes();
                              setEditingId(null);
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="default"
                            size="icon"
                            onClick={() => {
                              const currentPromo = promoCodes.find(p => p.id === promo.id);
                              if (currentPromo) {
                                handleUpdatePromo(promo.id, {
                                  code: currentPromo.code,
                                  discount: currentPromo.discount,
                                  delivery_address: currentPromo.delivery_address,
                                  delivery_city: currentPromo.delivery_city,
                                  delivery_zipcode: currentPromo.delivery_zipcode,
                                  active: currentPromo.active
                                });
                              }
                            }}
                          >
                            <Save className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setEditingId(promo.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => handleDeletePromo(promo.id)}
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
    </div>
  );
};

export default AdminPage;
