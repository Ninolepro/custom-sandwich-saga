
import { useState, useRef } from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit, Trash2, Save, X, Upload } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface Ingredient {
  id: string;
  name: string;
  price: number;
  type: string;
  image?: string;
  created_at: string;
  updated_at: string;
}

interface IngredientListItemProps {
  ingredient: Ingredient;
  editingId: string | null;
  isLoading: boolean;
  setEditingId: (id: string | null) => void;
  setIngredients: React.Dispatch<React.SetStateAction<Ingredient[]>>;
  handleUpdateIngredient: (id: string) => Promise<void>;
  handleDeleteIngredient: (id: string) => Promise<void>;
  ingredientTypes: { value: string; label: string; }[];
  getTypeLabel: (type: string) => string;
  editSelectedFile: File | null;
  setEditSelectedFile: React.Dispatch<React.SetStateAction<File | null>>;
}

const IngredientListItem = ({
  ingredient,
  editingId,
  isLoading,
  setEditingId,
  setIngredients,
  handleUpdateIngredient,
  handleDeleteIngredient,
  ingredientTypes,
  getTypeLabel,
  editSelectedFile,
  setEditSelectedFile
}: IngredientListItemProps) => {
  const editFileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setEditSelectedFile(event.target.files[0]);
    }
  };
  
  return (
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
              onChange={handleFileChange} 
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
  );
};

export default IngredientListItem;
