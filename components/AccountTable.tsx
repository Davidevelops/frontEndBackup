import React, { useState, useEffect, useMemo } from 'react';
import { AccountDisplay } from './AccountManagement';
import {
  Edit,
  Lock,
  Shield,
  Archive,
  RefreshCw,
  User,
  Calendar,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';

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
  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Filter accounts based on search term
  const filteredAccounts = useMemo(() => {
    if (!searchTerm.trim()) return accounts;
    
    const term = searchTerm.toLowerCase();
    return accounts.filter(account => 
      account.username.toLowerCase().includes(term) ||
      account.role.toLowerCase().includes(term) ||
      account.permissions?.some(perm => 
        perm.name.toLowerCase().includes(term)
      ) ||
      (account.isActive ? 'active' : 'inactive').includes(term)
    );
  }, [accounts, searchTerm]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredAccounts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAccounts = filteredAccounts.slice(startIndex, endIndex);

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };


  if (accounts.length === 0) {
    return (
      <div className="text-center py-8 border border-[#E2E8F0] rounded-lg">
        <p className="text-[#64748B]">No accounts found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#64748B]" />
          <input
            type="text"
            placeholder="Search by username, role, permissions, or status..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent text-sm"
          />
        </div>

        {/* Items per page selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-[#64748B]">Show:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
            className="border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
          </select>
          <span className="text-sm text-[#64748B]">
            {filteredAccounts.length} account{filteredAccounts.length !== 1 ? 's' : ''} found
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-[#E2E8F0] rounded-lg">
        <table className="min-w-full divide-y divide-[#E2E8F0]">
          <thead className="bg-[#F8FAFC]">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#64748B] uppercase tracking-wider">
                Username
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#64748B] uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#64748B] uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#64748B] uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#64748B] uppercase tracking-wider">
                Permissions
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#64748B] uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-[#E2E8F0]">
            {paginatedAccounts.map((account) => (
              <tr 
                key={account.id} 
                className={`hover:bg-[#F8FAFC] transition-colors ${
                  refreshingAccount === account.id ? 'bg-blue-50' : ''
                }`}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="text-sm font-medium text-[#0F172A]">{account.username}</div>
                    {refreshingAccount === account.id && (
                      <RefreshCw className="ml-2 h-4 w-4 text-blue-500 animate-spin" />
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    account.role === 'admin' ? 'bg-red-100 text-red-800' :
                    account.role === 'manager' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {account.role.charAt(0).toUpperCase() + account.role.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    account.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {account.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[#64748B]">
                  <div className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {formatDate(account.createdAt)}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1 max-w-xs">
                    {account.permissions?.slice(0, 3).map((perm:any) => (
                      <span 
                        key={perm.id} 
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {perm.name}
                      </span>
                    ))}
                    {account.permissions && account.permissions.length > 3 && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#E2E8F0] text-[#64748B]">
                        +{account.permissions.length - 3} more
                      </span>
                    )}
                    {(!account.permissions || account.permissions.length === 0) && (
                      <span className="text-sm text-[#94A3B8]">No permissions</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                    <button
                      onClick={() => onEdit(account)}
                      disabled={refreshingAccount === account.id}
                   className='text-green-700 bg-green-100 flex items-center justify-center px-3 py-1 rounded text-sm gap-1 hover:text-green-800 hover:bg-green-200'
                    >
                      <Edit className="h-3 w-3 " />
                      <span className=" font-medium">Edit</span>
                    </button>
                    <button
                      onClick={() => onChangePassword(account)}
                      disabled={refreshingAccount === account.id}
                      className='text-blue-700 bg-blue-100 flex items-center justify-center px-3 py-1 rounded text-sm gap-1 hover:text-blue-800 hover:bg-blue-200'
                    >
                      <Lock className="h-3 w-3" />
                      <span>Password</span>
                    </button>
                    <button
                      onClick={() => onManagePermissions(account)}
                      disabled={refreshingAccount === account.id}
                       className='text-purple-700 bg-purple-100 flex items-center justify-center px-3 py-1 rounded text-sm gap-1 hover:text-purple-800 hover:bg-purple-200'
                    >
                      <Shield className="h-3 w-3" />
                      <span>Permissions</span>
                    </button>
                    <button
                      onClick={() => onArchive(account)}
                      disabled={refreshingAccount === account.id}
                      className='text-red-700 bg-red-100 flex items-center justify-center px-3 py-1 rounded text-sm gap-1 hover:text-red-800 hover:bg-red-200'
                    >
                      <Archive className="h-3 w-3 ${account.isActive ? 'text-red-700' : 'text-[#64748B]'}" />
                      <span className={`font-medium ${account.isActive ? 'text-[#DC2626]' : 'text-[#64748B]'}`}>
                        {account.isActive ? 'Archive' : 'Delete'}
                      </span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* No search results */}
        {paginatedAccounts.length === 0 && (
          <div className="text-center py-8">
            <p className="text-[#64748B]">No accounts match your search</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4">
          <div className="text-sm text-[#64748B]">
            Showing {startIndex + 1} to {Math.min(endIndex, filteredAccounts.length)} of {filteredAccounts.length} entries
          </div>
          
          <div className="flex items-center gap-2">
            {/* First Page */}
            <button
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-[#E2E8F0] hover:bg-[#F8FAFC] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronsLeft className="h-4 w-4" />
            </button>
            
            {/* Previous Page */}
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-[#E2E8F0] hover:bg-[#F8FAFC] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            
            {/* Page Numbers */}
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`min-w-[36px] h-9 rounded-lg border transition-colors ${
                      currentPage === pageNum
                        ? 'bg-[#3B82F6] text-white border-[#3B82F6]'
                        : 'border-[#E2E8F0] text-[#64748B] hover:bg-[#F8FAFC]'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            {/* Next Page */}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-[#E2E8F0] hover:bg-[#F8FAFC] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            
            {/* Last Page */}
            <button
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-[#E2E8F0] hover:bg-[#F8FAFC] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronsRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountTable;