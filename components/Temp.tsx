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
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

const ProductGroupsPage: React.FC = () => {
  const router = useRouter();
  
 
  const [productGroups, setProductGroups] = useState<ProductGroup[]>([]);
  const [productsByGroup, setProductsByGroup] = useState<Record<string, SingleProduct[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
 
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
      setError(null);
      const groups = await productGroupsApi.getAll();
      setProductGroups(groups);
      

      await fetchProductsForGroups(groups);
      

      calculateStats(groups);
    } catch (err: any) {
      console.error('Failed to fetch product groups:', err);
      setError(err.message || 'Failed to load product groups');
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
      
      // Call the correct API function
      const blob = await exportProductsTemplate({ includeArchived: false });
      
      if (!blob) {
        throw new Error('Export returned empty file');
      }
      
      // Use the downloadBlob utility function
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-10 w-40" />
          </div>
          <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50">
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
 
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-800">Product Groups</h1>
          <p className="text-gray-600">
            Manage your product groups and categories
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
      
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportProducts}
            disabled={exporting}
            className="bg-white/80 backdrop-blur-sm border-gray-300 hover:bg-white flex items-center gap-2"
          >
            <Download className={`h-4 w-4 ${exporting ? 'animate-spin' : ''}`} />
            {exporting ? "Exporting..." : "Export Excel"}
          </Button>

    
   
<label className="cursor-pointer">
  <input
    type="file"
    accept=".xlsx"
    onChange={handleImportProducts}
    disabled={importing}
    className="hidden"
    id="excel-import"
  />
  <div>
    <Button
      variant="outline"
      size="sm"
      disabled={importing}
      className="bg-white/80 backdrop-blur-sm border-gray-300 hover:bg-white flex items-center gap-2 cursor-pointer"
      onClick={() => document.getElementById('excel-import')?.click()}
    >
      <Upload className={`h-4 w-4 ${importing ? 'animate-spin' : ''}`} />
      {importing ? "Importing..." : "Import Excel"}
    </Button>
  </div>
</label>


          <Button
            size="sm"
            onClick={() => setOpenCreateDialog(true)}
            className="bg-gray-800 hover:bg-gray-900 text-white"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Group
          </Button>
        </div>
      </div>

 
      <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50 mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Bulk Operations
              </h3>
              <p className="text-gray-600 text-sm">
                Use Excel files for bulk import/export operations. 
                <span className="text-red-600 font-medium ml-1">
                  Only .xlsx format supported.
                </span>
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-800">
                  {stats.totalGroups} categories
                </p>
                <p className="text-sm text-gray-600">
                  {stats.totalProducts} total products
                </p>
              </div>
              <div className="w-12 h-12 bg-gray-100/50 rounded-lg flex items-center justify-center">
                <Database className="h-6 w-6 text-gray-600" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

 
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Groups</p>
                <h3 className="text-2xl font-bold text-gray-800">{stats.totalGroups}</h3>
              </div>
              <div className="p-3 bg-gray-100/50 rounded-full">
                <Database className="h-6 w-6 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <h3 className="text-2xl font-bold text-gray-800">{stats.totalProducts}</h3>
              </div>
              <div className="p-3 bg-gray-100/50 rounded-full">
                <Package className="h-6 w-6 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Fast Moving</p>
                <h3 className="text-2xl font-bold text-green-600">{stats.fastMoving}</h3>
              </div>
              <div className="p-3 bg-green-100/30 rounded-full">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Slow Moving</p>
                <h3 className="text-2xl font-bold text-amber-600">{stats.slowMoving}</h3>
              </div>
              <div className="p-3 bg-amber-100/30 rounded-full">
                <Filter className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Archived</p>
                <h3 className="text-2xl font-bold text-gray-600">{stats.archivedGroups}</h3>
              </div>
              <div className="p-3 bg-gray-100/50 rounded-full">
                <Archive className="h-6 w-6 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>


      {error && (
        <div className="bg-red-50/80 backdrop-blur-sm text-red-700 px-4 py-3 rounded-md mb-6 border border-red-200/50">
          <p className="text-sm">{error}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2 bg-white/80 border-red-200 hover:bg-white"
            onClick={fetchProductGroups}
          >
            Retry
          </Button>
        </div>
      )}


      <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50">
        <CardHeader>
          <CardTitle className="text-gray-800">All Product Groups</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-gray-200/50">
                <TableHead className="text-gray-700">Name</TableHead>
                <TableHead className="text-gray-700">Product/Variant Count</TableHead>
                <TableHead className="text-gray-700">Products</TableHead>
                <TableHead className="text-gray-700">Created</TableHead>
                <TableHead className="text-gray-700 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {productGroups.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <div className="text-center">
                      <p className="text-gray-600">
                        {loading ? 'Loading...' : 'No product groups found'}
                      </p>
                      <div className="flex flex-col gap-2 mt-3">
                        <Button
                          variant="outline"
                          className="bg-white/80 border-gray-300 hover:bg-white"
                          onClick={() => setOpenCreateDialog(true)}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Create your first group
                        </Button>
                       <label className="cursor-pointer">
  <input
    type="file"
    accept=".xlsx"
    onChange={handleImportProducts}
    className="hidden"
    id="excel-import-empty"
  />
  <Button
    variant="outline"
    className="w-full bg-white/80 border-gray-300 hover:bg-white cursor-pointer"
    onClick={() => document.getElementById('excel-import-empty')?.click()}
  >
    <Upload className="mr-2 h-4 w-4" />
    Import from Excel (.xlsx)
  </Button>
</label>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                productGroups.map((group) => {
                  const products = productsByGroup[group.id] || [];
                  const totalProducts = products.length;
                  const productNames = getProductNames(group.id);
                  
                  return (
                    <TableRow key={group.id} className="hover:bg-gray-50/50 border-gray-200/50">
                      <TableCell className="font-medium">
                        <div>
                          <p className="font-semibold text-gray-800">{group.name}</p>
                          <p className="text-xs text-gray-500">
                            ID: {group.id?.slice(0, 8) || 'N/A'}...
                          </p>
                        </div>
                      </TableCell>
                      
                  
                      <TableCell>
                        <Badge variant="outline" className="min-w-[60px] justify-center bg-white/80 border-gray-300">
                          <Package className="h-3 w-3 mr-1" />
                          {totalProducts} item{totalProducts !== 1 ? 's' : ''}
                        </Badge>
                      </TableCell>
                      
                 
                      <TableCell>
                        {products.length > 0 ? (
                          <div className="flex flex-col gap-1">
                            <p className="text-sm text-gray-700">{productNames}</p>
                            {products.length > 2 && (
                              <p className="text-xs text-gray-500">
                                <GitBranch className="inline h-3 w-3 mr-1" />
                                +{products.length - 2} more
                              </p>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 italic">
                            <Box className="inline h-3 w-3 mr-1" />
                            No products yet
                          </p>
                        )}
                      </TableCell>
                      
                  
                      <TableCell>
                        <div className="flex items-center text-gray-700">
                          <Calendar className="h-3 w-3 mr-1" />
                          {group.createdAt ? formatDate(group.createdAt) : 'N/A'}
                        </div>
                      </TableCell>
                      
                    
                      <TableCell>
                        <div className="flex flex-wrap items-center justify-end gap-2">
                          {/* Add Variant Button */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openAddVariantDialogHandler(group)}
                            className="bg-white/80 border-gray-300 hover:bg-white"
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Add Variant
                          </Button>
                          
                    
                          {products.length === 1 ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigateToProductView(group.id, products[0].id)}
                              className="bg-white/80 border-gray-300 hover:bg-white"
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
                                  className="bg-white/80 border-gray-300 hover:bg-white"
                                >
                                  <BarChart3 className="h-3 w-3 mr-1" />
                                  Forecast
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-white/90 backdrop-blur-sm border-gray-200/50">
                                {products.map((product) => (
                                  <DropdownMenuItem
                                    key={product.id}
                                    onClick={() => navigateToProductView(group.id, product.id)}
                                    className="cursor-pointer hover:bg-gray-100/50"
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
                              className="bg-white/80 border-gray-300"
                            >
                              <BarChart3 className="h-3 w-3 mr-1" />
                              Forecast
                            </Button>
                          )}
                          
               
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialogHandler(group)}
                            className="bg-white/80 border-gray-300 hover:bg-white"
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                    
                          {group.deletedAt ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openUnarchiveDialogHandler(group)}
                              className="bg-white/80 border-gray-300 hover:bg-green-50 hover:text-green-700 hover:border-green-300"
                            >
                              <Undo2 className="h-3 w-3 mr-1" />
                              Unarchive
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openArchiveDialogHandler(group)}
                              className="bg-white/80 border-gray-300 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                            >
                              <Archive className="h-3 w-3 mr-1" />
                              Archive
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>

     
          {productGroups.length > 0 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200/50">
              <div className="text-sm text-gray-600">
                Total: {stats.totalGroups} group{stats.totalGroups !== 1 ? 's' : ''}
              </div>
              <div className="text-sm text-gray-600">
                <Package className="inline h-3 w-3 mr-1" />
                Total products/variants: {stats.totalProducts}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

   
      <Dialog open={openCreateDialog} onOpenChange={setOpenCreateDialog}>
        <DialogContent className="sm:max-w-[525px] bg-white/95 backdrop-blur-sm border-gray-200/50">
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
                className="bg-white/80 border-gray-300"
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
              <div className="space-y-4 p-4 border rounded-lg bg-gray-50/50 border-gray-200/50">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="classification">Classification *</Label>
                    <Select value={classification} onValueChange={(value: ClassificationType) => setClassification(value)}>
                      <SelectTrigger className="bg-white/80 border-gray-300">
                        <SelectValue placeholder="Select classification" />
                      </SelectTrigger>
                      <SelectContent className="bg-white/95 backdrop-blur-sm border-gray-200/50">
                        <SelectItem value="fast">Fast</SelectItem>
                        <SelectItem value="slow">Slow</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="safety-stock-method">Safety Stock Method</Label>
                    <Select value={safetyStockMethod} onValueChange={setSafetyStockMethod}>
                      <SelectTrigger className="bg-white/80 border-gray-300">
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                      <SelectContent className="bg-white/95 backdrop-blur-sm border-gray-200/50">
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
                      className="bg-white/80 border-gray-300"
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
                      className="bg-white/80 border-gray-300"
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
                className="bg-white/80 border-gray-300 hover:bg-white"
              >
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={creating} className="bg-gray-800 hover:bg-gray-900 text-white">
                {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

  
      <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
        <DialogContent className="sm:max-w-[525px] bg-white/95 backdrop-blur-sm border-gray-200/50">
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
                className="bg-white/80 border-gray-300"
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
              <div className="space-y-4 p-4 border rounded-lg bg-gray-50/50 border-gray-200/50">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-classification">Classification *</Label>
                    <Select value={editClassification} onValueChange={(value: ClassificationType) => setEditClassification(value)}>
                      <SelectTrigger className="bg-white/80 border-gray-300">
                        <SelectValue placeholder="Select classification" />
                      </SelectTrigger>
                      <SelectContent className="bg-white/95 backdrop-blur-sm border-gray-200/50">
                        <SelectItem value="fast">Fast</SelectItem>
                        <SelectItem value="slow">Slow</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="edit-safety-stock-method">Safety Stock Method</Label>
                    <Select value={editSafetyStockMethod} onValueChange={setEditSafetyStockMethod}>
                      <SelectTrigger className="bg-white/80 border-gray-300">
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                      <SelectContent className="bg-white/95 backdrop-blur-sm border-gray-200/50">
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
                      className="bg-white/80 border-gray-300"
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
                      className="bg-white/80 border-gray-300"
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
                className="bg-white/80 border-gray-300 hover:bg-white"
              >
                Cancel
              </Button>
              <Button onClick={handleUpdate} disabled={updating} className="bg-gray-800 hover:bg-gray-900 text-white">
                {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

    
      <Dialog open={openAddVariantDialog} onOpenChange={setOpenAddVariantDialog}>
        <DialogContent className="sm:max-w-[525px] bg-white/95 backdrop-blur-sm border-gray-200/50">
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
                    ? 'bg-gray-800 text-white hover:bg-gray-900' 
                    : 'bg-white/80 border-gray-300 hover:bg-white'}
                >
                  Partial
                </Button>
                <Button
                  type="button"
                  variant={variantType === 'full' ? 'default' : 'outline'}
                  onClick={() => setVariantType('full')}
                  className={variantType === 'full' 
                    ? 'bg-gray-800 text-white hover:bg-gray-900' 
                    : 'bg-white/80 border-gray-300 hover:bg-white'}
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
                className="bg-white/80 border-gray-300"
                autoFocus
              />
            </div>

            
            {variantType === 'full' && (
              <div className="space-y-4 p-4 border rounded-lg bg-gray-50/50 border-gray-200/50">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="variant-classification">Classification *</Label>
                    <Select 
                      value={variantClassification} 
                      onValueChange={(value: ClassificationType) => setVariantClassification(value)}
                    >
                      <SelectTrigger className="bg-white/80 border-gray-300">
                        <SelectValue placeholder="Select classification" />
                      </SelectTrigger>
                      <SelectContent className="bg-white/95 backdrop-blur-sm border-gray-200/50">
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
                      <SelectTrigger className="bg-white/80 border-gray-300">
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                      <SelectContent className="bg-white/95 backdrop-blur-sm border-gray-200/50">
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
                      className="bg-white/80 border-gray-300"
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
                      className="bg-white/80 border-gray-300"
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
                className="bg-white/80 border-gray-300 hover:bg-white"
              >
                Cancel
              </Button>
              <Button onClick={handleAddVariant} disabled={addingVariant} className="bg-gray-800 hover:bg-gray-900 text-white">
                {addingVariant && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Variant
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      
      <AlertDialog open={archiveDialogOpen} onOpenChange={setArchiveDialogOpen}>
        <AlertDialogContent className="bg-white/95 backdrop-blur-sm border-gray-200/50">
          <AlertDialogHeader>
            <AlertDialogTitle>Archive Product Group</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to archive the product group "
              <strong>{selectedGroup?.name}</strong>"?
              <br />
              <span className="text-sm text-gray-600">
                This action can be undone by unarchiving the group.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/80 border-gray-300 hover:bg-white">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleArchive}
              className="bg-red-600 text-white hover:bg-red-700"
              disabled={archiving}
            >
              {archiving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Archive
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

     
      <AlertDialog open={unarchiveDialogOpen} onOpenChange={setUnarchiveDialogOpen}>
        <AlertDialogContent className="bg-white/95 backdrop-blur-sm border-gray-200/50">
          <AlertDialogHeader>
            <AlertDialogTitle>Unarchive Product Group</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to unarchive the product group "
              <strong>{selectedGroup?.name}</strong>"?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/80 border-gray-300 hover:bg-white">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleUnarchive} disabled={unarchiving} className="bg-gray-800 hover:bg-gray-900 text-white">
              {unarchiving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Unarchive
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProductGroupsPage;