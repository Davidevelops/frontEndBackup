
import React from 'react';
import { AccountDisplay } from './AccountManagement';

interface AccountTableProps {
  accounts: AccountDisplay[];
  onEdit: (account: AccountDisplay) => void;
  onChangePassword: (account: AccountDisplay) => void;
  onArchive: (account: AccountDisplay) => void;
  onManagePermissions: (account: AccountDisplay) => void;
  refreshingAccount?: string | null;
}

const AccountTable: React.FC<AccountTableProps> = ({
  accounts,
  onEdit,
  onChangePassword,
  onArchive,
  onManagePermissions,
  refreshingAccount,
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (accounts.length === 0) {
    return (
      <div className="text-center py-8 border border-gray-200 rounded-lg">
        <p className="text-gray-500">No accounts found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-gray-200 rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Username
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Role
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Created
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Permissions
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {accounts.map((account) => (
            <tr 
              key={account.id} 
              className={`hover:bg-gray-50 transition-colors ${
                refreshingAccount === account.id ? 'bg-blue-50' : ''
              }`}
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="font-medium text-gray-900">{account.username}</div>
                  {refreshingAccount === account.id && (
                    <svg className="animate-spin ml-2 h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                  account.role === 'admin' ? 'bg-red-100 text-red-800' :
                  account.role === 'manager' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {account.role.charAt(0).toUpperCase() + account.role.slice(1)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                  account.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {account.isActive ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDate(account.createdAt)}
              </td>
              <td className="px-6 py-4">
                <div className="flex flex-wrap gap-1 max-w-xs">
                  {account.permissions?.slice(0, 3).map((perm) => (
                    <span 
                      key={perm.id} 
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {perm.name}
                    </span>
                  ))}
                  {account.permissions && account.permissions.length > 3 && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      +{account.permissions.length - 3} more
                    </span>
                  )}
                  {(!account.permissions || account.permissions.length === 0) && (
                    <span className="text-sm text-gray-400">No permissions</span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                  <button
                    onClick={() => onEdit(account)}
                    disabled={refreshingAccount === account.id}
                    className="text-blue-600 hover:text-blue-900 text-sm px-2 py-1 hover:bg-blue-50 rounded disabled:opacity-50"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onChangePassword(account)}
                    disabled={refreshingAccount === account.id}
                    className="text-yellow-600 hover:text-yellow-900 text-sm px-2 py-1 hover:bg-yellow-50 rounded disabled:opacity-50"
                  >
                    Password
                  </button>
                  <button
                    onClick={() => onManagePermissions(account)}
                    disabled={refreshingAccount === account.id}
                    className="text-purple-600 hover:text-purple-900 text-sm px-2 py-1 hover:bg-purple-50 rounded disabled:opacity-50"
                  >
                    Permissions
                  </button>
                  <button
                    onClick={() => onArchive(account)}
                    disabled={refreshingAccount === account.id}
                    className={`text-sm px-2 py-1 rounded disabled:opacity-50 ${
                      account.isActive 
                        ? 'text-red-600 hover:text-red-900 hover:bg-red-50' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    {account.isActive ? 'Archive' : 'Delete'}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AccountTable;