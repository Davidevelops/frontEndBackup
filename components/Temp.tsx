"use client";

import React, { useState, useEffect } from 'react';
import { ProductGroup, CreateProductGroupDto, UpdateProductGroupDto, ClassificationType } from '@/lib/types';
import { productGroupsApi } from '@/lib/data/routes/temp/service';
import toast from 'react-hot-toast';
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
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
  MoreHorizontal,
  Plus,
  RefreshCw,
  Edit,
  Archive,
  Undo2,
  Loader2,
  Settings,
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

const ProductGroupsPage: React.FC = () => {
  // State
  const [productGroups, setProductGroups] = useState<ProductGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Dialog states
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [unarchiveDialogOpen, setUnarchiveDialogOpen] = useState(false);
  
  // Form states
  const [newGroupName, setNewGroupName] = useState('');
  const [editGroupName, setEditGroupName] = useState('');
  
  // Advanced settings states
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [classification, setClassification] = useState<ClassificationType>('fast');
  const [serviceLevel, setServiceLevel] = useState<number>(90);
  const [fillRate, setFillRate] = useState<number>(90);
  const [safetyStockMethod, setSafetyStockMethod] = useState<string>('dynamic');
  
  // Edit settings states
  const [showEditAdvancedSettings, setShowEditAdvancedSettings] = useState(false);
  const [editClassification, setEditClassification] = useState<ClassificationType>('fast');
  const [editServiceLevel, setEditServiceLevel] = useState<number>(90);
  const [editFillRate, setEditFillRate] = useState<number>(90);
  const [editSafetyStockMethod, setEditSafetyStockMethod] = useState<string>('dynamic');
  
  // Selected group for operations
  const [selectedGroup, setSelectedGroup] = useState<ProductGroup | null>(null);
  
  // Loading states for actions
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [unarchiving, setUnarchiving] = useState(false);

  // Fetch product groups
  const fetchProductGroups = async () => {
    try {
      setLoading(true);
      setError(null);
      const groups = await productGroupsApi.getAll();
      setProductGroups(groups);
    } catch (err: any) {
      console.error('Failed to fetch product groups:', err);
      setError(err.message || 'Failed to load product groups');
      toast.error('Failed to load product groups');
      setProductGroups([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchProductGroups();
  }, []);

  // Create product group
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

      // Add advanced settings if enabled
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
      
      // Always refresh to get the complete data from server
      await fetchProductGroups();
      
      // Reset form
      setNewGroupName('');
      setShowAdvancedSettings(false);
      setClassification('fast');
      setServiceLevel(90);
      setFillRate(90);
      setSafetyStockMethod('dynamic');
      
      // Close dialog
      setOpenCreateDialog(false);
      
      toast.success('Product group created successfully');
    } catch (err: any) {
      console.error('Failed to create product group:', err);
      toast.error(err.message || 'Failed to create product group');
    } finally {
      setCreating(false);
    }
  };

  // Update product group
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

      // Add advanced settings if enabled
      if (showEditAdvancedSettings) {
        updateData.setting = {
          classification: editClassification,
          serviceLevel: editServiceLevel,
          fillRate: editFillRate,
          safetyStockCalculationMethod: editSafetyStockMethod,
        };
      }

      const updatedGroup = await productGroupsApi.update(selectedGroup.id, updateData);
      
      // Update local state
      setProductGroups(prev =>
        prev.map(group =>
          group.id === selectedGroup.id ? updatedGroup : group
        )
      );
      
      // Reset and close dialog
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

  // Archive product group
  const handleArchive = async () => {
    if (!selectedGroup) return;

    setArchiving(true);

    try {
      await productGroupsApi.archive(selectedGroup.id);
      
      // Update local state (remove archived group)
      setProductGroups(prev =>
        prev.filter(group => group.id !== selectedGroup.id)
      );
      
      // Close dialog
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

  // Unarchive product group
  const handleUnarchive = async () => {
    if (!selectedGroup) return;

    setUnarchiving(true);

    try {
      const unarchivedGroup = await productGroupsApi.unarchive(selectedGroup.id);
      
      // Update local state (add unarchived group back)
      setProductGroups(prev => [...prev, unarchivedGroup]);
      
      // Close dialog
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

  // Open edit dialog
  const openEditDialogHandler = (group: ProductGroup) => {
    setSelectedGroup(group);
    setEditGroupName(group.name);
    
    // Load existing settings if they exist
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

  // Open archive dialog
  const openArchiveDialogHandler = (group: ProductGroup) => {
    setSelectedGroup(group);
    setArchiveDialogOpen(true);
  };

  // Open unarchive dialog
  const openUnarchiveDialogHandler = (group: ProductGroup) => {
    setSelectedGroup(group);
    setUnarchiveDialogOpen(true);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Calculate total products in group
  const getTotalProducts = (group: ProductGroup) => {
    return group.products?.length || 0;
  };

  // Get classification badge
  const getClassificationBadge = (group: ProductGroup) => {
    if (!group.setting?.classification) return null;
    
    return (
      <Badge 
        variant="outline" 
        className={
          group.setting.classification === 'fast' 
            ? "bg-blue-50 text-blue-700 border-blue-200" 
            : "bg-amber-50 text-amber-700 border-amber-200"
        }
      >
        {group.setting.classification}
      </Badge>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-10 w-40" />
          </div>
          <Card>
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
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Product Groups</h1>
          <p className="text-muted-foreground">
            Manage your product groups and categories
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchProductGroups}
            disabled={loading}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={() => setOpenCreateDialog(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            New Group
          </Button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md mb-6">
          <p className="text-sm">{error}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={fetchProductGroups}
          >
            Retry
          </Button>
        </div>
      )}

      {/* Product Groups Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Product Groups</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Classification</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {productGroups.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="text-center">
                      <p className="text-muted-foreground">
                        {loading ? 'Loading...' : 'No product groups found'}
                      </p>
                      <Button
                        variant="outline"
                        className="mt-2"
                        onClick={() => setOpenCreateDialog(true)}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Create your first group
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                productGroups.map((group) => (
                  <TableRow key={group.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      <div>
                        <p className="font-semibold">{group.name}</p>
                        <p className="text-xs text-muted-foreground">
                          ID: {group.id?.slice(0, 8) || 'N/A'}...
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getTotalProducts(group)} product{getTotalProducts(group) !== 1 ? 's' : ''}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {getClassificationBadge(group) || (
                        <span className="text-muted-foreground text-sm">Not set</span>
                      )}
                    </TableCell>
                    <TableCell>{group.createdAt ? formatDate(group.createdAt) : 'N/A'}</TableCell>
                    <TableCell>{group.updatedAt ? formatDate(group.updatedAt) : 'N/A'}</TableCell>
                    <TableCell>
                      <Badge
                        variant={group.deletedAt ? "secondary" : "default"}
                        className={
                          group.deletedAt
                            ? "bg-gray-100 text-gray-800 hover:bg-gray-200"
                            : "bg-green-50 text-green-700 hover:bg-green-100"
                        }
                      >
                        {group.deletedAt ? 'Archived' : 'Active'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <TooltipProvider>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {group.deletedAt ? (
                              <DropdownMenuItem
                                onClick={() => openUnarchiveDialogHandler(group)}
                                className="cursor-pointer"
                              >
                                <Undo2 className="mr-2 h-4 w-4" />
                                Unarchive
                              </DropdownMenuItem>
                            ) : (
                              <>
                                <DropdownMenuItem
                                  onClick={() => openEditDialogHandler(group)}
                                  className="cursor-pointer"
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => openArchiveDialogHandler(group)}
                                  className="cursor-pointer text-destructive focus:text-destructive"
                                >
                                  <Archive className="mr-2 h-4 w-4" />
                                  Archive
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TooltipProvider>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Total groups count */}
          {productGroups.length > 0 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Total: {productGroups.length} group{productGroups.length !== 1 ? 's' : ''}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={openCreateDialog} onOpenChange={setOpenCreateDialog}>
        <DialogContent className="sm:max-w-[525px]">
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
              />
            </div>

            {/* Advanced Settings Toggle */}
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

            {/* Advanced Settings Form */}
            {showAdvancedSettings && (
              <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="classification">Classification *</Label>
                    <Select value={classification} onValueChange={(value: ClassificationType) => setClassification(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select classification" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fast">Fast</SelectItem>
                        <SelectItem value="slow">Slow</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="safety-stock-method">Safety Stock Method</Label>
                    <Select value={safetyStockMethod} onValueChange={setSafetyStockMethod}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                      <SelectContent>
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
              >
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={creating}>
                {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
        <DialogContent className="sm:max-w-[525px]">
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
              />
            </div>

            {/* Advanced Settings Toggle for Edit */}
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

            {/* Advanced Settings Form for Edit */}
            {showEditAdvancedSettings && (
              <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-classification">Classification *</Label>
                    <Select value={editClassification} onValueChange={(value: ClassificationType) => setEditClassification(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select classification" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fast">Fast</SelectItem>
                        <SelectItem value="slow">Slow</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="edit-safety-stock-method">Safety Stock Method</Label>
                    <Select value={editSafetyStockMethod} onValueChange={setEditSafetyStockMethod}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                      <SelectContent>
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
              >
                Cancel
              </Button>
              <Button onClick={handleUpdate} disabled={updating}>
                {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Archive Confirmation Dialog */}
      <AlertDialog open={archiveDialogOpen} onOpenChange={setArchiveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive Product Group</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to archive the product group "
              <strong>{selectedGroup?.name}</strong>"?
              <br />
              <span className="text-sm text-muted-foreground">
                This action can be undone by unarchiving the group.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleArchive}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={archiving}
            >
              {archiving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Archive
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Unarchive Confirmation Dialog */}
      <AlertDialog open={unarchiveDialogOpen} onOpenChange={setUnarchiveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unarchive Product Group</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to unarchive the product group "
              <strong>{selectedGroup?.name}</strong>"?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleUnarchive} disabled={unarchiving}>
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