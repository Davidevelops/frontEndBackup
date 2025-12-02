import { SingleProduct } from "@/lib/types";
import { 
  PackageCheck, 
  Calendar, 
  ShoppingCart, 
  MoreVertical, 
  ChevronRight 
} from "lucide-react";
import { ForecastDialog } from "./ForecastDialog";
import { EditProductDialog } from "./EditProductDialog";
import { DeleteProductDialog } from "./DeleteProductDialog";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface ProductHeaderProps {
  product: SingleProduct;
  groupName?: string;
  hasEnoughSalesData: boolean;
  onForecastGenerated: () => void;
}

export function ProductHeader({ 
  product, 
  groupName, 
  hasEnoughSalesData, 
  onForecastGenerated 
}: ProductHeaderProps) {
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const router = useRouter();

  const handleViewSales = () => {
    router.push(`/dashboard/variantSales/${product.groupId}/variants/${product.id}/sales`);
  };

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 mb-6">

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        

        <div className="flex items-start sm:items-center gap-4">

          <div className="bg-gray-800 p-3 rounded-lg flex-shrink-0">
            <PackageCheck className="h-7 w-7 text-white" />
          </div>

   
          <div className="space-y-1">
     
            <div className="flex flex-wrap items-center gap-2">
              {groupName ? (
                <>
                  <span className="text-sm font-medium text-gray-600">
                    Product Group:
                  </span>
                  <h1 className="text-sm font-semibold text-gray-700">
                    {groupName.toUpperCase()}
                  </h1>
                  <ChevronRight className="h-4 w-4 text-gray-400 mx-1" />
                  <span className="text-sm font-medium text-gray-600">
                    Variant:
                  </span>
                  <h2 className="text-sm font-bold text-gray-800">
                    {product.name.toUpperCase()}
                  </h2>
                </>
              ) : (
                <>
                  <span className="text-sm font-medium text-gray-600">
                    Variant:
                  </span>
                  <h2 className="text-sm font-bold text-gray-800">
                    {product.name.toUpperCase()}
                  </h2>
                </>
              )}
            </div>

     
            <p className="text-gray-500 text-xs flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Last updated: {new Date(product.updatedAt).toLocaleDateString()}
            </p>
          </div>
        </div>


        <div className="flex items-center gap-3 w-full sm:w-auto">
       
          <button
            onClick={handleViewSales}
            className="flex items-center gap-2 bg-gray-800 hover:bg-gray-900 text-white px-4 py-2.5 rounded-lg font-semibold transition-all duration-200 shadow-sm hover:shadow flex-1 sm:flex-none justify-center text-sm"
          >
            <ShoppingCart className="h-4 w-4" />
            View Sales
          </button>


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
              aria-label="More options"
            >
              <MoreVertical className="h-5 w-5" />
            </button>
            

            {showMoreMenu && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="px-4 py-2.5 border-b border-gray-100 text-xs font-semibold text-gray-500">
                  Product Actions
                </div>
                <div className="p-2 space-y-1">
                  <div className="w-full">
                    <ForecastDialog 
                      product={product}
                      hasEnoughSalesData={hasEnoughSalesData}
                      onForecastGenerated={onForecastGenerated}
                    />
                  </div>
                  <div className="w-full">
                    <EditProductDialog product={product} />
                  </div>
                  <div className="w-full">
                    <DeleteProductDialog product={product} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}