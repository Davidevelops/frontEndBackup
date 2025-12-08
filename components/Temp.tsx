"use client";

import React, { useState, useEffect } from 'react';
import { ProductGroup, CreateProductGroupDto, UpdateProductGroupDto, ClassificationType, SingleProduct, SafetyStockMethod } from '@/lib/types';
import { productGroupsApi } from '@/lib/data/routes/temp/service';
import { exportProductsTemplate, importProducts, ImportResult, downloadBlob } from '@/lib/data/routes/excel/excel';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  RefreshCw,
  Edit,
  Archive,
  Undo2,
  Loader2,
  BarChart3,
  Box,
  Layers,
  Database,
  Calendar,
  TrendingUp,
  Package,
  GitBranch,
  Filter,
  Eye,
  MoreVertical,
  Settings,
  Download,
  Upload,
  AlertCircle,
  Grid3X3,
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

const ProductGroupsPage: React.FC = () => {
  const router = useRouter();
  
  const [productGroups, setProductGroups] = useState<ProductGroup[]>([]);
  const [productsByGroup, setProductsByGroup] = useState<Record<string, SingleProduct[]>>({});
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<any>(null);
  
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openAddVariantDialog, setOpenAddVariantDialog] = useState(false);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [unarchiveDialogOpen, setUnarchiveDialogOpen] = useState(false);
  
  const [newGroupName, setNewGroupName] = useState('');
  const [editGroupName, setEditGroupName] = useState('');
  
  const [selectedGroupForVariant, setSelectedGroupForVariant] = useState<ProductGroup | null>(null);
  const [variantName, setVariantName] = useState('');
  const [variantType, setVariantType] = useState<'partial' | 'full'>('partial');
  const [variantClassification, setVariantClassification] = useState<ClassificationType>('fast');
  const [variantServiceLevel, setVariantServiceLevel] = useState<number>(90);
  const [variantFillRate, setVariantFillRate] = useState<number>(90);
  const [variantSafetyStockMethod, setVariantSafetyStockMethod] = useState<SafetyStockMethod>('dynamic');
  const [addingVariant, setAddingVariant] = useState(false);
  
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [classification, setClassification] = useState<ClassificationType>('fast');
  const [serviceLevel, setServiceLevel] = useState<number>(90);
  const [fillRate, setFillRate] = useState<number>(90);
  const [safetyStockMethod, setSafetyStockMethod] = useState<string>('dynamic');
  
  const [showEditAdvancedSettings, setShowEditAdvancedSettings] = useState(false);
  const [editClassification, setEditClassification] = useState<ClassificationType>('fast');
  const [editServiceLevel, setEditServiceLevel] = useState<number>(90);
  const [editFillRate, setEditFillRate] = useState<number>(90);
  const [editSafetyStockMethod, setEditSafetyStockMethod] = useState<string>('dynamic');
  
  const [selectedGroup, setSelectedGroup] = useState<ProductGroup | null>(null);
  
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [unarchiving, setUnarchiving] = useState(false);

  const [stats, setStats] = useState({
    totalGroups: 0,
    totalProducts: 0,
    fastMoving: 0,
    slowMoving: 0,
    archivedGroups: 0,
  });

  const fetchProductGroups = async () => {
    try {
      setLoading(true);
      setFetchError(null);
      const groups = await productGroupsApi.getAll();
      setProductGroups(groups);
      
      await fetchProductsForGroups(groups);
      
      calculateStats(groups);
    } catch (err: any) {
      console.error('Failed to fetch product groups:', err);
      setFetchError(err);
      toast.error('Failed to load product groups');
      setProductGroups([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (groups: ProductGroup[]) => {
    let totalProducts = 0;
    let fastMoving = 0;
    let slowMoving = 0;
    let archivedGroups = 0;

    groups.forEach(group => {
      const products = productsByGroup[group.id] || [];
      totalProducts += products.length;
      
      if (group.deletedAt) {
        archivedGroups++;
      }
      
      if (group.setting?.classification === 'fast') {
        fastMoving++;
      } else if (group.setting?.classification === 'slow') {
        slowMoving++;
      }
    });

    setStats({
      totalGroups: groups.length,
      totalProducts,
      fastMoving,
      slowMoving,
      archivedGroups,
    });
  };

  const fetchProductsForGroups = async (groups: ProductGroup[]) => {
    try {
      const productsMap: Record<string, SingleProduct[]> = {};
      
      const productPromises = groups.map(async (group) => {
        try {
          const products = await productGroupsApi.getProductsByGroup(group.id);
          productsMap[group.id] = products;
          return { groupId: group.id, success: true };
        } catch (error) {
          console.error(`Failed to fetch products for group ${group.id}:`, error);
          productsMap[group.id] = [];
          return { groupId: group.id, success: false };
        }
      });
      
      await Promise.all(productPromises);
      setProductsByGroup(productsMap);
      
    } catch (error) {
      console.error('Error fetching products for groups:', error);
    }
  };

  const fetchProductsForGroup = async (groupId: string) => {
    try {
      const products = await productGroupsApi.getProductsByGroup(groupId);
      setProductsByGroup(prev => ({
        ...prev,
        [groupId]: products
      }));
      return products;
    } catch (error) {
      console.error(`Error fetching products for group ${groupId}:`, error);
      setProductsByGroup(prev => ({
        ...prev,
        [groupId]: []
      }));
      return [];
    }
  };

  useEffect(() => {
    fetchProductGroups();
  }, []);

  useEffect(() => {
    if (productGroups.length > 0) {
      calculateStats(productGroups);
    }
  }, [productsByGroup]);

  const handleExportProducts = async (): Promise<void> => {
    setExporting(true);
    try {
      console.log('Starting products export...');
      
      const blob = await exportProductsTemplate({ includeArchived: false });
      
      if (!blob) {
        throw new Error('Export returned empty file');
      }
      
      const filename = `products_${new Date().toISOString().split('T')[0]}.xlsx`;
      downloadBlob(blob, filename);
      
      toast.success("Products exported successfully!");
      console.log('Export completed successfully');

    } catch (error: any) {
      console.error('Export failed:', error);
      toast.error(error.message || 'Failed to export products');
    } finally {
      setExporting(false);
    }
  };

  const validateImportFile = (file: File): string | null => {
    if (!file.name.endsWith('.xlsx')) {
      return "Only Excel files with .xlsx format are supported";
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return "File size must be less than 10MB";
    }

    if (file.size === 0) {
      return "File is empty";
    }

    return null;
  };

  const handleImportProducts = async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = event.target.files?.[0];
    if (!file) {
      console.warn('No file selected for import');
      return;
    }

    const validationError = validateImportFile(file);
    if (validationError) {
      toast.error(validationError);
      console.warn('File validation failed:', { 
        fileName: file.name, 
        fileSize: file.size 
      });
      return;
    }

    setImporting(true);
    
    console.log('Starting products import:', {
      name: file.name,
      size: file.size
    });

    try {
      const result = await importProducts(file);
      
      await handleImportResult(result);

    } catch (error: any) {
      console.error('Import process failed:', error);
      toast.error(error.message || "Import failed");
    } finally {
      setImporting(false);
  
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  const handleImportResult = async (result: ImportResult): Promise<void> => {
    const groupsCreated = result.groupsCreated || 0;
    const groupsUpdated = result.groupsUpdated || 0;
    const productsCreated = result.productsCreated || 0;
    const productsUpdated = result.productsUpdated || 0;
    const errors = result.errors || [];
    
    const totalChanges = groupsCreated + groupsUpdated + productsCreated + productsUpdated;
    
    console.log('Import results:', {
      groupsCreated,
      groupsUpdated,
      productsCreated,
      productsUpdated,
      errorCount: errors.length,
      totalChanges
    });

    if (errors.length > 0) {
      const errorMessages = errors.slice(0, 3).map((error: any) => 
        error.row ? `Row ${error.row}: ${error.message}` : error.message
      );
      
      if (totalChanges > 0) {
        toast.success(
          `Import partially successful! ` +
          `Groups: ${groupsCreated} created, ${groupsUpdated} updated. ` +
          `Products: ${productsCreated} created, ${productsUpdated} updated. ` +
          `${errors.length} error(s) found.`
        );
        
        if (errorMessages.length > 0) {
          console.warn('Import completed with errors:', errorMessages);
        }
      } else {
        toast.error("Import failed with errors");
        console.error('Import failed completely with errors:', errors);
      }
    } else if (totalChanges > 0) {
      toast.success(
        `Import successful! ` +
        `Groups: ${groupsCreated} created, ${groupsUpdated} updated. ` +
        `Products: ${productsCreated} created, ${productsUpdated} updated.`
      );
    } else {
      toast.success("Import completed - no changes made");
    }
    
    if (totalChanges > 0 || errors.length === 0) {
      try {
        await fetchProductGroups();
        console.log('Data refreshed after import');
      } catch (error) {
        console.error('Failed to refresh data after import:', error);
      }
    }
  };

  const handleCreate = async () => {
    if (!newGroupName.trim()) {
      toast.error('Group name is required');
      return;
    }

    setCreating(true);

    try {
      const createData: CreateProductGroupDto = {
        name: newGroupName.trim(),
      };

      if (showAdvancedSettings) {
        createData.setting = {
          classification,
          serviceLevel,
          fillRate,
          safetyStockCalculationMethod: safetyStockMethod,
        };
      }

      console.log('Creating with data:', createData);
      
      await productGroupsApi.create(createData);
      
      await fetchProductGroups();
      
      setNewGroupName('');
      setShowAdvancedSettings(false);
      setClassification('fast');
      setServiceLevel(90);
      setFillRate(90);
      setSafetyStockMethod('dynamic');
      
      setOpenCreateDialog(false);
      
      toast.success('Product group created successfully');
    } catch (err: any) {
      console.error('Failed to create product group:', err);
      toast.error(err.message || 'Failed to create product group');
    } finally {
      setCreating(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedGroup) return;
    
    if (!editGroupName.trim()) {
      toast.error('Group name is required');
      return;
    }

    setUpdating(true);

    try {
      const updateData: UpdateProductGroupDto = {
        name: editGroupName.trim(),
      };

      if (showEditAdvancedSettings) {
        updateData.setting = {
          classification: editClassification,
          serviceLevel: editServiceLevel,
          fillRate: editFillRate,
          safetyStockCalculationMethod: editSafetyStockMethod,
        };
      }

      const updatedGroup = await productGroupsApi.update(selectedGroup.id, updateData);
      
      setProductGroups(prev =>
        prev.map(group =>
          group.id === selectedGroup.id ? updatedGroup : group
        )
      );
      
      setSelectedGroup(null);
      setEditGroupName('');
      setShowEditAdvancedSettings(false);
      setEditClassification('fast');
      setEditServiceLevel(90);
      setEditFillRate(90);
      setEditSafetyStockMethod('dynamic');
      setOpenEditDialog(false);
      
      toast.success('Product group updated successfully');
    } catch (err: any) {
      console.error('Failed to update product group:', err);
      toast.error(err.message || 'Failed to update product group');
    } finally {
      setUpdating(false);
    }
  };

  const handleAddVariant = async () => {
    if (!selectedGroupForVariant) return;
    
    if (!variantName.trim()) {
      toast.error('Variant name is required');
      return;
    }

    setAddingVariant(true);

    try {
      const variantData: any = {
        name: variantName.trim(),
      };

      if (variantType === 'full') {
        variantData.setting = {
          classification: variantClassification,
          serviceLevel: variantServiceLevel,
          fillRate: variantFillRate,
          safetyStockCalculationMethod: variantSafetyStockMethod,
        };
      }

      console.log('Adding variant with data:', variantData);
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/groups/${selectedGroupForVariant.id}/products`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify(variantData),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to add variant: ${response.statusText}`);
      }

      await fetchProductsForGroup(selectedGroupForVariant.id);
      
      setVariantName('');
      setVariantType('partial');
      setVariantClassification('fast');
      setVariantServiceLevel(90);
      setVariantFillRate(90);
      setVariantSafetyStockMethod('dynamic');
      
      setOpenAddVariantDialog(false);
      setSelectedGroupForVariant(null);
      
      toast.success('Variant added successfully');
    } catch (err: any) {
      console.error('Failed to add variant:', err);
      toast.error(err.message || 'Failed to add variant');
    } finally {
      setAddingVariant(false);
    }
  };

  const handleArchive = async () => {
    if (!selectedGroup) return;

    setArchiving(true);

    try {
      await productGroupsApi.archive(selectedGroup.id);
      
      setProductGroups(prev =>
        prev.filter(group => group.id !== selectedGroup.id)
      );
      
      setProductsByGroup(prev => {
        const newMap = { ...prev };
        delete newMap[selectedGroup.id];
        return newMap;
      });
      
      setSelectedGroup(null);
      setArchiveDialogOpen(false);
      
      toast.success('Product group archived successfully');
    } catch (err: any) {
      console.error('Failed to archive product group:', err);
      toast.error(err.message || 'Failed to archive product group');
    } finally {
      setArchiving(false);
    }
  };

  const handleUnarchive = async () => {
    if (!selectedGroup) return;

    setUnarchiving(true);

    try {
      const unarchivedGroup = await productGroupsApi.unarchive(selectedGroup.id);
      
      setProductGroups(prev => [...prev, unarchivedGroup]);
      
      await fetchProductsForGroup(selectedGroup.id);
      
      setSelectedGroup(null);
      setUnarchiveDialogOpen(false);
      
      toast.success('Product group unarchived successfully');
    } catch (err: any) {
      console.error('Failed to unarchive product group:', err);
      toast.error(err.message || 'Failed to unarchive product group');
    } finally {
      setUnarchiving(false);
    }
  };

  const openEditDialogHandler = (group: ProductGroup) => {
    setSelectedGroup(group);
    setEditGroupName(group.name);
    
    if (group.setting) {
      setShowEditAdvancedSettings(true);
      setEditClassification((group.setting.classification as ClassificationType) || 'fast');
      setEditServiceLevel(group.setting.serviceLevel || 90);
      setEditFillRate(group.setting.fillRate || 90);
      setEditSafetyStockMethod(group.setting.safetyStockCalculationMethod || 'dynamic');
    } else {
      setShowEditAdvancedSettings(false);
    }
    
    setOpenEditDialog(true);
  };

  const openAddVariantDialogHandler = (group: ProductGroup) => {
    setSelectedGroupForVariant(group);
    setOpenAddVariantDialog(true);
  };

  const openArchiveDialogHandler = (group: ProductGroup) => {
    setSelectedGroup(group);
    setArchiveDialogOpen(true);
  };

  const openUnarchiveDialogHandler = (group: ProductGroup) => {
    setSelectedGroup(group);
    setUnarchiveDialogOpen(true);
  };

  const navigateToProductView = (groupId: string, productId: string) => {
    router.push(`/dashboard/product-view/${groupId}/${productId}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getTotalProducts = (group: ProductGroup) => {
    const products = productsByGroup[group.id];
    if (products) {
      return products.length;
    }
    return group.products?.length || 0;
  };

  const getProductNames = (groupId: string): string => {
    const products = productsByGroup[groupId];
    
    if (!products || products.length === 0) {
      return 'No products';
    }
    
    const maxDisplay = 2;
    if (products.length <= maxDisplay) {
      return products.map(p => p.name).join(', ');
    } else {
      const firstTwo = products.slice(0, maxDisplay).map(p => p.name).join(', ');
      return `${firstTwo}`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-[#E2E8F0] rounded-xl animate-pulse"></div>
              <div className="space-y-3">
                <div className="h-9 w-56 bg-[#E2E8F0] rounded-lg animate-pulse"></div>
                <div className="flex gap-4">
                  <div className="h-5 w-32 bg-[#E2E8F0] rounded animate-pulse"></div>
                  <div className="h-5 w-28 bg-[#E2E8F0] rounded animate-pulse"></div>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="h-12 w-36 bg-[#E2E8F0] rounded-lg animate-pulse"></div>
              <div className="h-12 w-36 bg-[#E2E8F0] rounded-lg animate-pulse"></div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl p-6 border border-[#E2E8F0] animate-pulse"
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="h-6 w-20 bg-[#E2E8F0] rounded"></div>
                    <div className="h-8 w-16 bg-[#CBD5E1] rounded-lg"></div>
                  </div>
                  <div className="w-12 h-12 bg-[#E2E8F0] rounded-lg"></div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div className="flex items-center gap-4 mb-4 lg:mb-0">
            <div className="relative">
              <div className="bg-[#1E293B] p-3 rounded-xl">
                <Package className="h-8 w-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#16A34A] border-2 border-white rounded-full"></div>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#0F172A] mb-2">
                Product Groups
              </h1>
              <p className="text-[#64748B] text-lg">
                Manage your product groups and categories
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleExportProducts}
              disabled={exporting}
              className="text-xs flex items-center gap-2 bg-purple-100 hover:bg-purple-200 text-purple-800 border border-purple-400 px-4 py-2.5 rounded-lg transition-all duration-200 font-medium disabled:opacity-50"
            >
              <Download className={`h-4 w-4 ${exporting ? 'animate-spin' : ''}`} />
              {exporting ? "Exporting..." : "Export Excel"}
            </button>

            <label className="text-xs flex items-center gap-2 bg-green-100 hover:bg-green-200 text-green-700 border border-green-400 px-4 py-2.5 rounded-lg transition-all duration-200 font-medium cursor-pointer disabled:opacity-50">
              <Upload className={`h-4 w-4 ${importing ? 'animate-spin' : ''}`} />
              {importing ? "Importing..." : "Import Excel"}
              <input
                type="file"
                accept=".xlsx"
                onChange={handleImportProducts}
                disabled={importing}
                className="hidden"
              />
            </label>

            <button
              onClick={() => setOpenCreateDialog(true)}
              className="text-xs flex items-center gap-2 bg-[#1E293B] hover:bg-[#0F172A] text-white px-4 py-2.5 rounded-lg transition-all duration-200 font-medium"
            >
              <Plus className="h-4 w-4" />
              New Group
            </button>
          </div>
        </div>

        {/* Stats Cards - Removed fast moving, slow moving, and archived cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 hover:shadow-sm transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#64748B] mb-2">TOTAL GROUPS</p>
                <p className="text-3xl font-bold text-[#0F172A]">
                  {stats.totalGroups}
                </p>
                <p className="text-sm text-[#64748B] mt-1">Product categories</p>
              </div>
              <div className="bg-[#F1F5F9] p-3 rounded-lg">
                <Database className="h-6 w-6 text-[#1E293B]" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 hover:shadow-sm transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#64748B] mb-2">TOTAL PRODUCTS</p>
                <p className="text-3xl font-bold text-[#0F172A]">
                  {stats.totalProducts}
                </p>
                <p className="text-sm text-[#64748B] mt-1">Across all categories</p>
              </div>
              <div className="bg-[#F0FDF4] p-3 rounded-lg">
                <Package className="h-6 w-6 text-[#16A34A]" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 hover:shadow-sm transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#64748B] mb-2">DATA STATUS</p>
                <p className="text-lg font-semibold text-[#0F172A] flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${fetchError ? 'bg-[#DC2626]' : 'bg-[#16A34A]'}`}></span>
                  {fetchError ? 'Sync Failed' : 'Synced & Ready'}
                </p>
                <p className="text-sm text-[#64748B] mt-1">
                  {fetchError ? 'Click retry to reload' : 'Auto-refresh enabled'}
                </p>
              </div>
              <div className="bg-[#F1F5F9] p-3 rounded-lg">
                <Layers className="h-6 w-6 text-[#334155]" />
              </div>
            </div>
          </div>
        </div>

        {/* Bulk Operations Card */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-[#0F172A] mb-2">
                Bulk Operations
              </h3>
              <p className="text-[#64748B]">
                Use Excel files for bulk import/export operations. 
                <span className="text-[#DC2626] font-medium ml-1">
                  Only .xlsx format supported.
                </span>
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-[#0F172A]">
                  {stats.totalGroups} categories
                </p>
                <p className="text-sm text-[#64748B]">
                  {stats.totalProducts} total products
                </p>
              </div>
              <div className="w-12 h-12 bg-[#F1F5F9] rounded-lg flex items-center justify-center">
                <Grid3X3 className="h-6 w-6 text-[#64748B]" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Table */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
          {fetchError ? (
            <div className="text-center py-20">
              <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-xl p-8 max-w-md mx-auto">
                <div className="bg-white p-4 rounded-xl w-16 h-16 mx-auto mb-4">
                  <AlertCircle className="h-8 w-8 text-[#DC2626] mx-auto" />
                </div>
                <h3 className="text-xl font-bold text-[#0F172A] mb-3">
                  Failed to Load Products
                </h3>
                <p className="text-[#64748B] mb-6">
                  {fetchError?.message || 'There was an error fetching your product data.'}
                  {fetchError?.status && ` (Status: ${fetchError.status})`}
                </p>
                <button
                  onClick={() => fetchProductGroups()}
                  className="bg-[#DC2626] hover:bg-[#B91C1C] text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200"
                >
                  Retry Loading
                </button>
              </div>
            </div>
          ) : productGroups.length === 0 ? (
            <div className="text-center py-20">
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-10 max-w-md mx-auto">
                <div className="bg-white p-4 rounded-xl w-20 h-20 mx-auto mb-6">
                  <Package className="h-10 w-10 text-[#64748B] mx-auto" />
                </div>
                <h3 className="text-2xl font-bold text-[#0F172A] mb-3">
                  No Product Groups Found
                </h3>
                <p className="text-[#64748B] mb-6">
                  Start building your inventory by adding your first product group
                  or import from Excel.
                </p>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => setOpenCreateDialog(true)}
                    className="flex items-center justify-center gap-2 bg-[#1E293B] hover:bg-[#0F172A] text-white px-4 py-2.5 rounded-lg transition-all duration-200 font-medium"
                  >
                    <Plus className="h-4 w-4" />
                    Add Product Group
                  </button>
                  <label className="flex items-center justify-center gap-2 bg-green-100 text-xs text-green-700 border border-green-400 px-4 py-2.5 rounded-lg transition-all duration-200 font-medium cursor-pointer">
                    <Upload className="h-4 w-4" />
                    Import from Excel (.xlsx)
                    <input
                      type="file"
                      accept=".xlsx"
                      onChange={handleImportProducts}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4">
              <Table>
                <TableHeader>
                  <TableRow className="border-[#E2E8F0]">
                    <TableHead className="text-[#0F172A]">Name</TableHead>
                    <TableHead className="text-[#0F172A]">Product/Variant Count</TableHead>
                    <TableHead className="text-[#0F172A]">Products</TableHead>
                    <TableHead className="text-[#0F172A]">Created</TableHead>
                    <TableHead className="text-[#0F172A] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productGroups.map((group) => {
                    const products = productsByGroup[group.id] || [];
                    const totalProducts = products.length;
                    const productNames = getProductNames(group.id);
                    
                    return (
                      <TableRow key={group.id} className="hover:bg-[#F8FAFC] border-[#E2E8F0]">
                        <TableCell className="font-medium">
                          <div>
                            <p className="font-semibold text-[#0F172A]">{group.name}</p>
                            <p className="text-xs text-[#64748B]">
                              ID: {group.id?.slice(0, 8) || 'N/A'}...
                            </p>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <Badge variant="outline" className="min-w-[60px] justify-center bg-white border-[#E2E8F0]">
                            <Package className="h-3 w-3 mr-1" />
                            {totalProducts} item{totalProducts !== 1 ? 's' : ''}
                          </Badge>
                        </TableCell>
                        
                        <TableCell>
                          {products.length > 0 ? (
                            <div className="flex flex-col gap-1">
                              <p className="text-sm text-[#0F172A]">{productNames}</p>
                              {products.length > 2 && (
                                <p className="text-xs text-[#64748B]">
                                  <GitBranch className="inline h-3 w-3 mr-1" />
                                  +{products.length - 2} more
                                </p>
                              )}
                            </div>
                          ) : (
                            <p className="text-sm text-[#64748B] italic">
                              <Box className="inline h-3 w-3 mr-1" />
                              No products yet
                            </p>
                          )}
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex items-center text-[#0F172A]">
                            <Calendar className="h-3 w-3 mr-1" />
                            {group.createdAt ? formatDate(group.createdAt) : 'N/A'}
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex flex-wrap items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openAddVariantDialogHandler(group)}
                              className="bg-white border-[#E2E8F0] hover:bg-[#F8FAFC] text-xs"
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Add Variant
                            </Button>
                            
                            {products.length === 1 ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigateToProductView(group.id, products[0].id)}
                                className="bg-white border-[#E2E8F0] hover:bg-[#F8FAFC] text-xs"
                              >
                                <BarChart3 className="h-3 w-3 mr-1" />
                                Forecast
                              </Button>
                            ) : products.length > 1 ? (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="bg-white border-[#E2E8F0] hover:bg-[#F8FAFC] text-xs"
                                  >
                                    <BarChart3 className="h-3 w-3 mr-1" />
                                    Forecast
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-white border-[#E2E8F0]">
                                  {products.map((product) => (
                                    <DropdownMenuItem
                                      key={product.id}
                                      onClick={() => navigateToProductView(group.id, product.id)}
                                      className="cursor-pointer hover:bg-[#F8FAFC] text-xs"
                                    >
                                      <Eye className="h-3 w-3 mr-2" />
                                      {product.name}
                                    </DropdownMenuItem>
                                  ))}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                disabled
                                className="bg-white border-[#E2E8F0] text-xs"
                              >
                                <BarChart3 className="h-3 w-3 mr-1" />
                                Forecast
                              </Button>
                            )}
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditDialogHandler(group)}
                              className="bg-white border-[#E2E8F0] hover:bg-[#F8FAFC] text-xs"
                            >
                              <Edit className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                            
                            {group.deletedAt ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openUnarchiveDialogHandler(group)}
                                className="bg-white border-[#E2E8F0] hover:bg-green-50 hover:text-green-700 hover:border-green-300 text-xs"
                              >
                                <Undo2 className="h-3 w-3 mr-1" />
                                Unarchive
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openArchiveDialogHandler(group)}
                                className="bg-white border-[#E2E8F0] hover:bg-red-50 hover:text-red-700 hover:border-red-300 text-xs"
                              >
                                <Archive className="h-3 w-3 mr-1" />
                                Archive
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {productGroups.length > 0 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#E2E8F0]">
                  <div className="text-sm text-[#64748B]">
                    Total: {stats.totalGroups} group{stats.totalGroups !== 1 ? 's' : ''}
                  </div>
                  <div className="text-sm text-[#64748B]">
                    <Package className="inline h-3 w-3 mr-1" />
                    Total products/variants: {stats.totalProducts}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Create Dialog */}
        <Dialog open={openCreateDialog} onOpenChange={setOpenCreateDialog}>
          <DialogContent className="sm:max-w-[525px] bg-white border-[#E2E8F0]">
            <DialogHeader>
              <DialogTitle>Create New Product Group</DialogTitle>
              <DialogDescription>
                Enter details for your new product group. Settings are optional.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="group-name">Group Name *</Label>
                <Input
                  id="group-name"
                  placeholder="Enter group name"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleCreate();
                    }
                  }}
                  autoFocus
                  className="bg-white border-[#E2E8F0]"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center space-x-2">
                  <Settings className="h-4 w-4" />
                  <Label htmlFor="advanced-settings">Advanced Settings</Label>
                </div>
                <Switch
                  id="advanced-settings"
                  checked={showAdvancedSettings}
                  onCheckedChange={setShowAdvancedSettings}
                />
              </div>

              {showAdvancedSettings && (
                <div className="space-y-4 p-4 border rounded-lg bg-[#F8FAFC] border-[#E2E8F0]">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="classification">Classification *</Label>
                      <Select value={classification} onValueChange={(value: ClassificationType) => setClassification(value)}>
                        <SelectTrigger className="bg-white border-[#E2E8F0]">
                          <SelectValue placeholder="Select classification" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-[#E2E8F0]">
                          <SelectItem value="fast">Fast</SelectItem>
                          <SelectItem value="slow">Slow</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="safety-stock-method">Safety Stock Method</Label>
                      <Select value={safetyStockMethod} onValueChange={setSafetyStockMethod}>
                        <SelectTrigger className="bg-white border-[#E2E8F0]">
                          <SelectValue placeholder="Select method" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-[#E2E8F0]">
                          <SelectItem value="dynamic">Dynamic</SelectItem>
                          <SelectItem value="static">Static</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="service-level">Service Level (%)</Label>
                      <Input
                        id="service-level"
                        type="number"
                        min="0"
                        max="100"
                        value={serviceLevel}
                        onChange={(e) => setServiceLevel(Number(e.target.value))}
                        className="bg-white border-[#E2E8F0]"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="fill-rate">Fill Rate (%)</Label>
                      <Input
                        id="fill-rate"
                        type="number"
                        min="0"
                        max="100"
                        value={fillRate}
                        onChange={(e) => setFillRate(Number(e.target.value))}
                        className="bg-white border-[#E2E8F0]"
                      />
                    </div>
                  </div>
                </div>
              )}

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setOpenCreateDialog(false);
                    setNewGroupName('');
                    setShowAdvancedSettings(false);
                  }}
                  className="bg-white border-[#E2E8F0] hover:bg-[#F8FAFC]"
                >
                  Cancel
                </Button>
                <Button onClick={handleCreate} disabled={creating} className="bg-[#1E293B] hover:bg-[#0F172A] text-white">
                  {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
          <DialogContent className="sm:max-w-[525px] bg-white border-[#E2E8F0]">
            <DialogHeader>
              <DialogTitle>Edit Product Group</DialogTitle>
              <DialogDescription>
                Update the details of your product group.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-group-name">Group Name *</Label>
                <Input
                  id="edit-group-name"
                  placeholder="Enter group name"
                  value={editGroupName}
                  onChange={(e) => setEditGroupName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleUpdate();
                    }
                  }}
                  autoFocus
                  className="bg-white border-[#E2E8F0]"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center space-x-2">
                  <Settings className="h-4 w-4" />
                  <Label htmlFor="edit-advanced-settings">Advanced Settings</Label>
                </div>
                <Switch
                  id="edit-advanced-settings"
                  checked={showEditAdvancedSettings}
                  onCheckedChange={setShowEditAdvancedSettings}
                />
              </div>

              {showEditAdvancedSettings && (
                <div className="space-y-4 p-4 border rounded-lg bg-[#F8FAFC] border-[#E2E8F0]">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-classification">Classification *</Label>
                      <Select value={editClassification} onValueChange={(value: ClassificationType) => setEditClassification(value)}>
                        <SelectTrigger className="bg-white border-[#E2E8F0]">
                          <SelectValue placeholder="Select classification" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-[#E2E8F0]">
                          <SelectItem value="fast">Fast</SelectItem>
                          <SelectItem value="slow">Slow</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="edit-safety-stock-method">Safety Stock Method</Label>
                      <Select value={editSafetyStockMethod} onValueChange={setEditSafetyStockMethod}>
                        <SelectTrigger className="bg-white border-[#E2E8F0]">
                          <SelectValue placeholder="Select method" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-[#E2E8F0]">
                          <SelectItem value="dynamic">Dynamic</SelectItem>
                          <SelectItem value="static">Static</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-service-level">Service Level (%)</Label>
                      <Input
                        id="edit-service-level"
                        type="number"
                        min="0"
                        max="100"
                        value={editServiceLevel}
                        onChange={(e) => setEditServiceLevel(Number(e.target.value))}
                        className="bg-white border-[#E2E8F0]"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="edit-fill-rate">Fill Rate (%)</Label>
                      <Input
                        id="edit-fill-rate"
                        type="number"
                        min="0"
                        max="100"
                        value={editFillRate}
                        onChange={(e) => setEditFillRate(Number(e.target.value))}
                        className="bg-white border-[#E2E8F0]"
                      />
                    </div>
                  </div>
                </div>
              )}

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setOpenEditDialog(false);
                    setEditGroupName('');
                    setSelectedGroup(null);
                    setShowEditAdvancedSettings(false);
                  }}
                  className="bg-white border-[#E2E8F0] hover:bg-[#F8FAFC]"
                >
                  Cancel
                </Button>
                <Button onClick={handleUpdate} disabled={updating} className="bg-[#1E293B] hover:bg-[#0F172A] text-white">
                  {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Update
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Variant Dialog */}
        <Dialog open={openAddVariantDialog} onOpenChange={setOpenAddVariantDialog}>
          <DialogContent className="sm:max-w-[525px] bg-white border-[#E2E8F0]">
            <DialogHeader>
              <DialogTitle>
                Add Variant to {selectedGroupForVariant?.name}
              </DialogTitle>
              <DialogDescription>
                {variantType === 'partial' 
                  ? 'Enter variant name. No additional settings required for partial variant.'
                  : 'Enter variant details with settings for full configuration.'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Variant Type</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={variantType === 'partial' ? 'default' : 'outline'}
                    onClick={() => setVariantType('partial')}
                    className={variantType === 'partial' 
                      ? 'bg-[#1E293B] text-white hover:bg-[#0F172A]' 
                      : 'bg-white border-[#E2E8F0] hover:bg-[#F8FAFC]'}
                  >
                    Partial
                  </Button>
                  <Button
                    type="button"
                    variant={variantType === 'full' ? 'default' : 'outline'}
                    onClick={() => setVariantType('full')}
                    className={variantType === 'full' 
                      ? 'bg-[#1E293B] text-white hover:bg-[#0F172A]' 
                      : 'bg-white border-[#E2E8F0] hover:bg-[#F8FAFC]'}
                  >
                    Full
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="variant-name">Variant Name *</Label>
                <Input
                  id="variant-name"
                  placeholder="Enter variant name"
                  value={variantName}
                  onChange={(e) => setVariantName(e.target.value)}
                  className="bg-white border-[#E2E8F0]"
                  autoFocus
                />
              </div>

              {variantType === 'full' && (
                <div className="space-y-4 p-4 border rounded-lg bg-[#F8FAFC] border-[#E2E8F0]">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="variant-classification">Classification *</Label>
                      <Select 
                        value={variantClassification} 
                        onValueChange={(value: ClassificationType) => setVariantClassification(value)}
                      >
                        <SelectTrigger className="bg-white border-[#E2E8F0]">
                          <SelectValue placeholder="Select classification" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-[#E2E8F0]">
                          <SelectItem value="fast">Fast</SelectItem>
                          <SelectItem value="slow">Slow</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="variant-safety-stock-method">Safety Stock Method</Label>
                      <Select 
                        value={variantSafetyStockMethod} 
                        onValueChange={(value: SafetyStockMethod) => setVariantSafetyStockMethod(value)}
                      >
                        <SelectTrigger className="bg-white border-[#E2E8F0]">
                          <SelectValue placeholder="Select method" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-[#E2E8F0]">
                          <SelectItem value="dynamic">Dynamic</SelectItem>
                          <SelectItem value="static">Static</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="variant-service-level">Service Level (%)</Label>
                      <Input
                        id="variant-service-level"
                        type="number"
                        min="0"
                        max="100"
                        value={variantServiceLevel}
                        onChange={(e) => setVariantServiceLevel(Number(e.target.value))}
                        className="bg-white border-[#E2E8F0]"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="variant-fill-rate">Fill Rate (%)</Label>
                      <Input
                        id="variant-fill-rate"
                        type="number"
                        min="0"
                        max="100"
                        value={variantFillRate}
                        onChange={(e) => setVariantFillRate(Number(e.target.value))}
                        className="bg-white border-[#E2E8F0]"
                      />
                    </div>
                  </div>
                </div>
              )}

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setOpenAddVariantDialog(false);
                    setVariantName('');
                    setVariantType('partial');
                    setVariantClassification('fast');
                    setVariantServiceLevel(90);
                    setVariantFillRate(90);
                    setVariantSafetyStockMethod('dynamic');
                    setSelectedGroupForVariant(null);
                  }}
                  className="bg-white border-[#E2E8F0] hover:bg-[#F8FAFC]"
                >
                  Cancel
                </Button>
                <Button onClick={handleAddVariant} disabled={addingVariant} className="bg-[#1E293B] hover:bg-[#0F172A] text-white">
                  {addingVariant && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Add Variant
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>

        {/* Archive Dialog */}
        <AlertDialog open={archiveDialogOpen} onOpenChange={setArchiveDialogOpen}>
          <AlertDialogContent className="bg-white border-[#E2E8F0]">
            <AlertDialogHeader>
              <AlertDialogTitle>Archive Product Group</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to archive the product group "
                <strong>{selectedGroup?.name}</strong>"?
                <br />
                <span className="text-sm text-[#64748B]">
                  This action can be undone by unarchiving the group.
                </span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-white border-[#E2E8F0] hover:bg-[#F8FAFC]">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleArchive}
                className="bg-[#DC2626] text-white hover:bg-[#B91C1C]"
                disabled={archiving}
              >
                {archiving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Archive
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Unarchive Dialog */}
        <AlertDialog open={unarchiveDialogOpen} onOpenChange={setUnarchiveDialogOpen}>
          <AlertDialogContent className="bg-white border-[#E2E8F0]">
            <AlertDialogHeader>
              <AlertDialogTitle>Unarchive Product Group</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to unarchive the product group "
                <strong>{selectedGroup?.name}</strong>"?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-white border-[#E2E8F0] hover:bg-[#F8FAFC]">Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleUnarchive} disabled={unarchiving} className="bg-[#1E293B] hover:bg-[#0F172A] text-white">
                {unarchiving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Unarchive
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default ProductGroupsPage;