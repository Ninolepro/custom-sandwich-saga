
import { motion } from "framer-motion";
import CustomSandwichBuilder from "../components/CustomSandwichBuilder";

const CustomSandwichPage = () => {
  return (
    <div className="page-transition container mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-16"
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          Créez Votre Sandwich
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Composez votre sandwich idéal en choisissant parmi nos pains, protéines, 
          crudités et sauces. Laissez libre cours à votre créativité et à vos envies.
        </p>
      </motion.div>
      
      <CustomSandwichBuilder />
    </div>
  );
};

export default CustomSandwichPage;
