'use client';

import React, { useState, useEffect } from 'react';
import { getAccounts,
  createAccount,
  getAvailablePermissions,
  updateAccount,
  deleteAccount,
  changePassword,
  grantPermission,
  revokePermission,
  getAccountWithPermissions, } from '@/lib/data/routes/account/account';
import { Account, Permission, AccountPermission } from '@/lib/types';
import AccountTable from './AccountTable';
import CreateAccountModal from './CreateAccountModal';
import EditAccountModal from './EditAccountModal';
import ChangePasswordModal from './ChangePasswordModal';
import ArchiveAccountModal from './ArchiveAccountModal';
import PermissionManager from './AccountPermissionManager';
import {
  UserPlus,
  Shield,
  Lock,
  User,
  RefreshCw,
  AlertCircle,
  Package,
} from 'lucide-react';
import toast from 'react-hot-toast';

export type AccountRole = 'admin' | 'staff' | 'manager';

export interface AccountDisplay extends Omit<Account, 'role'> {
  role: AccountRole;
  isActive: boolean;
  permissions?: AccountPermission[];
}

// Helper function to extract error message from API response
const getErrorMessage = (error: any): string => {
  console.error('❌ API Error Details:', error);
  
  if (error.response?.data?.error) {
    // Extract the exact error message from the API response
    return error.response.data.error;
  } else if (error.response?.data?.message) {
    // Fallback to message if error field doesn't exist
    return error.response.data.message;
  } else if (error.message) {
    // Use the error message
    return error.message;
  } else if (error.response?.status) {
    // Generic error based on status code
    switch (error.response.status) {
      case 400:
        return 'Bad request. Please check your input.';
      case 401:
        return 'Unauthorized. Please log in again.';
      case 403:
        return 'Forbidden. You do not have permission to perform this action.';
      case 404:
        return 'Resource not found.';
      case 409:
        return 'Conflict. This action cannot be performed.';
      case 422:
        return 'Validation error. Please check your input.';
      case 500:
        return 'Internal server error. Please try again later.';
      default:
        return `Error: ${error.response.status}`;
    }
  }
  
  return 'An unexpected error occurred. Please try again.';
};

const AccountManager: React.FC = () => {
  const [accounts, setAccounts] = useState<AccountDisplay[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<any>(null);
  const [selectedAccount, setSelectedAccount] = useState<AccountDisplay | null>(null);
  const [refreshingAccount, setRefreshingAccount] = useState<string | null>(null);
  
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);

  // Helper to convert API Account to AccountDisplay
  const toAccountDisplay = (account: Account): AccountDisplay => {
    const role = account.role as AccountRole;
    const isActive = account.deletedAt === null;
    
    return {
      ...account,
      role,
      isActive,
      permissions: account.permissions || []
    };
  };

  // Fetch all accounts
  const fetchAccounts = async () => {
    try {
      const accountsData = await getAccounts();
      if (accountsData) {
        const displayAccounts = accountsData.map(toAccountDisplay);
        setAccounts(displayAccounts);
      }
      setFetchError(null);
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setFetchError(err);
      toast.error(errorMessage);
      console.error(err);
    }
  };

  // Fetch permissions
  const fetchPermissions = async () => {
    try {
      const permissionsData = await getAvailablePermissions();
      if (permissionsData) {
        setPermissions(permissionsData);
      }
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      toast.error(errorMessage);
      console.error('Failed to fetch permissions:', err);
    }
  };

  // Fetch initial data
  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchAccounts(), fetchPermissions()]);
    } catch (err) {
      setFetchError(err);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch a single account with permissions
  const fetchAccountPermissions = async (accountId: string) => {
    try {
      setRefreshingAccount(accountId);
      const accountData = await getAccountWithPermissions(accountId);
      
      if (accountData) {
        const displayAccount = toAccountDisplay(accountData);
        
        // Update the account in the list
        setAccounts(prev => prev.map(acc => 
          acc.id === accountId ? displayAccount : acc
        ));
        
        // Update selected account if it's the same one
        if (selectedAccount?.id === accountId) {
          setSelectedAccount(displayAccount);
        }
      }
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      toast.error(errorMessage);
      console.error('Failed to fetch account permissions:', err);
    } finally {
      setRefreshingAccount(null);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Account Actions with toast notifications
  const handleCreateAccount = async (data: {
    username: string;
    password: string;
    role: AccountRole;
    permissions: string[];
  }) => {
    try {
      const apiData = {
        username: data.username,
        password: data.password,
        role: data.role,
        permissions: data.permissions
      };
      await createAccount(apiData);
      await fetchAccounts();
      setIsCreateModalOpen(false);
      toast.success('Account created successfully');
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      toast.error(errorMessage);
      throw err;
    }
  };

  const handleUpdateAccount = async (id: string, data: { username: string; role: AccountRole }) => {
    try {
      await updateAccount(id, data);
      await fetchAccounts();
      setIsEditModalOpen(false);
      toast.success('Account updated successfully');
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      toast.error(errorMessage);
      throw err;
    }
  };

  const handleDeleteAccount = async (id: string) => {
    try {
      await deleteAccount(id);
      await fetchAccounts();
      setIsArchiveModalOpen(false);
      setSelectedAccount(null);
      toast.success('Account archived successfully');
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      toast.error(errorMessage);
      throw err;
    }
  };

  const handleChangePassword = async (id: string, password: string) => {
    try {
      await changePassword(id, { password });
      setIsChangePasswordModalOpen(false);
      setSelectedAccount(null);
      toast.success('Password changed successfully');
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      toast.error(errorMessage);
      throw err;
    }
  };

  const handleGrantPermission = async (accountId: string, permissionId: string) => {
    try {
      await grantPermission(accountId, permissionId);
      // Refresh the account's permissions
      await fetchAccountPermissions(accountId);
      toast.success('Permission granted successfully');
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      toast.error(errorMessage);
      throw err;
    }
  };

  const handleRevokePermission = async (accountId: string, permissionId: string) => {
    try {
      await revokePermission(accountId, permissionId);
      // Refresh the account's permissions
      await fetchAccountPermissions(accountId);
      toast.success('Permission revoked successfully');
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      toast.error(errorMessage);
      throw err;
    }
  };

  // Handlers for UI actions
  const handleEditClick = (account: AccountDisplay) => {
    setSelectedAccount(account);
    setIsEditModalOpen(true);
  };

  const handleChangePasswordClick = (account: AccountDisplay) => {
    setSelectedAccount(account);
    setIsChangePasswordModalOpen(true);
  };

  const handleArchiveClick = (account: AccountDisplay) => {
    setSelectedAccount(account);
    setIsArchiveModalOpen(true);
  };

  const handleManagePermissionsClick = async (account: AccountDisplay) => {
    setSelectedAccount(account);
    setIsPermissionModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F1F5F9] p-6">
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
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 w-full bg-[#E2E8F0] rounded-lg animate-pulse"></div>
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
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div className="flex items-center gap-4 mb-4 lg:mb-0">
            <div className="relative">
              <div className="bg-[#1E293B] p-3 rounded-xl">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#16A34A] border-2 border-white rounded-full"></div>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#0F172A] mb-2">
                Account Management
              </h1>
              <p className="text-[#64748B] text-lg">
                Manage user accounts and permissions
              </p>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="text-xs flex items-center gap-2 bg-[#1E293B] hover:bg-[#0F172A] text-white px-4 py-2.5 rounded-lg transition-all duration-200 font-medium"
            >
              <UserPlus className="h-4 w-4" />
              Create Account
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 hover:shadow-sm transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#64748B] mb-2">TOTAL ACCOUNTS</p>
                <p className="text-3xl font-bold text-[#0F172A]">
                  {accounts.length}
                </p>
                <p className="text-sm text-[#64748B] mt-1">User accounts</p>
              </div>
              <div className="bg-[#F1F5F9] p-3 rounded-lg">
                <User className="h-6 w-6 text-[#1E293B]" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 hover:shadow-sm transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#64748B] mb-2">ACTIVE ACCOUNTS</p>
                <p className="text-3xl font-bold text-[#16A34A]">
                  {accounts.filter(a => a.isActive).length}
                </p>
                <p className="text-sm text-[#64748B] mt-1">Currently active</p>
              </div>
              <div className="bg-[#F0FDF4] p-3 rounded-lg">
                <Shield className="h-6 w-6 text-[#16A34A]" />
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
                <Lock className="h-6 w-6 text-[#334155]" />
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
                  Failed to Load Accounts
                </h3>
                <p className="text-[#64748B] mb-6">
                  {fetchError?.message || 'There was an error fetching your account data.'}
                  {fetchError?.status && ` (Status: ${fetchError.status})`}
                </p>
                <button
                  onClick={() => fetchData()}
                  className="bg-[#DC2626] hover:bg-[#B91C1C] text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200"
                >
                  Retry Loading
                </button>
              </div>
            </div>
          ) : accounts.length === 0 ? (
            <div className="text-center py-20">
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-10 max-w-md mx-auto">
                <div className="bg-white p-4 rounded-xl w-20 h-20 mx-auto mb-6">
                  <User className="h-10 w-10 text-[#64748B] mx-auto" />
                </div>
                <h3 className="text-2xl font-bold text-[#0F172A] mb-3">
                  No Accounts Found
                </h3>
                <p className="text-[#64748B] mb-6">
                  Start by creating your first user account.
                </p>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center justify-center gap-2 bg-[#1E293B] hover:bg-[#0F172A] text-white px-4 py-2.5 rounded-lg transition-all duration-200 font-medium"
                  >
                    <UserPlus className="h-4 w-4" />
                    Create Account
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4">
              <AccountTable
                accounts={accounts}
                onEdit={handleEditClick}
                onChangePassword={handleChangePasswordClick}
                onArchive={handleArchiveClick}
                onManagePermissions={handleManagePermissionsClick}
                refreshingAccount={refreshingAccount}
              />

              {accounts.length > 0 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#E2E8F0]">
                  <div className="text-sm text-[#64748B]">
                    Total: {accounts.length} account{accounts.length !== 1 ? 's' : ''}
                  </div>
                  <div className="text-sm text-[#64748B]">
                    <Shield className="inline h-3 w-3 mr-1" />
                    Active: {accounts.filter(a => a.isActive).length} accounts
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modals */}
        <CreateAccountModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateAccount}
          permissions={permissions}
        />

        {selectedAccount && (
          <>
            <EditAccountModal
              isOpen={isEditModalOpen}
              onClose={() => setIsEditModalOpen(false)}
              account={selectedAccount}
              onSubmit={(data) => handleUpdateAccount(selectedAccount.id, data)}
            />

            <ChangePasswordModal
              isOpen={isChangePasswordModalOpen}
              onClose={() => setIsChangePasswordModalOpen(false)}
              account={selectedAccount}
              onSubmit={(password) => handleChangePassword(selectedAccount.id, password)}
            />

            <ArchiveAccountModal
              isOpen={isArchiveModalOpen}
              onClose={() => setIsArchiveModalOpen(false)}
              account={selectedAccount}
              onConfirm={() => handleDeleteAccount(selectedAccount.id)}
            />

            <PermissionManager
              isOpen={isPermissionModalOpen}
              onClose={() => setIsPermissionModalOpen(false)}
              account={selectedAccount}
              allPermissions={permissions}
              onGrantPermission={(permissionId) => handleGrantPermission(selectedAccount.id, permissionId)}
              onRevokePermission={(permissionId) => handleRevokePermission(selectedAccount.id, permissionId)}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default AccountManager;