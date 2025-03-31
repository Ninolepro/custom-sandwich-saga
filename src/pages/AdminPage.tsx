
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { PromoCodeDetails, UserRole, Sandwich } from "../types";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminSandwiches from "@/components/admin/AdminSandwiches";
import AdminIngredients from "@/components/admin/AdminIngredients";
import AdminPromoCodes from "@/components/admin/AdminPromoCodes";

const AdminPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Administration</h1>
        <p className="text-muted-foreground">Gérez les codes promo, les sandwichs et les ingrédients</p>
      </motion.div>
      
      <Tabs defaultValue="promo_codes" className="space-y-6">
        <TabsList className="mb-8 w-full justify-start overflow-x-auto">
          <TabsTrigger value="promo_codes">Codes Promo</TabsTrigger>
          <TabsTrigger value="sandwiches">Sandwichs</TabsTrigger>
          <TabsTrigger value="ingredients">Ingrédients</TabsTrigger>
        </TabsList>
        
        <TabsContent value="promo_codes" className="mt-0">
          <AdminPromoCodes />
        </TabsContent>
        
        <TabsContent value="sandwiches" className="mt-0">
          <AdminSandwiches />
        </TabsContent>
        
        <TabsContent value="ingredients" className="mt-0">
          <AdminIngredients />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPage;
