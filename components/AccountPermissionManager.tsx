import React, { useState, useEffect } from 'react';
import { Permission, AccountRole } from '@/lib/types';
import { AccountDisplay } from './AccountManagement';
import { getAccountWithPermissions } from '@/lib/data/routes/account/account';
import {
  X,
  Loader2,
  Shield,
  Check,
  AlertCircle,
  RefreshCw,
  Layers,
} from 'lucide-react';

interface PermissionManagerProps {
  isOpen: boolean;
  onClose: () => void;
  account: AccountDisplay;
  allPermissions: Permission[];
  onGrantPermission: (permissionId: string) => Promise<void>;
  onRevokePermission: (permissionId: string) => Promise<void>;
}

const PermissionManager: React.FC<PermissionManagerProps> = ({
  isOpen,
  onClose,
  account: initialAccount,
  allPermissions,
  onGrantPermission,
  onRevokePermission,
}) => {
  const [account, setAccount] = useState<AccountDisplay>(initialAccount);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const fetchAccountPermissions = async () => {
      if (isOpen) {
        try {
          setRefreshing(true);
          const accountData = await getAccountWithPermissions(initialAccount.id);
          
          if (accountData) {
            const updatedAccount = {
              ...accountData,
              role: accountData.role as AccountRole,
              isActive: accountData.deletedAt === null,
              permissions: accountData.permissions || []
            };
            setAccount(updatedAccount);
          }
        } catch (err: any) {
          console.error('Failed to fetch account permissions:', err);
          setError(`Failed to load permissions: ${err.message}`);
        } finally {
          setRefreshing(false);
        }
      }
    };

    fetchAccountPermissions();
  }, [isOpen, initialAccount.id]);

  const hasPermission = (permissionId: string) => {
    return account.permissions?.some(perm => perm.id === permissionId) || false;
  };

  const handleTogglePermission = async (permissionId: string) => {
    setError(null);
    setLoading(permissionId);

    try {
      const isCurrentlyGranted = hasPermission(permissionId);

      if (isCurrentlyGranted) {
        await onRevokePermission(permissionId);
      } else {
        await onGrantPermission(permissionId);
      }

      const accountData = await getAccountWithPermissions(account.id);
      if (accountData) {
        const updatedAccount = {
          ...accountData,
          role: accountData.role as AccountRole,
          isActive: accountData.deletedAt === null,
          permissions: accountData.permissions || []
        };
        setAccount(updatedAccount);
      }
    } catch (err: any) {
      console.error("Permission toggle error:", err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update permission';
      setError(errorMessage);
      
      setAccount(prev => ({
        ...prev,
        permissions: prev.permissions || []
      }));
    } finally {
      setLoading(null);
    }
  };

  const handleClose = () => {
    setError(null);
    setLoading(null);
    onClose();
  };

  if (!isOpen) return null;

  // Group permissions by module if available
  const permissionsByModule = allPermissions.reduce((acc, permission) => {
    const module = permission.module || permission.description || 'General';
    if (!acc[module]) {
      acc[module] = [];
    }
    acc[module].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  const totalPermissions = allPermissions.length;
  const grantedPermissions = account.permissions?.length || 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white border border-[#E2E8F0] rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Shield className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#0F172A]">Manage Permissions</h2>
                <div className="flex items-center gap-2 text-sm text-[#64748B]">
                  <span>Account: <strong>{account.username}</strong></span>
                  <span>•</span>
                  <span>Role: <span className="capitalize">{account.role}</span></span>
                  {refreshing && (
                    <span className="ml-2 flex items-center gap-1 text-blue-500">
                      <RefreshCw className="h-3 w-3 animate-spin" />
                      Refreshing...
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button 
              onClick={handleClose} 
              className="text-[#64748B] hover:text-[#0F172A] transition-colors p-1 hover:bg-[#F8FAFC] rounded"
              disabled={loading !== null}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md mb-6">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <div className="font-medium">Error</div>
              </div>
              <div className="text-sm mt-1">{error}</div>
            </div>
          )}

          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-[#64748B]" />
                <h3 className="text-lg font-medium text-[#0F172A]">Available Permissions</h3>
              </div>
              <div className="text-sm text-[#64748B] bg-[#F8FAFC] px-3 py-1.5 rounded-full">
                {grantedPermissions} of {totalPermissions} permissions granted
              </div>
            </div>
          </div>

          <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
            {Object.entries(permissionsByModule).map(([module, modulePermissions]) => (
              <div key={module} className="border border-[#E2E8F0] rounded-lg overflow-hidden">
                <div className="bg-[#F8FAFC] px-4 py-3 border-b border-[#E2E8F0]">
                  <h4 className="font-medium text-[#0F172A]">{module}</h4>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {modulePermissions.map((permission) => {
                      const isGranted = hasPermission(permission.id);
                      const isProcessing = loading === permission.id;

                      return (
                        <div
                          key={permission.id}
                          className={`flex items-center justify-between p-3 border rounded-lg transition-all duration-200 ${
                            isGranted ? 'border-purple-200 bg-purple-50' : 'border-[#E2E8F0] hover:bg-[#F8FAFC]'
                          } ${isProcessing ? 'opacity-50' : ''}`}
                        >
                          <div className="flex items-center flex-1">
                            <div className="flex items-center h-5">
                              <input
                                type="checkbox"
                                id={`perm-toggle-${permission.id}`}
                                checked={isGranted}
                                onChange={() => handleTogglePermission(permission.id)}
                                disabled={isProcessing || refreshing}
                                className="h-4 w-4 text-purple-600 border-[#E2E8F0] rounded focus:ring-purple-500"
                              />
                            </div>
                            <label
                              htmlFor={`perm-toggle-${permission.id}`}
                              className="ml-3 cursor-pointer flex-1"
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="text-sm font-medium text-[#0F172A]">{permission.name}</div>
                                  {permission.description && (
                                    <div className="text-xs text-[#64748B] mt-0.5">
                                      {permission.description}
                                    </div>
                                  )}
                                </div>
                                {isGranted && (
                                  <Check className="h-4 w-4 text-green-500" />
                                )}
                              </div>
                            </label>
                          </div>
                          <div className="ml-3">
                            {isProcessing ? (
                              <Loader2 className="h-4 w-4 text-purple-500 animate-spin" />
                            ) : (
                              <span className={`text-xs px-2 py-1 rounded ${
                                isGranted 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-[#E2E8F0] text-[#64748B]'
                              }`}>
                                {isGranted ? 'Granted' : 'Not Granted'}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-6 border-t border-[#E2E8F0] mt-6">
            <button
              onClick={handleClose}
              className="px-4 py-2.5 border border-[#E2E8F0] text-[#64748B] rounded-lg hover:bg-[#F8FAFC] transition-colors text-sm font-medium"
              disabled={loading !== null}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PermissionManager;