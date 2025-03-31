
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import SandwichCard from "../components/SandwichCard";
import { Sandwich } from "../types";
import { supabase } from "@/integrations/supabase/client";

const HomePage = () => {
  const [sandwiches, setSandwiches] = useState<Sandwich[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchSandwiches = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('sandwiches')
        .select('*')
        .order('name');
      
      if (error) {
        console.error("Erreur lors du chargement des sandwichs:", error);
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
    
    fetchSandwiches();
  }, []);

  return (
    <div className="page-transition container mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-16"
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          Nos Sandwichs Gourmet
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Découvrez notre sélection de sandwichs préparés avec des ingrédients frais et de qualité. 
          Chaque création est élaborée avec passion pour vous offrir une expérience gustative unique.
        </p>
      </motion.div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="sandwich-card animate-pulse">
              <div className="aspect-square bg-muted rounded-xl mb-4"></div>
              <div className="h-6 bg-muted rounded-md w-3/4 mb-3"></div>
              <div className="h-10 bg-muted rounded-md w-full mb-4"></div>
              <div className="flex items-center justify-between">
                <div className="h-6 bg-muted rounded-md w-1/4"></div>
                <div className="h-10 bg-muted rounded-md w-1/3"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {sandwiches.map(sandwich => (
            <SandwichCard key={sandwich.id} sandwich={sandwich} />
          ))}
        </div>
      )}
    </div>
  );
};

export default HomePage;
