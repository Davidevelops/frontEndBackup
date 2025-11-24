import { useState } from "react";
import { SingleProduct } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Trash2, X } from "lucide-react";
import { apiEndpoints } from "@/lib/apiEndpoints";
import axios from "axios";
import { useRouter } from "next/navigation";

interface DeleteProductDialogProps {
  product: SingleProduct;
}

export function DeleteProductDialog({ product }: DeleteProductDialogProps) {
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleDeleteProduct = async (id: string, groupId: string) => {
    try {
      await axios.delete(apiEndpoints.product(groupId, id), {
        withCredentials: true,
      });
      router.push("/dashboard/products");
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Failed to delete product:", error);
      alert("Error deleting product. Check console for details.");
    }
  };

  return (
    <Dialog
      open={isDeleteDialogOpen}
      onOpenChange={setIsDeleteDialogOpen}
    >
      <DialogTrigger asChild>
        <button className="flex items-center gap-2 text-[#DC2626] border border-[#DC2626] hover:bg-[#FEF2F2] px-4 py-2 rounded-lg font-semibold transition-all duration-200">
          <Trash2 className="h-5 w-5" />
          Delete Product
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-white border border-[#FECACA] rounded-xl">
        <DialogHeader className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="bg-[#FEF2F2] p-2 rounded-full">
              <Trash2 className="h-6 w-6 text-[#DC2626]" />
            </div>
            <DialogTitle className="text-xl font-bold text-[#0F172A]">
              Delete Product
            </DialogTitle>
          </div>
          <DialogDescription className="text-[#64748B] text-base">
            Are you sure you want to delete{" "}
            <strong>"{product.name}"</strong>? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-3 pt-4">
          <button
            onClick={() => setIsDeleteDialogOpen(false)}
            className="flex items-center gap-2 flex-1 justify-center border border-[#CBD5E1] text-[#334155] hover:bg-[#F8FAFC] px-4 py-2.5 rounded-lg font-medium transition-all duration-200"
          >
            <X className="h-4 w-4" />
            Cancel
          </button>
          <button
            onClick={() =>
              handleDeleteProduct(product.id, product.groupId)
            }
            className="flex items-center gap-2 flex-1 justify-center bg-[#DC2626] hover:bg-[#B91C1C] text-white px-4 py-2.5 rounded-lg font-medium transition-all duration-200"
          >
            <Trash2 className="h-4 w-4" />
            Delete Product
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}