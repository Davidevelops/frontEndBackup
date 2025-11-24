import { SingleProduct } from "@/lib/types";
import { PackageCheck, Calendar, ShoppingCart, ChartLine, SquarePen, Trash2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { ForecastDialog } from "./ForecastDialog";
import { EditProductDialog } from "./EditProductDialog";
import { DeleteProductDialog } from "./DeleteProductDialog";
interface ProductHeaderProps {
  product: SingleProduct;
  hasEnoughSalesData: boolean;
  onForecastGenerated: () => void;
}

export function ProductHeader({ product, hasEnoughSalesData, onForecastGenerated }: ProductHeaderProps) {
  return (
    <div className="bg-white rounded-xl p-6 border border-[#E2E8F0] mb-6">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          <div className="bg-[#1E293B] p-3 rounded-lg">
            <PackageCheck className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[#0F172A]">
              {product.name}
            </h1>
            <p className="text-[#64748B] mt-1 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Last updated:{" "}
              {new Date(product.updatedAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Sales Button */}
          <Link
            href={`/dashboard/variantSales/${product.groupId}/variants/${product.id}/sales`}
          >
            <button className="flex items-center gap-2 bg-[#1E293B] hover:bg-[#0F172A] text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200">
              <ShoppingCart className="h-5 w-5" />
              View Sales
            </button>
          </Link>

          {/* Forecast Button */}
          <ForecastDialog 
            product={product}
            hasEnoughSalesData={hasEnoughSalesData}
            onForecastGenerated={onForecastGenerated}
          />

          {/* Edit Button */}
          <EditProductDialog product={product} />

          {/* Delete Button */}
          <DeleteProductDialog product={product} />
        </div>
      </div>
    </div>
  );
}