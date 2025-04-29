
import { useState, useRef } from "react";
import { Sandwich } from "../../../types";
import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Edit, Trash2, Save, X, Upload } from "lucide-react";

interface SandwichListItemProps {
  sandwich: Sandwich;
  editingId: string | null;
  isLoading: boolean;
  setEditingId: (id: string | null) => void;
  setSandwiches: React.Dispatch<React.SetStateAction<Sandwich[]>>;
  handleUpdateSandwich: (id: string) => Promise<void>;
  handleDeleteSandwich: (id: string) => Promise<void>;
  editSelectedFile: File | null;
  setEditSelectedFile: React.Dispatch<React.SetStateAction<File | null>>;
}

const SandwichListItem = ({
  sandwich,
  editingId,
  isLoading,
  setEditingId,
  setSandwiches,
  handleUpdateSandwich,
  handleDeleteSandwich,
  editSelectedFile,
  setEditSelectedFile
}: SandwichListItemProps) => {
  const editFileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setEditSelectedFile(event.target.files[0]);
    }
  };

  return (
    <TableRow className={editingId === sandwich.id ? "bg-blue-50" : ""}>
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
  );
};

export default SandwichListItem;
