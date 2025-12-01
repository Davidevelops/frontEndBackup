import { useState } from "react";
import { SingleProduct } from "@/lib/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { SquarePen, Settings, X, Copy, PackageCheck, Save } from "lucide-react";
import { apiEndpoints } from "@/lib/apiEndpoints";
import axios from "axios";
import { useRouter } from "next/navigation";

interface EditProductDialogProps {
  product: SingleProduct;
}

export function EditProductDialog({ product }: EditProductDialogProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);
  
  const defaultSettings = product.setting || {
    classification: "fast",
    serviceLevel: 90,
    fillRate: 90,
    safetyStockCalculationMethod: "dynamic",
  };

  const [formData, setFormData] = useState({
    name: product.name,
    safetyStock: product.safetyStock,
    stock: product.stock,
    setting: defaultSettings,
  });

  const handleInputChange = (
    field: string,
    value: any,
    nestedField?: string
  ) => {
    if (nestedField) {
      setFormData((prev) => ({
        ...prev,
        setting: {
          ...prev.setting,
          [nestedField]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(product.id);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  const handleSave = async (id: string, groupId: string) => {
    try {
      const updateData = {
        name: formData.name,
        safetyStock: formData.safetyStock,
        stock: formData.stock,
        setting: formData.setting,
      };

      await axios.patch(apiEndpoints.product(groupId, id), updateData, {
        withCredentials: true,
      });

      router.refresh();
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update product:", error);
    }
  };

  return (
    <AlertDialog open={isEditing} onOpenChange={setIsEditing}>
      <AlertDialogTrigger className="flex items-center gap-2 text-green-800 bg-green-100 hover:bg-green-200 px-2 py-2 rounded-lg font-semibold transition-all duration-200 text-xs">
        <SquarePen className="h-5 w-5" />
        Edit Product
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-md bg-white border border-[#E2E8F0] rounded-xl">
        <AlertDialogHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <AlertDialogTitle className="flex items-center gap-2 text-lg font-semibold text-[#0F172A]">
              <Settings className="h-5 w-5 text-[#1E293B]" />
              Edit Product
            </AlertDialogTitle>
            <AlertDialogCancel className="p-1.5 hover:bg-[#F1F5F9] rounded-lg">
              <X className="h-4 w-4" />
            </AlertDialogCancel>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-[#64748B] flex items-center justify-between">
                <span>Product ID</span>
                <button
                  type="button"
                  onClick={handleCopyId}
                  className="flex items-center gap-1 text-xs text-[#1E293B] hover:text-[#0F172A] transition-colors"
                >
                  <Copy className="h-3 w-3" />
                  {copyFeedback ? "Copied!" : "Copy"}
                </button>
              </label>
              <input
                type="text"
                value={product.id}
                readOnly
                className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg bg-[#F8FAFC] text-[#64748B] text-sm cursor-not-allowed"
              />
              <p className="text-xs text-[#94A3B8]">
                This ID is unique to this product and cannot be changed
              </p>
            </div>


            <div className="space-y-3">
              <h3 className="text-sm font-medium text-[#334155] flex items-center gap-2">
                <PackageCheck className="h-4 w-4 text-[#1E293B]" />
                Basic Information
              </h3>
              <label htmlFor="name" className="ms-1 text-sm font-semibold">Name:</label>
              <input
                type="text"
                value={formData.name.toUpperCase()}
                onChange={(e) =>
                  handleInputChange("name", e.target.value)
                }
                className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg focus:ring-2 focus:ring-[#1E293B] focus:border-transparent focus:outline-none text-sm"
              />

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  value={formData.stock}
                  onChange={(e) =>
                    handleInputChange(
                      "stock",
                      parseInt(e.target.value)
                    )
                  }
                  className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg focus:ring-2 focus:ring-[#1E293B] focus:border-transparent focus:outline-none text-sm"
                  placeholder="Stock"
                />
                <input
                  type="number"
                  value={formData.safetyStock}
                  onChange={(e) =>
                    handleInputChange(
                      "safetyStock",
                      parseInt(e.target.value)
                    )
                  }
                  className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg focus:ring-2 focus:ring-[#1E293B] focus:border-transparent focus:outline-none text-sm"
                  placeholder="Safety Stock"
                />
              </div>
            </div>
          </div>
        </AlertDialogHeader>

        <AlertDialogFooter className="flex gap-2 pt-4">
          <AlertDialogCancel className="flex-1 border border-[#CBD5E1] text-[#334155] hover:bg-[#F8FAFC] rounded-lg py-2.5">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => handleSave(product.id, product.groupId)}
            className="flex-1 bg-[#1E293B] hover:bg-[#0F172A] text-white rounded-lg py-2.5 font-semibold flex items-center justify-center gap-2"
          >
            <Save className="h-4 w-4" />
            Save Changes
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}