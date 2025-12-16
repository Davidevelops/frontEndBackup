import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Package,
  BarChart3,
  Users,
  Calendar,
  Truck,
  TrendingUp,
  ArrowUpRight,
  Clock,
  CheckCircle,
  XCircle,
  Folder,
} from "lucide-react";
import { getSales } from "@/lib/data/routes/sales/sales";
import { getSuppliers } from "@/lib/data/routes/supplier/supplier";
import { getProductList } from "@/lib/data/routes/product/product";
import { getAllDeliveries } from "@/lib/data/routes/delivery/delivery";
import { getCategories } from "@/lib/data/routes/categories/categories";
import { productGroupsApi } from "@/lib/data/routes/temp/service";
import { apiEndpoints } from "@/lib/apiEndpoints";

interface DashboardStats {
  totalProducts: number;
  activeSuppliers: number;
  pendingDeliveries: number;
  totalCategories: number;
  completedDeliveries: number;
  totalSales: number;
  cancelledDeliveries: number;
  totalDeliveries: number;
  totalProductGroups: number;
}

interface TopProduct {
  name: string;
  sales: number;
  stock: number;
}

interface DeliveryStats {
  pending: number;
  completed: number;
  cancelled: number;
  total: number;
}

// Helper function to get total products count
const getTotalProductsCount = async (): Promise<number> => {
  try {
    // First, get all product groups
    const productGroups = await productGroupsApi.getAll();
    
    // Then, fetch products for each group and sum them up
    let totalProducts = 0;
    
    // Use Promise.all to fetch products for all groups in parallel
    const productsPromises = productGroups.map(async (group) => {
      try {
        const products = await productGroupsApi.getProductsByGroup(group.id);
        return products.length;
      } catch (error) {
        console.error(`Error fetching products for group ${group.id}:`, error);
        return 0;
      }
    });
    
    const productsCounts = await Promise.all(productsPromises);
    totalProducts = productsCounts.reduce((sum, count) => sum + count, 0);
    
    console.log('Total products counted from API:', totalProducts);
    return totalProducts;
  } catch (error) {
    console.error('Error calculating total products count:', error);
    return 0;
  }
};

export default function DashboardOverview() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    activeSuppliers: 0,
    pendingDeliveries: 0,
    totalCategories: 0,
    completedDeliveries: 0,
    totalSales: 0,
    cancelledDeliveries: 0,
    totalDeliveries: 0,
    totalProductGroups: 0,
  });
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [deliveryStats, setDeliveryStats] = useState<DeliveryStats>({
    pending: 0,
    completed: 0,
    cancelled: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState<string>("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

   const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setDebugInfo("Starting to fetch dashboard data...");
      
      console.log("Fetching dashboard data...");
      
      const [
        salesResponse,
        suppliersResponse,
        productsResponse,
        deliveriesResponse,
        categoriesResponse,
        productGroupsCountResponse,
      ] = await Promise.allSettled([
        getSales(),
        getSuppliers(),
        getProductList(),
        getAllDeliveries(),
        getCategories(),
        productGroupsApi.getCount(),
      ]);

      console.log("All responses received:", {
        salesResponse,
        suppliersResponse,
        productsResponse,
        deliveriesResponse,
        categoriesResponse,
        productGroupsCountResponse,
      });

      setDebugInfo(`Count response status: ${productGroupsCountResponse.status}`);
      
      if (productGroupsCountResponse.status === 'rejected') {
        console.error("Count API failed:", productGroupsCountResponse.reason);
        const reason = productGroupsCountResponse.reason;
        const errorMessage = reason instanceof Error ? reason.message : 'Unknown error';
        setDebugInfo(`Count API failed: ${errorMessage}`);
      }

      await processDashboardData(
        salesResponse,
        suppliersResponse,
        productsResponse,
        deliveriesResponse,
        categoriesResponse,
        productGroupsCountResponse
      );
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setDebugInfo(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const processDashboardData = async (
    salesResponse: any,
    suppliersResponse: any,
    productsResponse: any,
    deliveriesResponse: any,
    categoriesResponse: any,
    productGroupsCountResponse: any
  ) => {
   
    let totalSalesCount = 0;
    
    if (salesResponse.status === 'fulfilled' && salesResponse.value) {
      const salesData = salesResponse.value;
      totalSalesCount = salesData.length;
    }

    let topProductsData: TopProduct[] = [];
    let totalProductsCount = 0;
    let totalProductGroupsCount = 0;

    // Get product groups count
    if (productGroupsCountResponse.status === 'fulfilled' && productGroupsCountResponse.value !== undefined) {
      totalProductGroupsCount = productGroupsCountResponse.value;
      console.log('✅ Product groups count from API:', totalProductGroupsCount);
      setDebugInfo(`✅ Got product groups count from API: ${totalProductGroupsCount}`);
    } else {
      console.log('❌ Product groups count API failed, using fallback');
      if (productsResponse.status === 'fulfilled' && productsResponse.value) {
        const productsData = productsResponse.value;
        totalProductGroupsCount = productsData.length;
        console.log('✅ Using fallback product groups count from product list:', totalProductGroupsCount);
        setDebugInfo(`✅ Using fallback product groups count: ${totalProductGroupsCount}`);
      } else {
        console.log('❌ Both API and fallback failed for product groups count');
        setDebugInfo('❌ Both API and fallback failed for product groups count');
      }
    }

    // Get total products count using the new helper function
    try {
      totalProductsCount = await getTotalProductsCount();
      console.log('✅ Total products count from API:', totalProductsCount);
      setDebugInfo(prev => `${prev} | ✅ Total products: ${totalProductsCount}`);
    } catch (error) {
      console.error('Error getting total products count:', error);
      // Fallback to existing method if new approach fails
      if (productsResponse.status === 'fulfilled' && productsResponse.value) {
        const productsData = productsResponse.value;
        console.log('Products data length for fallback:', productsData.length);
        
        productsData.forEach((group: any) => {
          const groupProducts = group.products || [];
          totalProductsCount += groupProducts.length;
          
          groupProducts.forEach((product: any) => {
            const stockQuantity = product.stockQuantity || 0;
            
            if (stockQuantity > 0) {
              const salesEstimate = Math.floor((100 - stockQuantity) * 0.8) || Math.floor(Math.random() * 50);
              topProductsData.push({
                name: product.name || 'Unnamed Product',
                sales: salesEstimate,
                stock: stockQuantity,
              });
            }
          });
        });
        
        console.log('Total products counted (fallback):', totalProductsCount);
        setDebugInfo(prev => `${prev} | ✅ Total products (fallback): ${totalProductsCount}`);
      } else {
        console.log('❌ Failed to get total products count');
        setDebugInfo(prev => `${prev} | ❌ Failed to get total products count`);
      }
    }

    // If we haven't populated topProductsData yet, do it now
    if (topProductsData.length === 0 && productsResponse.status === 'fulfilled' && productsResponse.value) {
      const productsData = productsResponse.value;
      productsData.forEach((group: any) => {
        const groupProducts = group.products || [];
        groupProducts.forEach((product: any) => {
          const stockQuantity = product.stockQuantity || 0;
          
          if (stockQuantity > 0) {
            const salesEstimate = Math.floor((100 - stockQuantity) * 0.8) || Math.floor(Math.random() * 50);
            topProductsData.push({
              name: product.name || 'Unnamed Product',
              sales: salesEstimate,
              stock: stockQuantity,
            });
          }
        });
      });
    }
    
    // Sort and limit top products
    topProductsData = topProductsData
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 4);

    let activeSuppliersCount = 0;
    if (suppliersResponse.status === 'fulfilled' && suppliersResponse.value) {
      activeSuppliersCount = suppliersResponse.value.length;
    }

    let pendingDeliveries = 0;
    let completedDeliveries = 0;
    let cancelledDeliveries = 0;
    let totalDeliveries = 0;

    if (deliveriesResponse.status === 'fulfilled' && deliveriesResponse.value) {
      const deliveriesData = deliveriesResponse.value;
      totalDeliveries = deliveriesData.length;
      
      deliveriesData.forEach((delivery: any) => {
        const status = delivery.status?.toLowerCase() || '';
        
        if (status === 'completed') {
          completedDeliveries++;
        } else if (status === 'cancelled') {
          cancelledDeliveries++;
        } else if (status === 'pending') {
          pendingDeliveries++;
        }
      });
    }

    let totalCategoriesCount = 0;
    if (categoriesResponse.status === 'fulfilled' && categoriesResponse.value) {
      const categoriesData = categoriesResponse.value;
      totalCategoriesCount = categoriesData.length;
    }

    console.log('Final stats:', {
      totalProducts: totalProductsCount,
      totalProductGroups: totalProductGroupsCount,
      activeSuppliers: activeSuppliersCount,
      totalSales: totalSalesCount,
    });

    setStats({
      totalProducts: totalProductsCount,
      activeSuppliers: activeSuppliersCount,
      pendingDeliveries,
      totalCategories: totalCategoriesCount,
      completedDeliveries,
      totalSales: totalSalesCount,
      cancelledDeliveries,
      totalDeliveries,
      totalProductGroups: totalProductGroupsCount,
    });

    setDeliveryStats({
      pending: pendingDeliveries,
      completed: completedDeliveries,
      cancelled: cancelledDeliveries,
      total: totalDeliveries,
    });

    setTopProducts(topProductsData);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-gray-200 rounded-2xl p-4 h-24"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="mx-auto">
        {/* Debug info - can be removed after debugging
        {debugInfo && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
            <div className="font-medium text-yellow-800">Debug Info:</div>
            <div className="text-yellow-700">{debugInfo}</div>
            <div className="text-yellow-600 text-xs mt-1">
              Product Groups: {stats.totalProductGroups} | Total Products: {stats.totalProducts}
            </div>
          </div>
        )} */}

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div className="flex items-center gap-4 mb-4 lg:mb-0">
            <div className="bg-slate-800 p-3 rounded-2xl shadow-lg">
              <BarChart3 className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-slate-800">
                Dashboard Overview
              </h1>
              <div className="text-slate-600 mt-2 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Real-time inventory and sales insights
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-xl text-sm">
              <Calendar className="h-4 w-4" />
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
          </div>
        </div>


        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Updated Metric Card: Showing Product Groups */}
          <MetricCard
            icon={<Package className="h-6 w-6" />}
            title="Product Groups"
            value={stats.totalProductGroups.toString()}
            description="Product categories"
            trend={`${stats.totalProducts} total products`}
            color="text-blue-600"
            bgColor="bg-blue-50"
            borderColor="border-blue-200"
          />

          <MetricCard
            icon={<Users className="h-6 w-6" />}
            title="Active Suppliers"
            value={stats.activeSuppliers.toString()}
            description="Reliable partners"
            trend="All systems operational"
            color="text-indigo-600"
            bgColor="bg-indigo-50"
            borderColor="border-indigo-200"
          />

          <MetricCard
            icon={<TrendingUp className="h-6 w-6" />}
            title="Completed Transactions"
            value={stats.totalSales.toString()}
            description="All-time transactions"
            trend="Growing steadily"
            color="text-emerald-600"
            bgColor="bg-emerald-50"
            borderColor="border-emerald-200"
          />
        </div>


        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <MetricCard
            icon={<Folder className="h-6 w-6" />}
            title="Categories"
            value={stats.totalCategories.toString()}
            description="Product categories"
            trend="Organized inventory"
            color="text-purple-600"
            bgColor="bg-purple-50"
            borderColor="border-purple-200"
          />

          <MetricCard
            icon={<Truck className="h-6 w-6" />}
            title="Total Deliveries"
            value={stats.totalDeliveries.toString()}
            description="All delivery orders"
            trend="Delivery management"
            color="text-cyan-600"
            bgColor="bg-cyan-50"
            borderColor="border-cyan-200"
          />

          <MetricCard
            icon={<Truck className="h-6 w-6" />}
            title="Completed Deliveries"
            value={stats.completedDeliveries.toString()}
            description="Successful Deliveries"
            trend="Delivery performance"
            color="text-green-600"
            bgColor="bg-green-50"
            borderColor="border-green-200"
          />
        </div>

        {/* Bottom Section - Deliveries & Top Products */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Deliveries Status */}
          <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-slate-100 p-2 rounded-lg">
                <Truck className="h-5 w-5 text-slate-700" />
              </div>
              <h3 className="font-semibold text-slate-800 text-lg">Deliveries</h3>
            </div>
            
            <div className="space-y-4">
              <DeliveryStatusItem
                label="Pending Deliveries"
                count={deliveryStats.pending}
                total={deliveryStats.total}
                icon={<Clock className="h-4 w-4" />}
                color="bg-amber-500"
                bgColor="bg-amber-50"
                textColor="text-amber-700"
              />
              <DeliveryStatusItem
                label="Completed Deliveries"
                count={deliveryStats.completed}
                total={deliveryStats.total}
                icon={<CheckCircle className="h-4 w-4" />}
                color="bg-green-500"
                bgColor="bg-green-50"
                textColor="text-green-700"
              />
              <DeliveryStatusItem
                label="Cancelled Deliveries"
                count={deliveryStats.cancelled}
                total={deliveryStats.total}
                icon={<XCircle className="h-4 w-4" />}
                color="bg-red-500"
                bgColor="bg-red-50"
                textColor="text-red-700"
              />
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-slate-100 p-2 rounded-lg">
                <Package className="h-5 w-5 text-slate-700" />
              </div>
              <h3 className="font-semibold text-slate-800 text-lg">Top Products</h3>
            </div>
            
            <div className="space-y-4">
              {topProducts.length > 0 ? (
                topProducts.map((product, index) => (
                  <ProductItem
                    key={product.name}
                    rank={index + 1}
                    name={product.name}
                    sales={product.sales}
                    stock={product.stock}
                  />
                ))
              ) : (
                <div className="text-center text-slate-500 py-4">
                  No product data available
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickActionCard
            title="Sales Management"
            description="View and record sales"
            icon={<TrendingUp className="h-5 w-5" />}
            onClick={() => router.push("/dashboard/sales")}
            count={stats.totalSales}
          />

          <QuickActionCard
            title="Product Catalog"
            description="Manage products"
            icon={<Package className="h-5 w-5" />}
            onClick={() => router.push("/dashboard/products")}
            count={stats.totalProducts}
          />

          <QuickActionCard
            title="Supplier Management"
            description="Manage suppliers"
            icon={<Users className="h-5 w-5" />}
            onClick={() => router.push("/dashboard/suppliers")}
            count={stats.activeSuppliers}
          />

          <QuickActionCard
            title="Delivery Tracking"
            description="Monitor deliveries"
            icon={<Truck className="h-5 w-5" />}
            onClick={() => router.push("/dashboard/deliveries")}
            count={stats.pendingDeliveries}
          />
        </div>
      </div>
    </div>
  );
}

// Supporting Components (keep these the same as before)
interface MetricCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  description: string;
  trend: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

function MetricCard({ icon, title, value, description, trend, color, bgColor, borderColor }: MetricCardProps) {
  return (
    <div className={`bg-white rounded-2xl p-6 shadow-xs border ${borderColor} hover:shadow-md transition-all duration-300`}>
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl ${bgColor}`}>
          <div className={color}>
            {icon}
          </div>
        </div>
        <div className="flex-1">
          <div className="text-2xl font-bold text-slate-800">{value}</div>
          <div className="text-sm font-medium text-slate-600">{title}</div>
          <div className="text-xs text-slate-500 mt-1">{description}</div>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <div className="text-xs text-slate-500">{trend}</div>
        <ArrowUpRight className="h-4 w-4 text-slate-400" />
      </div>
    </div>
  );
}

interface DeliveryStatusItemProps {
  label: string;
  count: number;
  total: number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  textColor: string;
}

function DeliveryStatusItem({ label, count, total, icon, color, bgColor, textColor }: DeliveryStatusItemProps) {
  const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

  return (
    <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors duration-200">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${bgColor}`}>
          <div className={textColor}>
            {icon}
          </div>
        </div>
        <div>
          <div className="font-medium text-slate-800 text-sm">{label}</div>
          <div className="text-xs text-slate-500">{count} deliveries</div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-20 bg-slate-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full ${color}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="text-sm font-semibold text-slate-800 min-w-12 text-right">
          {percentage}%
        </span>
      </div>
    </div>
  );
}

interface ProductItemProps {
  rank: number;
  name: string;
  sales: number;
  stock: number;
}

function ProductItem({ rank, name, sales, stock }: ProductItemProps) {
  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return "bg-amber-100 text-amber-700";
      case 2: return "bg-slate-100 text-slate-700";
      case 3: return "bg-amber-50 text-amber-600";
      default: return "bg-slate-50 text-slate-600";
    }
  };

  return (
    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getRankColor(rank)}`}>
          <span className="text-sm font-semibold">{rank}</span>
        </div>
        <div>
          <div className="font-medium text-slate-800 text-sm">{name}</div>
          <div className="text-xs text-slate-500">{sales} sales</div>
        </div>
      </div>
      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
        stock < 10 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
      }`}>
        {stock} in stock
      </div>
    </div>
  );
}

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
  count: number;
}

function QuickActionCard({ title, description, icon, onClick, count }: QuickActionCardProps) {
  return (
    <div
      className="bg-white rounded-xl p-4 shadow-xs border border-slate-200 hover:shadow-md transition-all duration-300 cursor-pointer group"
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <div className="bg-slate-100 p-2 rounded-lg group-hover:bg-slate-200 transition-colors">
          <div className="text-slate-700">
            {icon}
          </div>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-slate-800 text-sm">{title}</h3>
          <p className="text-slate-500 text-xs">{description}</p>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <div className="text-xs text-slate-500">{count} items</div>
        <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
      </div>
    </div>
  );
}