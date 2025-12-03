
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

export type AccountRole = 'admin' | 'staff' | 'manager';

export interface AccountDisplay extends Omit<Account, 'role'> {
  role: AccountRole;
  isActive: boolean;
  permissions?: AccountPermission[];
}

const AccountManager: React.FC = () => {
  const [accounts, setAccounts] = useState<AccountDisplay[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
      setError(null);
    } catch (err) {
      setError('Failed to fetch accounts');
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
      console.error('Failed to fetch permissions:', err);
    }
  };

  // Fetch initial data
  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchAccounts(), fetchPermissions()]);
    } catch (err) {
      setError('Failed to fetch data');
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
      console.error('Failed to fetch account permissions:', err);
    } finally {
      setRefreshingAccount(null);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Account Actions
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
    } catch (err) {
      throw err;
    }
  };

  const handleUpdateAccount = async (id: string, data: { username: string; role: AccountRole }) => {
    try {
      await updateAccount(id, data);
      await fetchAccounts();
      setIsEditModalOpen(false);
    } catch (err) {
      throw err;
    }
  };

  const handleDeleteAccount = async (id: string) => {
    try {
      await deleteAccount(id);
      await fetchAccounts();
      setIsArchiveModalOpen(false);
      setSelectedAccount(null);
    } catch (err) {
      throw err;
    }
  };

  const handleChangePassword = async (id: string, password: string) => {
    try {
      await changePassword(id, { password });
      setIsChangePasswordModalOpen(false);
      setSelectedAccount(null);
    } catch (err) {
      throw err;
    }
  };

  const handleGrantPermission = async (accountId: string, permissionId: string) => {
    try {
      await grantPermission(accountId, permissionId);
      // Refresh the account's permissions
      await fetchAccountPermissions(accountId);
    } catch (err) {
      throw err;
    }
  };

  const handleRevokePermission = async (accountId: string, permissionId: string) => {
    try {
      await revokePermission(accountId, permissionId);
      // Refresh the account's permissions
      await fetchAccountPermissions(accountId);
    } catch (err) {
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

  if (loading) return <div className="p-6">Loading accounts...</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Account Management</h1>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Create New Account
        </button>
      </div>

      <AccountTable
        accounts={accounts}
        onEdit={handleEditClick}
        onChangePassword={handleChangePasswordClick}
        onArchive={handleArchiveClick}
        onManagePermissions={handleManagePermissionsClick}
        refreshingAccount={refreshingAccount}
      />

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
  );
};

export default AccountManager;