
import { useState } from "react";
import { useCart } from "../context/CartContext";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface Option {
  id: string;
  name: string;
  price: number;
  image?: string;
}

const breadOptions: Option[] = [
  { id: "baguette", name: "Baguette traditionnelle", price: 2.0, image: "/placeholder.svg" },
  { id: "ciabatta", name: "Ciabatta", price: 2.5, image: "/placeholder.svg" },
  { id: "complete", name: "Pain complet", price: 2.2, image: "/placeholder.svg" },
  { id: "cereales", name: "Pain aux céréales", price: 2.8, image: "/placeholder.svg" },
];

const proteinOptions: Option[] = [
  { id: "jambon", name: "Jambon blanc", price: 2.0, image: "/placeholder.svg" },
  { id: "poulet", name: "Poulet rôti", price: 2.5, image: "/placeholder.svg" },
  { id: "boeuf", name: "Rôti de bœuf", price: 3.0, image: "/placeholder.svg" },
  { id: "thon", name: "Thon mayonnaise", price: 2.5, image: "/placeholder.svg" },
  { id: "omelette", name: "Omelette", price: 2.0, image: "/placeholder.svg" },
];

const veggieOptions: Option[] = [
  { id: "salade", name: "Salade", price: 0.5, image: "/placeholder.svg" },
  { id: "tomate", name: "Tomate", price: 0.5, image: "/placeholder.svg" },
  { id: "concombre", name: "Concombre", price: 0.5, image: "/placeholder.svg" },
  { id: "oignon", name: "Oignon rouge", price: 0.3, image: "/placeholder.svg" },
  { id: "poivron", name: "Poivron", price: 0.5, image: "/placeholder.svg" },
  { id: "olive", name: "Olives", price: 0.6, image: "/placeholder.svg" },
];

const sauceOptions: Option[] = [
  { id: "mayonnaise", name: "Mayonnaise", price: 0.3, image: "/placeholder.svg" },
  { id: "moutarde", name: "Moutarde", price: 0.3, image: "/placeholder.svg" },
  { id: "ketchup", name: "Ketchup", price: 0.3, image: "/placeholder.svg" },
  { id: "bbq", name: "Sauce BBQ", price: 0.4, image: "/placeholder.svg" },
  { id: "andalouse", name: "Sauce Andalouse", price: 0.4, image: "/placeholder.svg" },
  { id: "aioli", name: "Aïoli", price: 0.5, image: "/placeholder.svg" },
];

const CustomSandwichBuilder = () => {
  const { addToCart } = useCart();
  const [activeStep, setActiveStep] = useState(0);
  const [selectedBread, setSelectedBread] = useState<Option | null>(null);
  const [selectedProtein, setSelectedProtein] = useState<Option | null>(null);
  const [selectedVeggies, setSelectedVeggies] = useState<Option[]>([]);
  const [selectedSauces, setSelectedSauces] = useState<Option[]>([]);
  
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
        image: "/placeholder.svg",
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
