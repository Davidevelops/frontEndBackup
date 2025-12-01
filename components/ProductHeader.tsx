import { SingleProduct } from "@/lib/types";
import { PackageCheck, Calendar, ShoppingCart, MoreVertical } from "lucide-react";
import { ForecastDialog } from "./ForecastDialog";
import { EditProductDialog } from "./EditProductDialog";
import { DeleteProductDialog } from "./DeleteProductDialog";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface ProductHeaderProps {
  product: SingleProduct;
  hasEnoughSalesData: boolean;
  onForecastGenerated: () => void;
}

export function ProductHeader({ product, hasEnoughSalesData, onForecastGenerated }: ProductHeaderProps) {
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const router = useRouter();

  const handleViewSales = () => {
    router.push(`/dashboard/variantSales/${product.groupId}/variants/${product.id}/sales`);
  };

  return (
    <div className="bg-white rounded-xl p-8 border border-[#E2E8F0] mb-6">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          <div className="bg-[#1E293B] p-3 rounded-lg">
            <PackageCheck className="h-8 w-8 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl">PRODUCT NAME: </h1>
              <p className="text-xl font-bold text-gray-700">{product.name.toUpperCase()}</p>
            </div>
            <p className="text-[#64748B] text-xs mt-1 flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Last updated:{" "}
              {new Date(product.updatedAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleViewSales}
            className="flex items-center gap-2 bg-[#1E293B] hover:bg-[#0F172A] text-white px-4 py-2 rounded-lg font-bold transition-colors duration-200 shadow-sm hover:shadow-md text-xs justify-center"
          >
            <ShoppingCart className="h-4 w-4" />
            View Sales
          </button>

          <div className="flex items-center gap-2">
        
            <div className="hidden sm:flex items-center gap-2">
              <ForecastDialog 
                product={product}
                hasEnoughSalesData={hasEnoughSalesData}
                onForecastGenerated={onForecastGenerated}
              />
              <EditProductDialog product={product} />
              <DeleteProductDialog product={product} />
            </div>

            <div className="sm:hidden relative">
              <button
                onClick={() => setShowMoreMenu(!showMoreMenu)}
                className="p-2.5 text-gray-600 hover:bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
              >
                <MoreVertical className="h-5 w-5" />
              </button>
              
              {showMoreMenu && (
                <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                  <div className="px-4 py-2 border-b border-gray-100 text-xs font-semibold text-gray-500">
                    Product Actions
                  </div>
                  <div>
                    <div>
                      <ForecastDialog 
                        product={product}
                        hasEnoughSalesData={hasEnoughSalesData}
                        onForecastGenerated={onForecastGenerated}
                      />
                    </div>
                    <div>
                      <EditProductDialog product={product} />
                    </div>
                    <div>
                      <DeleteProductDialog product={product} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}