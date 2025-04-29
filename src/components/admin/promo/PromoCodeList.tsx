
import { useState } from "react";
import { PromoCodeDetails } from "@/types";
import { Search } from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import PromoCodeListItem from "./PromoCodeListItem";
import SearchBar from "../common/SearchBar";

interface PromoCodeListProps {
  promoCodes: PromoCodeDetails[];
  isLoading: boolean;
  onUpdate: (id: string, updates: Partial<PromoCodeDetails>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onRefresh: () => Promise<void>;
}

const PromoCodeList = ({ 
  promoCodes, 
  isLoading, 
  onUpdate, 
  onDelete,
  onRefresh
}: PromoCodeListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleCancelEdit = async () => {
    await onRefresh();
    setEditingId(null);
  };

  const filteredPromoCodes = promoCodes.filter(promo => 
    promo.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    promo.delivery_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    promo.delivery_city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
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
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="flex justify-center items-center">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredPromoCodes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  {searchTerm ? "Aucun résultat trouvé" : "Aucun code promo disponible"}
                </TableCell>
              </TableRow>
            ) : (
              filteredPromoCodes.map((promo) => (
                <PromoCodeListItem
                  key={promo.id}
                  promo={promo}
                  onUpdate={onUpdate}
                  onDelete={onDelete}
                  editingId={editingId}
                  setEditingId={setEditingId}
                  onCancelEdit={handleCancelEdit}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default PromoCodeList;
