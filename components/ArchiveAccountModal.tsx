import React, { useState } from 'react';
import { AccountDisplay } from './AccountManagement';
import {
  X,
  Loader2,
  Archive,
  Trash2,
  AlertTriangle,
  User,
  Shield,
} from 'lucide-react';

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
      <div className="bg-white border border-[#E2E8F0] rounded-lg w-full max-w-md">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${account.isActive ? 'bg-yellow-100' : 'bg-red-100'}`}>
                {account.isActive ? (
                  <Archive className="h-5 w-5 text-yellow-600" />
                ) : (
                  <Trash2 className="h-5 w-5 text-red-600" />
                )}
              </div>
              <div>
                <h2 className={`text-xl font-bold ${account.isActive ? 'text-yellow-600' : 'text-red-600'}`}>
                  {action} Account
                </h2>
                <p className="text-sm text-[#64748B]">
                  {account.isActive ? 'Deactivate user account' : 'Permanently delete account'}
                </p>
              </div>
            </div>
            <button 
              onClick={handleClose} 
              className="text-[#64748B] hover:text-[#0F172A] transition-colors p-1 hover:bg-[#F8FAFC] rounded"
              disabled={loading}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md mb-6">
              <div className="font-medium">Error</div>
              <div className="text-sm">{error}</div>
            </div>
          )}

          <div className="mb-6">
            <div className="bg-[#F8FAFC] p-4 rounded-lg border border-[#E2E8F0] space-y-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-white p-2 rounded">
                  <User className="h-4 w-4 text-[#64748B]" />
                </div>
                <div>
                  <p className="text-sm text-[#64748B]">Username</p>
                  <p className="font-medium text-[#0F172A]">{account.username}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="bg-white p-2 rounded">
                  <Shield className="h-4 w-4 text-[#64748B]" />
                </div>
                <div>
                  <p className="text-sm text-[#64748B]">Role</p>
                  <p className="font-medium text-[#0F172A] capitalize">{account.role}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="bg-white p-2 rounded">
                  <div className={`h-4 w-4 rounded-full ${account.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                </div>
                <div>
                  <p className="text-sm text-[#64748B]">Status</p>
                  <p className={`font-medium ${account.isActive ? 'text-green-600' : 'text-gray-600'}`}>
                    {account.isActive ? 'Active' : 'Inactive'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className={`p-4 rounded-lg ${account.isActive ? 'bg-yellow-50 border border-yellow-200' : 'bg-red-50 border border-red-200'}`}>
              <div className="flex items-start gap-3">
                <AlertTriangle className={`h-5 w-5 mt-0.5 ${account.isActive ? 'text-yellow-600' : 'text-red-600'}`} />
                <div>
                  <p className={`font-medium mb-1 ${account.isActive ? 'text-yellow-800' : 'text-red-800'}`}>
                    {account.isActive ? 'Archive Account' : 'Permanent Deletion'}
                  </p>
                  <p className={`text-sm ${account.isActive ? 'text-yellow-700' : 'text-red-700'}`}>
                    {actionDescription}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-[#E2E8F0]">
            <button
              onClick={handleClose}
              className="px-4 py-2.5 border border-[#E2E8F0] text-[#64748B] rounded-lg hover:bg-[#F8FAFC] transition-colors text-sm font-medium disabled:opacity-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading}
              className={`px-4 py-2.5 rounded-lg text-white transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${
                account.isActive 
                  ? 'bg-yellow-600 hover:bg-yellow-700' 
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : account.isActive ? (
                <>
                  <Archive className="h-4 w-4" />
                  Archive Account
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Delete Permanently
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArchiveAccountModal;