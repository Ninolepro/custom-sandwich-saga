
import { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Option {
  id: string;
  name: string;
  price: number;
  image?: string;
}

const CustomSandwichBuilder = () => {
  const { addToCart } = useCart();
  const [activeStep, setActiveStep] = useState(0);
  const [selectedBread, setSelectedBread] = useState<Option | null>(null);
  const [selectedProtein, setSelectedProtein] = useState<Option | null>(null);
  const [selectedVeggies, setSelectedVeggies] = useState<Option[]>([]);
  const [selectedSauces, setSelectedSauces] = useState<Option[]>([]);
  
  const [breadOptions, setBreadOptions] = useState<Option[]>([]);
  const [proteinOptions, setProteinOptions] = useState<Option[]>([]);
  const [veggieOptions, setVeggieOptions] = useState<Option[]>([]);
  const [sauceOptions, setSauceOptions] = useState<Option[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    fetchIngredients();
  }, []);

  const fetchIngredients = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('ingredients')
        .select('*')
        .order('name');

      if (error) {
        console.error("Erreur lors du chargement des ingrédients:", error);
        return;
      }

      if (data) {
        // Trier les ingrédients par type
        const breads = data.filter(item => item.type === 'bread').map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          image: item.image
        }));
        
        const proteins = data.filter(item => item.type === 'protein').map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          image: item.image
        }));
        
        const veggies = data.filter(item => item.type === 'veggie').map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          image: item.image
        }));
        
        const sauces = data.filter(item => item.type === 'sauce').map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          image: item.image
        }));
        
        setBreadOptions(breads);
        setProteinOptions(proteins);
        setVeggieOptions(veggies);
        setSauceOptions(sauces);
      }
    } catch (err) {
      console.error("Erreur:", err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const steps = [
    { title: "Pain", options: breadOptions, selection: selectedBread ? [selectedBread] : [] },
    { title: "Protéine", options: proteinOptions, selection: selectedProtein ? [selectedProtein] : [] },
    { title: "Crudités", options: veggieOptions, selection: selectedVeggies },
    { title: "Sauces", options: sauceOptions, selection: selectedSauces },
  ];
  
  const getTotalPrice = () => {
    const breadPrice = selectedBread?.price || 0;
    const proteinPrice = selectedProtein?.price || 0;
    const veggiesPrice = selectedVeggies.reduce((sum, item) => sum + item.price, 0);
    const saucesPrice = selectedSauces.reduce((sum, item) => sum + item.price, 0);
    
    return breadPrice + proteinPrice + veggiesPrice + saucesPrice;
  };
  
  const handleOptionSelect = (option: Option) => {
    switch (activeStep) {
      case 0:
        setSelectedBread(option);
        break;
      case 1:
        setSelectedProtein(option);
        break;
      case 2:
        setSelectedVeggies(prev => 
          prev.some(item => item.id === option.id)
            ? prev.filter(item => item.id !== option.id)
            : [...prev, option]
        );
        break;
      case 3:
        setSelectedSauces(prev => 
          prev.some(item => item.id === option.id)
            ? prev.filter(item => item.id !== option.id)
            : [...prev, option]
        );
        break;
    }
  };
  
  const isOptionSelected = (option: Option) => {
    switch (activeStep) {
      case 0:
        return selectedBread?.id === option.id;
      case 1:
        return selectedProtein?.id === option.id;
      case 2:
        return selectedVeggies.some(item => item.id === option.id);
      case 3:
        return selectedSauces.some(item => item.id === option.id);
      default:
        return false;
    }
  };
  
  const canProceed = () => {
    switch (activeStep) {
      case 0:
        return !!selectedBread;
      case 1:
        return !!selectedProtein;
      case 2:
        return selectedVeggies.length > 0;
      case 3:
        return true; // Sauces are optional
      default:
        return false;
    }
  };
  
  const nextStep = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
    } else {
      // Complete the sandwich building process
      const customSandwich = {
        id: `custom-${Date.now()}`,
        name: "Sandwich Personnalisé",
        description: `${selectedBread?.name} avec ${selectedProtein?.name}, ${selectedVeggies.map(v => v.name).join(", ")} et ${selectedSauces.length > 0 ? selectedSauces.map(s => s.name).join(", ") : "sans sauce"}`,
        price: getTotalPrice(),
        image: selectedProtein?.image || "/placeholder.svg",
        isCustom: true,
        ingredients: [
          selectedBread,
          selectedProtein,
          ...selectedVeggies,
          ...selectedSauces
        ].filter(Boolean),
        quantity: 1
      };
      
      addToCart(customSandwich);
      toast.success("Sandwich personnalisé ajouté au panier!", {
        description: "Vous pouvez modifier votre commande dans le panier."
      });
      
      // Reset the builder
      setSelectedBread(null);
      setSelectedProtein(null);
      setSelectedVeggies([]);
      setSelectedSauces([]);
      setActiveStep(0);
    }
  };
  
  const prevStep = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto flex justify-center items-center min-h-[400px]">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex flex-wrap mb-8 gap-2">
        {steps.map((step, index) => (
          <div
            key={step.title}
            className={`
              flex-1 min-w-[100px] py-3 px-4 rounded-lg text-center cursor-pointer transition-all
              ${index === activeStep 
                ? "bg-sandwich text-white font-medium shadow-sm" 
                : index < activeStep 
                  ? "bg-sandwich/20 text-sandwich-dark" 
                  : "bg-secondary text-muted-foreground"
              }
            `}
            onClick={() => {
              if (index < activeStep || canProceed()) {
                setActiveStep(index);
              }
            }}
          >
            <span className="text-sm sm:text-base">{step.title}</span>
          </div>
        ))}
      </div>
      
      <motion.div
        key={activeStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-muted/60"
      >
        <h2 className="text-xl font-medium mb-4">Choisissez votre {steps[activeStep].title}</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {steps[activeStep].options.map(option => (
            <div
              key={option.id}
              className={`
                relative rounded-xl p-4 cursor-pointer transition-all duration-300
                ${isOptionSelected(option) 
                  ? "border-2 border-sandwich bg-sandwich/5 shadow-sm" 
                  : "border border-muted hover:border-sandwich/20 hover:shadow-sm"
                }
              `}
              onClick={() => handleOptionSelect(option)}
            >
              <div className="aspect-square w-full mb-3 rounded-lg overflow-hidden">
                <img 
                  src={option.image || "/placeholder.svg"} 
                  alt={option.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <h3 className="font-medium">{option.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">+{option.price.toFixed(2)} €</p>
              
              {isOptionSelected(option) && (
                <div className="absolute top-2 right-2 bg-sandwich rounded-full p-1">
                  <Check className="h-4 w-4 text-white" />
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="mt-8 flex items-center justify-between">
          <button
            onClick={prevStep}
            className={`px-5 py-2.5 rounded-lg transition-all
              ${activeStep > 0 
                ? "bg-secondary text-foreground hover:bg-secondary/80" 
                : "bg-muted/50 text-muted-foreground cursor-not-allowed"
              }`
            }
            disabled={activeStep === 0}
          >
            Précédent
          </button>
          
          <div className="text-center">
            <div className="text-lg font-semibold">
              Total: {getTotalPrice().toFixed(2)} €
            </div>
            <div className="text-sm text-muted-foreground">
              {activeStep === steps.length - 1 ? "Finalisez votre sandwich" : `Étape ${activeStep + 1}/${steps.length}`}
            </div>
          </div>
          
          <button
            onClick={nextStep}
            className={`sandwich-button
              ${!canProceed() 
                ? "opacity-50 cursor-not-allowed" 
                : ""
              }`
            }
            disabled={!canProceed()}
          >
            {activeStep === steps.length - 1 ? "Ajouter au panier" : "Suivant"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default CustomSandwichBuilder;
