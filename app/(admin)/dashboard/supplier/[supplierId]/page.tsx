"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Supplier, ProductGroup, SingleProduct } from "@/lib/types";
import {
  getSupplier,
  updateSupplier,
  addProductToSupplier,
  deleteSupplier,
  updateSupplierProduct,
  deleteSupplierProduct,
} from "@/lib/data/routes/supplier/supplier";
import { getProductList } from "@/lib/data/routes/product/product";
import toast from "react-hot-toast";
import {
  Package,
  Clock,
  Calendar,
  Truck,
  Users,
  ArrowLeft,
  Edit,
  TrendingUp,
  Plus,
  Save,
  X,
  Trash2,
  Search,
  Folder,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ProductWithGroup extends SingleProduct {
  productGroupName: string;
  productGroupId: string;
}

interface SupplierProduct {
  id: string;
  name: string;
  minOrderable: number;
  maxOrderable: number;
  productGroupName?: string;
}

interface SupplierWithProducts extends Omit<Supplier, 'products'> {
  products: SupplierProduct[];
}

export default function SupplierDetailPage() {
  const router = useRouter();
  const params = useParams();
  const supplierId = params.supplierId as string;

  const [supplier, setSupplier] = useState<SupplierWithProducts | null>(null);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<ProductWithGroup[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [isEditSupplierOpen, setIsEditSupplierOpen] = useState(false);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isDeleteSupplierOpen, setIsDeleteSupplierOpen] = useState(false);
  const [isEditProductOpen, setIsEditProductOpen] = useState(false);
  const [isDeleteProductOpen, setIsDeleteProductOpen] = useState(false);

  const [editForm, setEditForm] = useState({
    name: "",
    leadTime: 0,
  });
  const [newProduct, setNewProduct] = useState({
    productId: "",
    productName: "",
    productGroupName: "",
    max: 1000,
    min: 100,
  });
  const [editingProduct, setEditingProduct] = useState<SupplierProduct | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [addingProduct, setAddingProduct] = useState(false);
  const [updatingProduct, setUpdatingProduct] = useState(false);
  const [deletingProductLoading, setDeletingProductLoading] = useState(false);

  const getProductNameById = (productId: string): string => {
    const product = products.find(p => p.id === productId);
    return product ? product.name : "Unknown Product";
  };

  const enhanceSupplierProducts = (supplierData: Supplier, productList: ProductWithGroup[]): SupplierWithProducts => {
    return {
      ...supplierData,
      products: (supplierData.products || []).map((product: any) => {
        const productId = product.id || product.productId || '';
        const productDetails = productList.find(p => p.id === productId);
        return {
          id: productId,
          name: productDetails?.name || "Unknown Product",
          minOrderable: product.minOrderable || product.min || 0,
          maxOrderable: product.maxOrderable || product.max || 0,
          productGroupName: productDetails?.productGroupName || "Unknown Group",
        };
      }).filter(product => product.id)
    };
  };

  useEffect(() => {
    const fetchProducts = async () => {
      setProductsLoading(true);
      try {
        const productGroups = await getProductList();
        if (productGroups) {
          const allProducts = productGroups.flatMap(group => 
            group.products.map(product => ({
              ...product,
              productGroupName: group.name,
              productGroupId: group.id
            }))
          );
          setProducts(allProducts);
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
        toast.error("Failed to load products");
      } finally {
        setProductsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const fetchSupplier = async () => {
      if (!supplierId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await getSupplier(supplierId);
        if (data) {
          const enhancedSupplier = enhanceSupplierProducts(data, products);
          setSupplier(enhancedSupplier);
          setEditForm({
            name: data.name,
            leadTime: data.leadTime,
          });
        }
      } catch (error) {
        console.error("Failed to fetch supplier:", error);
        toast.error("Failed to load supplier details");
      } finally {
        setLoading(false);
      }
    };

    if (products.length > 0 || supplierId) {
      fetchSupplier();
    }
  }, [supplierId, products.length]);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.productGroupName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const associatedProductIds = new Set(supplier?.products?.map(p => p.id) || []);

  const handleEditSupplier = async () => {
    if (!supplier) return;

    try {
      const updatePromise = updateSupplier(supplier.id, editForm);

      toast.promise(updatePromise, {
        loading: "Updating supplier...",
        success: (updatedSupplier) => {
          if (updatedSupplier) {
            const enhancedSupplier = enhanceSupplierProducts(updatedSupplier, products);
            setSupplier(enhancedSupplier);
          }
          setIsEditSupplierOpen(false);
          return "Supplier updated successfully!";
        },
        error: (error: any) => {
          const backendMessage = error.response?.data?.message;
          return backendMessage
            ? `Failed to update supplier: ${backendMessage}`
            : `Failed to update supplier: ${error.message}`;
        },
      });
    } catch (error: any) {
      console.error("Failed to update supplier:", error);
      toast.error("Failed to update supplier");
    }
  };

  const handleAddProduct = async () => {
    if (!supplier) return;
    if (!newProduct.productId.trim()) {
      toast.error("Please select a product");
      return;
    }

    if (newProduct.min <= 0 || newProduct.max <= 0) {
      toast.error(
        "Minimum and maximum order quantities must be greater than 0"
      );
      return;
    }

    if (newProduct.min > newProduct.max) {
      toast.error("Minimum order cannot be greater than maximum order");
      return;
    }

    setAddingProduct(true);

    try {
      const addPromise = addProductToSupplier(supplier.id, {
        productId: newProduct.productId.trim(),
        min: Number(newProduct.min),
        max: Number(newProduct.max),
      });

      toast.promise(addPromise, {
        loading: "Adding product to supplier...",
        success: (updatedSupplier) => {
          if (updatedSupplier) {
            const enhancedSupplier = enhanceSupplierProducts(updatedSupplier, products);
            setSupplier(enhancedSupplier);
          }
          
          setIsAddProductOpen(false);
          setNewProduct({ productId: "", productName: "", productGroupName: "", max: 1000, min: 100 });
          setSearchTerm("");
          return "Product added to supplier successfully!";
        },
        error: (error: any) => {
          const backendMessage = error.response?.data?.message;
          const validationErrors = error.response?.data?.errors;

          if (validationErrors) {
            return `Validation error: ${JSON.stringify(validationErrors)}`;
          } else if (backendMessage) {
            return `Failed to add product: ${backendMessage}`;
          } else {
            return `Failed to add product: ${error.message}`;
          }
        },
      });
    } catch (error: any) {
      console.error("Failed to add product:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to add product";
      toast.error(`Failed to add product: ${errorMessage}`);
    } finally {
      setAddingProduct(false);
    }
  };

  const handleEditProduct = async () => {
    if (!supplier || !editingProduct) return;

    if (editingProduct.minOrderable <= 0 || editingProduct.maxOrderable <= 0) {
      toast.error(
        "Minimum and maximum order quantities must be greater than 0"
      );
      return;
    }

    if (editingProduct.minOrderable > editingProduct.maxOrderable) {
      toast.error("Minimum order cannot be greater than maximum order");
      return;
    }

    setUpdatingProduct(true);

    try {
      const updatePromise = updateSupplierProduct(
        supplier.id,
        editingProduct.id,
        {
          min: editingProduct.minOrderable,
          max: editingProduct.maxOrderable,
        }
      );

      toast.promise(updatePromise, {
        loading: "Updating product...",
        success: (updatedSupplier) => {
          if (updatedSupplier) {
            const enhancedSupplier = enhanceSupplierProducts(updatedSupplier, products);
            setSupplier(enhancedSupplier);
          }
          
          setIsEditProductOpen(false);
          setEditingProduct(null);
          return "Product updated successfully!";
        },
        error: (error: any) => {
          const backendMessage = error.response?.data?.message;
          return backendMessage
            ? `Failed to update product: ${backendMessage}`
            : `Failed to update product: ${error.message}`;
        },
      });
    } catch (error: any) {
      console.error("Failed to update product:", error);
      toast.error("Failed to update product");
    } finally {
      setUpdatingProduct(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!supplier || !deletingProduct) return;

    setDeletingProductLoading(true);

    try {
      await deleteSupplierProduct(supplier.id, deletingProduct.id);
      
      const updatedSupplier = await getSupplier(supplier.id);
      if (updatedSupplier) {
        const enhancedSupplier = enhanceSupplierProducts(updatedSupplier, products);
        setSupplier(enhancedSupplier);
      }
      
      setIsDeleteProductOpen(false);
      setDeletingProduct(null);
      toast.success("Product deleted successfully!");
    } catch (error: any) {
      console.error("Failed to delete product:", error);
      const backendMessage = error.response?.data?.message;
      toast.error(backendMessage
        ? `Failed to delete product: ${backendMessage}`
        : `Failed to delete product: ${error.message}`
      );
    } finally {
      setDeletingProductLoading(false);
    }
  };

  const handleDeleteSupplier = async () => {
    if (!supplier) return;

    try {
      const deletePromise = deleteSupplier(supplier.id);

      toast.promise(deletePromise, {
        loading: "Deleting supplier...",
        success: () => {
          setIsDeleteSupplierOpen(false);
          router.push("/dashboard/supplier");
          return "Supplier deleted successfully!";
        },
        error: (error: any) => {
          const backendMessage = error.response?.data?.message;
          return backendMessage
            ? `Failed to delete supplier: ${backendMessage}`
            : `Failed to delete supplier: ${error.message}`;
        },
      });
    } catch (error: any) {
      console.error("Failed to delete supplier:", error);
      toast.error("Failed to delete supplier");
    }
  };

  const getLeadTimeStatus = (leadTime: number) => {
    if (leadTime <= 3)
      return { color: "text-[#334155] bg-[#F1F5F9]", label: "Fast Delivery" };
    if (leadTime <= 7)
      return {
        color: "text-[#475569] bg-[#E2E8F0]",
        label: "Standard Delivery",
      };
    return { color: "text-[#64748B] bg-[#CBD5E1]", label: "Slow Delivery" };
  };

  const handleProductSelect = (productId: string) => {
    const selectedProduct = products.find(p => p.id === productId);
    if (selectedProduct) {
      setNewProduct(prev => ({
        ...prev,
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        productGroupName: selectedProduct.productGroupName
      }));
    }
  };

  if (!supplierId) {
    return (
      <div className="min-h-screen bg-[#F1F5F9] p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl p-8 border border-[#E2E8F0] shadow-sm text-center">
            <Truck className="h-16 w-16 text-[#64748B] mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-[#0F172A] mb-2">
              Invalid Supplier
            </h1>
            <p className="text-[#475569] mb-6">
              Supplier ID is missing or invalid.
            </p>
            <button
              onClick={() => router.push("/dashboard/supplier")}
              className="inline-flex items-center gap-2 bg-[#1E293B] hover:bg-[#0F172A] text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-md"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Suppliers
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F1F5F9] p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl p-12 border border-[#E2E8F0] shadow-sm text-center">
            <div className="animate-pulse flex flex-col items-center">
              <div className="bg-[#CBD5E1] rounded-full h-16 w-16 mb-4"></div>
              <div className="bg-[#E2E8F0] h-6 w-48 rounded mb-2"></div>
              <div className="bg-[#E2E8F0] h-4 w-32 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="min-h-screen bg-[#F1F5F9] p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl p-8 border border-[#E2E8F0] shadow-sm text-center">
            <Truck className="h-16 w-16 text-[#64748B] mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-[#0F172A] mb-2">
              Supplier Not Found
            </h1>
            <p className="text-[#475569] mb-6">
              The supplier you're looking for doesn't exist.
            </p>
            <button
              onClick={() => router.push("/dashboard/supplier")}
              className="inline-flex items-center gap-2 bg-[#1E293B] hover:bg-[#0F172A] text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-md"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Suppliers
            </button>
          </div>
        </div>
      </div>
    );
  }

  const leadTimeStatus = getLeadTimeStatus(supplier.leadTime);

  return (
    <div className="min-h-screen bg-[#F1F5F9] p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[#1E293B] hover:text-[#0F172A] transition-colors duration-200 p-2 hover:bg-white/80 rounded-lg"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="font-medium">Back</span>
          </button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-3 space-y-6">
            <div className="bg-white rounded-xl p-6 border border-[#E2E8F0] shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-[#1E293B] p-3 rounded-lg shadow-sm">
                    <Truck className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-[#0F172A]">
                     Supplier Name: {supplier.name.toUpperCase()}
                    </h1>
                    <p className="text-[#475569] mt-1 flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Supplier ID: {supplier.id.slice(0, 8)}...
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Dialog
                    open={isEditSupplierOpen}
                    onOpenChange={setIsEditSupplierOpen}
                  >
                    <DialogTrigger asChild>
                      <button className="flex items-center gap-2 bg-green-100 hover:bg-green-200 text-green-700 border border-green-400 px-4 py-2 rounded-lg font-semibold transition-all duration-200 shadow-sm">
                        <Edit className="h-4 w-4" />
                        Edit Supplier
                      </button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px] bg-white border border-[#E2E8F0] rounded-xl">
                      <DialogHeader className="space-y-4">
                        <DialogTitle className="text-xl font-bold text-[#0F172A]">
                          Edit Supplier
                        </DialogTitle>
                        <DialogDescription className="text-[#475569]">
                          Update the supplier information for {supplier.name}.
                        </DialogDescription>
                      </DialogHeader>

                      <div className="space-y-6 py-4">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-[#334155]">
                              Supplier Name *
                            </label>
                            <input
                              type="text"
                              value={editForm.name}
                              onChange={(e) =>
                                setEditForm((prev) => ({
                                  ...prev,
                                  name: e.target.value,
                                }))
                              }
                              className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg focus:ring-2 focus:ring-[#1E293B] focus:border-transparent transition-all duration-200"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium text-[#334155]">
                              Lead Time (days) *
                            </label>
                            <input
                              type="number"
                              min="1"
                              max="365"
                              value={editForm.leadTime}
                              onChange={(e) =>
                                setEditForm((prev) => ({
                                  ...prev,
                                  leadTime: parseInt(e.target.value) || 1,
                                }))
                              }
                              className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg focus:ring-2 focus:ring-[#1E293B] focus:border-transparent transition-all duration-200"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3 pt-4">
                        <button
                          onClick={() => setIsEditSupplierOpen(false)}
                          className="flex items-center gap-2 flex-1 justify-center border border-[#CBD5E1] text-[#334155] hover:bg-[#F8FAFC] px-4 py-2.5 rounded-lg font-medium transition-all duration-200"
                        >
                          <X className="h-4 w-4" />
                          Cancel
                        </button>
                        <button
                          onClick={handleEditSupplier}
                          disabled={!editForm.name.trim()}
                          className="flex items-center gap-2 flex-1 justify-center bg-[#1E293B] hover:bg-[#0F172A] disabled:bg-[#CBD5E1] disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-lg font-medium transition-all duration-200"
                        >
                          <Save className="h-4 w-4" />
                          Save Changes
                        </button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <AlertDialog
                    open={isDeleteSupplierOpen}
                    onOpenChange={setIsDeleteSupplierOpen}
                  >
                    <AlertDialogTrigger asChild>
                      <button className="flex items-center gap-2 bg-red-100 hover:bg-red-200 text-red-700 border border-red-400 px-4 py-2 rounded-lg font-semibold transition-all duration-200 shadow-sm">
                        <Trash2 className="h-4 w-4" />
                        Delete Supplier
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-white border border-[#E2E8F0] rounded-xl">
                      <AlertDialogHeader className="space-y-4">
                        <AlertDialogTitle className="text-xl font-bold text-[#0F172A]">
                          Delete Supplier
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-[#475569]">
                          Are you sure you want to delete{" "}
                          <strong>"{supplier.name}"</strong>? This action cannot
                          be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>

                      <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-lg p-4 mt-4">
                        <div className="flex items-start gap-3">
                          <Trash2 className="h-5 w-5 text-[#DC2626] mt-0.5 flex-shrink-0" />
                          <div className="text-sm text-[#DC2626]">
                            <strong>Warning:</strong> This will permanently
                            delete the supplier and all associated product
                            relationships.
                          </div>
                        </div>
                      </div>

                      <AlertDialogFooter className="flex gap-3 pt-4">
                        <AlertDialogCancel className="flex-1 border border-[#CBD5E1] text-[#334155] hover:bg-[#F8FAFC] rounded-lg py-2.5">
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteSupplier}
                          className="flex-1 bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded-lg py-2.5 font-medium"
                        >
                          Delete Supplier
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-6 border border-[#E2E8F0] shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-[#F1F5F9] p-2 rounded-lg">
                    <Users className="h-5 w-5 text-[#334155]" />
                  </div>
                  <h3 className="font-semibold text-[#0F172A]">Information</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-[#64748B]">Supplier ID</p>
                    <p className="text-sm font-medium text-[#0F172A]">{supplier.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#64748B]">Account ID</p>
                    <p className="text-sm font-medium text-[#0F172A]">{supplier.accountId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#64748B]">Status</p>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        supplier.deletedAt
                          ? "bg-[#FEF2F2] text-[#DC2626]"
                          : "bg-[#F0FDF4] text-[#16A34A]"
                      }`}
                    >
                      {supplier.deletedAt ? "Inactive" : "Active"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border border-[#E2E8F0] shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-[#F1F5F9] p-2 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-[#334155]" />
                  </div>
                  <h3 className="font-semibold text-[#0F172A]">Performance</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="h-4 w-4 text-[#64748B]" />
                      <p className="text-sm text-[#64748B]">Lead Time</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-semibold text-[#0F172A]">
                        {supplier.leadTime} days
                      </p>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${leadTimeStatus.color}`}
                      >
                        {leadTimeStatus.label}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Package className="h-4 w-4 text-[#64748B]" />
                      <p className="text-sm text-[#64748B]">Total Products</p>
                    </div>
                    <p className="text-lg font-semibold text-[#0F172A]">
                      {supplier.products?.length || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border border-[#E2E8F0] shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-[#F1F5F9] p-2 rounded-lg">
                    <Calendar className="h-5 w-5 text-[#334155]" />
                  </div>
                  <h3 className="font-semibold text-[#0F172A]">Timeline</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-[#64748B]">Created</p>
                    <p className="text-sm font-medium text-[#0F172A]">
                      {new Date(supplier.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-[#64748B]">Last Updated</p>
                    <p className="text-sm font-medium text-[#0F172A]">
                      {new Date(supplier.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  {supplier.deletedAt && (
                    <div>
                      <p className="text-sm text-[#64748B]">Deleted</p>
                      <p className="text-sm font-medium text-[#0F172A]">
                        {new Date(supplier.deletedAt).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm">
              <div className="flex items-center justify-between p-6 border-b border-[#E2E8F0]">
                <div className="flex items-center gap-3">
                  <div className="bg-[#1E293B] p-2 rounded-lg shadow-sm">
                    <Package className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-[#0F172A]">
                      Associated Products
                    </h2>
                    <p className="text-sm text-[#64748B]">
                      {supplier.products?.length || 0} product{supplier.products?.length !== 1 ? "s" : ""} associated
                    </p>
                  </div>
                </div>

                <Dialog
                  open={isAddProductOpen}
                  onOpenChange={setIsAddProductOpen}
                >
                  <DialogTrigger asChild>
                    <button className="flex items-center gap-2 bg-blue-100 hover:bg-blue-200 border border-blue-400 text-blue-700 px-4 py-2 rounded-lg font-semibold transition-all duration-200 shadow-sm">
                      <Plus className="h-4 w-4" />
                      Add Product
                    </button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px] bg-white border border-[#E2E8F0] rounded-xl">
                    <DialogHeader className="space-y-4">
                      <DialogTitle className="text-xl font-bold text-[#0F172A]">
                          Add a new product to supplier: {supplier.name.toUpperCase()}
                      </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-[#334155]">
                            Select Product
                          </label>
                          
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#64748B]" />
                          <input
  type="text"
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  placeholder="Search products by name, ID, or product group..."
  className="w-full pl-10 pr-3 py-2 border border-[#CBD5E1] rounded-lg focus:ring-2 focus:ring-[#1E293B] focus:border-[#1E293B] focus:outline-none transition-all duration-200"
/>
                          </div>

                          <div className="max-h-60 overflow-y-auto border border-[#CBD5E1] rounded-lg">
                            {productsLoading ? (
                              <div className="p-4 text-center text-[#64748B]">
                                Loading products...
                              </div>
                            ) : filteredProducts.length === 0 ? (
                              <div className="p-4 text-center text-[#64748B]">
                                No products found
                              </div>
                            ) : (
                              filteredProducts.map((product) => (
                                <button
                                  key={product.id}
                                  onClick={() => handleProductSelect(product.id)}
                                  disabled={associatedProductIds.has(product.id)}
                                  className={`w-full text-left p-3 border-b border-[#F1F5F9] last:border-b-0 hover:bg-[#F8FAFC] transition-colors duration-200 ${
                                    newProduct.productId === product.id
                                      ? "bg-[#F1F5F9] border-[#E2E8F0]"
                                      : ""
                                  } ${
                                    associatedProductIds.has(product.id)
                                      ? "opacity-50 cursor-not-allowed bg-[#F8FAFC]"
                                      : "cursor-pointer"
                                  }`}
                                >
                                  <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                      <div className="font-medium text-[#0F172A]">
                                        {product.name.toUpperCase()}
                                      </div>
                                      <div className="flex items-center gap-2 text-sm text-[#64748B] mt-1">
                                        <h1 className="text-xs">PRODUCT GROUP:</h1>
                                        <span className="text-xs">{product.productGroupName.toUpperCase()}</span>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-xs text-[#94A3B8]">
                                        ID: {product.id.slice(0, 8)}...
                                      </div>
                                    </div>
                                  </div>
                                  {associatedProductIds.has(product.id) && (
                                    <div className="text-xs text-[#DC2626] mt-1">
                                      Already associated with this supplier
                                    </div>
                                  )}
                                </button>
                              ))
                            )}
                          </div>

                          {newProduct.productId && (
                            <div className="p-3 bg-[#F0FDF4] border border-[#BBF7D0] rounded-lg">
                              <div className="text-sm font-medium text-[#16A34A]">
                                SELECTED PRODUCT:
                              </div>
                              <div className="text-[#15803D]">
                                {newProduct.productName.toUpperCase()}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-[#15803D] mt-1">
                               <h1>PRODUCT GROUP:</h1>
                                <span>{newProduct.productGroupName.toUpperCase()}</span>
                              </div>
                              <div className="text-xs text-[#15803D] mt-1">
                                ID: {newProduct.productId}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-[#334155]">
                              Minimum Order
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={newProduct.min}
                              onChange={(e) =>
                                setNewProduct((prev) => ({
                                  ...prev,
                                  min: parseInt(e.target.value) || 1,
                                }))
                              }
                              className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg focus:ring-2 focus:ring-[#1E293B] focus:border-transparent transition-all duration-200"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-[#334155]">
                              Maximum Order
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={newProduct.max}
                              onChange={(e) =>
                                setNewProduct((prev) => ({
                                  ...prev,
                                  max: parseInt(e.target.value) || 1,
                                }))
                              }
                              className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg focus:ring-2 focus:ring-[#1E293B] focus:border-transparent transition-all duration-200"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={() => {
                          setIsAddProductOpen(false);
                          setNewProduct({
                            productId: "",
                            productName: "",
                            productGroupName: "",
                            max: 1000,
                            min: 100,
                          });
                          setSearchTerm("");
                        }}
                        className="flex items-center gap-2 flex-1 justify-center border border-[#CBD5E1] text-[#334155] hover:bg-[#F8FAFC] px-4 py-2.5 rounded-lg font-medium transition-all duration-200"
                      >
                        <X className="h-4 w-4" />
                        Cancel
                      </button>
                      <button
                        onClick={handleAddProduct}
                        disabled={
                          !newProduct.productId.trim() || addingProduct
                        }
                        className="flex items-center gap-2 flex-1 justify-center bg-[#1E293B] hover:bg-[#0F172A] disabled:bg-[#CBD5E1] disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-lg font-medium transition-all duration-200"
                      >
                        <Save className="h-4 w-4" />
                        {addingProduct ? "Adding..." : "Add Product"}
                      </button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {supplier.products && supplier.products.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                        <th className="text-left py-4 px-6 font-semibold text-[#334155] text-sm">
                          Product Name
                        </th>
                        <th className="text-left py-4 px-6 font-semibold text-[#334155] text-sm">
                          Product Group
                        </th>
                        <th className="text-left py-4 px-6 font-semibold text-[#334155] text-sm">
                          Product ID
                        </th>
                        <th className="text-center py-4 px-6 font-semibold text-[#334155] text-sm">
                          Min Order
                        </th>
                        <th className="text-center py-4 px-6 font-semibold text-[#334155] text-sm">
                          Max Order
                        </th>
                        <th className="text-center py-4 px-6 font-semibold text-[#334155] text-sm">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F1F5F9]">
                      {supplier.products.map((product, index) => (
                        <tr 
                          key={`${supplier.id}-${product.id || 'unknown'}`}
                          className={`transition-colors duration-150 ${
                            index % 2 === 0 ? 'bg-white' : 'bg-[#F8FAFC]'
                          } hover:bg-[#F1F5F9]`}
                        >
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="bg-[#F1F5F9] text-[#334155] p-2 rounded-lg">
                                <Package className="h-4 w-4" />
                              </div>
                              <span className="font-medium text-[#0F172A]">
                                {product.name}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <Folder className="h-4 w-4 text-[#64748B]" />
                              <span className="text-sm text-[#334155]">
                                {product.productGroupName || "Unknown Group"}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <code className="text-sm text-[#475569] bg-[#F1F5F9] px-2 py-1 rounded">
                              {product.id ? `${product.id.slice(0, 8)}...` : 'N/A'}
                            </code>
                          </td>
                          <td className="py-4 px-6 text-center">
                            <span className="inline-flex items-center bg-[#F1F5F9] text-[#334155] px-3 py-1 rounded-full text-sm font-medium">
                              {product.minOrderable}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-center">
                            <span className="inline-flex items-center bg-[#F1F5F9] text-[#334155] px-3 py-1 rounded-full text-sm font-medium">
                              {product.maxOrderable}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <Dialog
                                open={
                                  isEditProductOpen &&
                                  editingProduct?.id === product.id
                                }
                                onOpenChange={(open) => {
                                  setIsEditProductOpen(open);
                                  if (!open) setEditingProduct(null);
                                }}
                              >
                                <DialogTrigger asChild>
                                  <button
                                    onClick={() => setEditingProduct(product)}
                                    className="p-2 bg-[#F1F5F9] text-[#334155] hover:bg-[#E2E8F0] rounded-lg transition-colors duration-200"
                                    title="Edit Product"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[425px] bg-white border border-[#E2E8F0] rounded-xl">
                                  <DialogHeader className="space-y-4">
                                    <DialogTitle className="text-xl font-bold text-[#0F172A]">
                                      Edit Product
                                    </DialogTitle>
                                    <DialogDescription className="text-[#475569]">
                                      Update the order quantities for {product.name}.
                                    </DialogDescription>
                                  </DialogHeader>

                                  <div className="space-y-6 py-4">
                                    <div className="space-y-4">
                                      <div className="space-y-2">
                                        <label className="text-sm font-medium text-[#334155]">
                                          Product Name
                                        </label>
                                        <input
                                          type="text"
                                          value={product.name}
                                          disabled
                                          className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg bg-[#F8FAFC] text-[#64748B]"
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <label className="text-sm font-medium text-[#334155]">
                                          Product Group
                                        </label>
                                        <input
                                          type="text"
                                          value={product.productGroupName || "Unknown Group"}
                                          disabled
                                          className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg bg-[#F8FAFC] text-[#64748B]"
                                        />
                                      </div>

                                      <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                          <label className="text-sm font-medium text-[#334155]">
                                            Minimum Order *
                                          </label>
                                          <input
                                            type="number"
                                            min="1"
                                            value={editingProduct?.minOrderable || 0}
                                            onChange={(e) =>
                                              setEditingProduct((prev) =>
                                                prev
                                                  ? {
                                                      ...prev,
                                                      minOrderable: parseInt(e.target.value) || 1,
                                                    }
                                                  : null
                                              )
                                            }
                                            className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg focus:ring-2 focus:ring-[#1E293B] focus:border-transparent transition-all duration-200"
                                          />
                                        </div>
                                        <div className="space-y-2">
                                          <label className="text-sm font-medium text-[#334155]">
                                            Maximum Order *
                                          </label>
                                          <input
                                            type="number"
                                            min="1"
                                            value={editingProduct?.maxOrderable || 0}
                                            onChange={(e) =>
                                              setEditingProduct((prev) =>
                                                prev
                                                  ? {
                                                      ...prev,
                                                      maxOrderable: parseInt(e.target.value) || 1,
                                                    }
                                                  : null
                                              )
                                            }
                                            className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg focus:ring-2 focus:ring-[#1E293B] focus:border-transparent transition-all duration-200"
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex gap-3 pt-4">
                                    <button
                                      onClick={() => {
                                        setIsEditProductOpen(false);
                                        setEditingProduct(null);
                                      }}
                                      className="flex items-center gap-2 flex-1 justify-center border border-[#CBD5E1] text-[#334155] hover:bg-[#F8FAFC] px-4 py-2.5 rounded-lg font-medium transition-all duration-200"
                                    >
                                      <X className="h-4 w-4" />
                                      Cancel
                                    </button>
                                    <button
                                      onClick={handleEditProduct}
                                      disabled={updatingProduct}
                                      className="flex items-center gap-2 flex-1 justify-center bg-[#1E293B] hover:bg-[#0F172A] disabled:bg-[#CBD5E1] disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-lg font-medium transition-all duration-200"
                                    >
                                      <Save className="h-4 w-4" />
                                      {updatingProduct ? "Updating..." : "Update Product"}
                                    </button>
                                  </div>
                                </DialogContent>
                              </Dialog>
                              <AlertDialog
                                open={
                                  isDeleteProductOpen &&
                                  deletingProduct?.id === product.id
                                }
                                onOpenChange={(open) => {
                                  setIsDeleteProductOpen(open);
                                  if (!open) setDeletingProduct(null);
                                }}
                              >
                                <AlertDialogTrigger asChild>
                                  <button
                                    onClick={() => setDeletingProduct({ id: product.id, name: product.name })}
                                    className="p-2 bg-[#FEF2F2] text-[#DC2626] hover:bg-[#FECACA] rounded-lg transition-colors duration-200"
                                    title="Delete Product"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="bg-white border border-[#E2E8F0] rounded-xl">
                                  <AlertDialogHeader className="space-y-4">
                                    <AlertDialogTitle className="text-xl font-bold text-[#0F172A]">
                                      Remove Product
                                    </AlertDialogTitle>
                                    <AlertDialogDescription className="text-[#475569]">
                                      Are you sure you want to remove <strong>"{product.name}"</strong> from {supplier.name}? This will remove the product association but won't delete the product itself.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>

                                  <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-lg p-4 mt-4">
                                    <div className="flex items-start gap-3">
                                      <Trash2 className="h-5 w-5 text-[#DC2626] mt-0.5 flex-shrink-0" />
                                      <div className="text-sm text-[#DC2626]">
                                        <strong>Note:</strong> This action will remove the product from this supplier's associated products list.
                                      </div>
                                    </div>
                                  </div>

                                  <AlertDialogFooter className="flex gap-3 pt-4">
                                    <AlertDialogCancel className="flex-1 border border-[#CBD5E1] text-[#334155] hover:bg-[#F8FAFC] rounded-lg py-2.5">
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={handleDeleteProduct}
                                      disabled={deletingProductLoading}
                                      className="flex-1 bg-[#DC2626] hover:bg-[#B91C1C] disabled:bg-[#CBD5E1] disabled:cursor-not-allowed text-white rounded-lg py-2.5 font-medium"
                                    >
                                      {deletingProductLoading ? "Removing..." : "Remove Product"}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Package className="h-16 w-16 text-[#CBD5E1] mx-auto mb-4" />
                  <p className="text-[#64748B] text-lg mb-2">
                    No products associated with this supplier
                  </p>
                  <p className="text-sm text-[#94A3B8]">
                    Add products using the button above
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}