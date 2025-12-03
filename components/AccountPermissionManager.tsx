
import React, { useState, useEffect } from 'react';
import { Permission, AccountRole } from '@/lib/types';
import { AccountDisplay } from './AccountManagement';
import { getAccountWithPermissions, grantPermission, revokePermission } from '@/lib/data/routes/account/account';

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
          console.log("Fetching account permissions for account:", initialAccount.id);
          setRefreshing(true);
          const accountData = await getAccountWithPermissions(initialAccount.id);
          
          if (accountData) {
            console.log("Received account data with permissions:", accountData.permissions?.length);
            const updatedAccount = {
              ...accountData,
              role: accountData.role as AccountRole,
              isActive: accountData.deletedAt === null,
              permissions: accountData.permissions || []
            };
            setAccount(updatedAccount);
          } else {
            console.error("No account data received");
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
    const hasPerm = account.permissions?.some(perm => perm.id === permissionId) || false;
    console.log(`Checking permission ${permissionId}: ${hasPerm ? 'granted' : 'not granted'}`);
    return hasPerm;
  };

  const handleTogglePermission = async (permissionId: string) => {
    setError(null);
    setLoading(permissionId);

    try {
      const isCurrentlyGranted = hasPermission(permissionId);
      console.log(`Toggling permission ${permissionId}: currently ${isCurrentlyGranted ? 'granted' : 'not granted'}`);

      if (isCurrentlyGranted) {
        console.log(`Calling revokePermission for ${permissionId}`);
        await onRevokePermission(permissionId);
      } else {
        console.log(`Calling grantPermission for ${permissionId}`);
        await onGrantPermission(permissionId);
      }
      

      console.log("Refreshing account permissions after update");
      const accountData = await getAccountWithPermissions(account.id);
      if (accountData) {
        console.log("Updated permissions received:", accountData.permissions);
        const updatedAccount = {
          ...accountData,
          role: accountData.role as AccountRole,
          isActive: accountData.deletedAt === null,
          permissions: accountData.permissions || []
        };
        setAccount(updatedAccount);
      } else {
        console.error("No updated account data received");
      }
    } catch (err: any) {
      console.error("Permission toggle error:", err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update permission';
      setError(errorMessage);
      
      // Revert the UI state on error
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
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold">Manage Permissions</h2>
              <p className="text-gray-600">
                Account: <strong>{account.username}</strong> | Role: <span className="capitalize">{account.role}</span>
                {refreshing && (
                  <span className="ml-2 text-sm text-blue-500">
                    <svg className="inline animate-spin h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Refreshing...
                  </span>
                )}
              </p>
            </div>
            <button 
              onClick={handleClose} 
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={loading !== null}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md mb-4">
              <div className="font-medium">Error</div>
              <div className="text-sm">{error}</div>
            </div>
          )}

          <div className="mb-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Available Permissions</h3>
              <div className="text-sm text-gray-500">
                {grantedPermissions} of {totalPermissions} permissions granted
              </div>
            </div>
          </div>

          <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
            {Object.entries(permissionsByModule).map(([module, modulePermissions]) => (
              <div key={module} className="border border-gray-200 rounded-lg">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <h4 className="font-medium text-gray-900">{module}</h4>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {modulePermissions.map((permission) => {
                      const isGranted = hasPermission(permission.id);
                      const isProcessing = loading === permission.id;

                      return (
                        <div
                          key={permission.id}
                          className={`flex items-center justify-between p-3 border rounded-md transition-colors ${
                            isGranted ? 'border-blue-200 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
                          } ${isProcessing ? 'opacity-50' : ''}`}
                        >
                          <div className="flex items-center flex-1">
                            <input
                              type="checkbox"
                              id={`perm-toggle-${permission.id}`}
                              checked={isGranted}
                              onChange={() => handleTogglePermission(permission.id)}
                              disabled={isProcessing || refreshing}
                              className="mr-3"
                            />
                            <label
                              htmlFor={`perm-toggle-${permission.id}`}
                              className="font-medium cursor-pointer text-sm flex-1"
                            >
                              <div className="text-gray-900">{permission.name}</div>
                              {permission.description && (
                                <div className="text-gray-500 text-xs mt-0.5">
                                  {permission.description}
                                </div>
                              )}
                            </label>
                          </div>
                          <div className="flex items-center">
                            {isProcessing ? (
                              <svg className="animate-spin h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                            ) : (
                              <span className={`text-xs px-2 py-1 rounded ${
                                isGranted 
                                  ? 'bg-blue-100 text-blue-800' 
                                  : 'bg-gray-100 text-gray-800'
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

          <div className="flex justify-end pt-6 border-t mt-6">
            <button
              onClick={handleClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
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