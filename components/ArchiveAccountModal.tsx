
import React, { useState } from 'react';
import { AccountDisplay } from './AccountManagement';

interface ArchiveAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: AccountDisplay;
  onConfirm: () => Promise<void>;
}

const ArchiveAccountModal: React.FC<ArchiveAccountModalProps> = ({
  isOpen,
  onClose,
  account,
  onConfirm,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    try {
      setLoading(true);
      await onConfirm();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to archive account');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  const action = account.isActive ? 'Archive' : 'Delete';
  const actionDescription = account.isActive 
    ? 'Archiving will deactivate the account. The account can be restored later.'
    : 'Warning: This action cannot be undone. All account data will be permanently deleted.';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className={`text-xl font-bold ${account.isActive ? 'text-yellow-600' : 'text-red-600'}`}>
              {action} Account
            </h2>
            <button 
              onClick={handleClose} 
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md mb-4">
              {error}
            </div>
          )}

          <div className="mb-6">
            <p className="text-gray-700 mb-4">
              Are you sure you want to {action.toLowerCase()} this account?
            </p>
            
            <div className="bg-gray-50 p-4 rounded-md space-y-2 mb-4">
              <p><span className="font-medium">Username:</span> {account.username}</p>
              <p><span className="font-medium">Role:</span> {account.role.charAt(0).toUpperCase() + account.role.slice(1)}</p>
              <p><span className="font-medium">Status:</span> {account.isActive ? 'Active' : 'Inactive'}</p>
              <p><span className="font-medium">Permissions:</span> {account.permissions?.length || 0}</p>
            </div>
            
            <p className={`text-sm ${account.isActive ? 'text-yellow-600' : 'text-red-600'}`}>
              {actionDescription}
            </p>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading}
              className={`px-4 py-2 rounded-md text-white transition-colors ${
                account.isActive 
                  ? 'bg-yellow-600 hover:bg-yellow-700' 
                  : 'bg-red-600 hover:bg-red-700'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing...
                </span>
              ) : account.isActive ? 'Archive Account' : 'Delete Permanently'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArchiveAccountModal;