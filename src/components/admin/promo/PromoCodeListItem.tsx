
import { useState } from "react";
import { PromoCodeDetails } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TableRow, TableCell } from "@/components/ui/table";
import { Edit, Trash2, Save, X } from "lucide-react";

interface PromoCodeListItemProps {
  promo: PromoCodeDetails;
  onUpdate: (id: string, updates: Partial<PromoCodeDetails>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  editingId: string | null;
  setEditingId: (id: string | null) => void;
  onCancelEdit: () => void;
}

const PromoCodeListItem = ({ 
  promo, 
  onUpdate, 
  onDelete, 
  editingId, 
  setEditingId,
  onCancelEdit
}: PromoCodeListItemProps) => {
  const isEditing = editingId === promo.id;

  return (
    <TableRow className={isEditing ? "bg-blue-50" : ""}>
      <TableCell className="font-medium">
        {isEditing ? (
          <Input
            value={promo.code}
            onChange={(e) => onUpdate(promo.id, { ...promo, code: e.target.value.toUpperCase() })}
          />
        ) : (
          promo.code
        )}
      </TableCell>
      <TableCell>
        {isEditing ? (
          <Input
            type="number"
            value={promo.discount}
            onChange={(e) => onUpdate(promo.id, { ...promo, discount: parseFloat(e.target.value) })}
            min="0"
            step="0.01"
          />
        ) : (
          `${promo.discount.toFixed(2)} €`
        )}
      </TableCell>
      <TableCell>
        {isEditing ? (
          <Input
            value={promo.delivery_address}
            onChange={(e) => onUpdate(promo.id, { ...promo, delivery_address: e.target.value })}
          />
        ) : (
          promo.delivery_address
        )}
      </TableCell>
      <TableCell>
        {isEditing ? (
          <Input
            value={promo.delivery_city}
            onChange={(e) => onUpdate(promo.id, { ...promo, delivery_city: e.target.value })}
          />
        ) : (
          promo.delivery_city
        )}
      </TableCell>
      <TableCell>
        {isEditing ? (
          <Input
            value={promo.delivery_zipcode}
            onChange={(e) => onUpdate(promo.id, { ...promo, delivery_zipcode: e.target.value })}
          />
        ) : (
          promo.delivery_zipcode
        )}
      </TableCell>
      <TableCell>
        {isEditing ? (
          <Button
            variant={promo.active ? "default" : "outline"}
            size="sm"
            onClick={() => onUpdate(promo.id, { ...promo, active: !promo.active })}
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
        {isEditing ? (
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={onCancelEdit}
            >
              <X className="h-4 w-4" />
            </Button>
            <Button
              variant="default"
              size="icon"
              onClick={() => {
                const updates = {
                  code: promo.code,
                  discount: promo.discount,
                  delivery_address: promo.delivery_address,
                  delivery_city: promo.delivery_city,
                  delivery_zipcode: promo.delivery_zipcode,
                  active: promo.active
                };
                onUpdate(promo.id, updates);
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
              onClick={() => onDelete(promo.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </TableCell>
    </TableRow>
  );
};

export default PromoCodeListItem;
