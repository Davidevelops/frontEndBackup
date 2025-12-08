import React, { useState } from 'react';
import { Account, AccountRole } from '@/lib/types';
import {
  X,
  Loader2,
  User,
  Shield,
} from 'lucide-react';

interface EditAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: Account;
  onSubmit: (data: { username: string; role: AccountRole }) => Promise<void>;
}

const EditAccountModal: React.FC<EditAccountModalProps> = ({
  isOpen,
  onClose,
  account,
  onSubmit,
}) => {
  const [formData, setFormData] = useState({
    username: account.username,
    role: account.role,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.username.trim()) {
      setError('Username is required');
      return;
    }

    try {
      setLoading(true);
      await onSubmit(formData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update account');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      username: account.username,
      role: account.role,
    });
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white border border-[#E2E8F0] rounded-lg w-full max-w-md">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#0F172A]">Edit Account</h2>
                <p className="text-sm text-[#64748B]">Update account information</p>
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

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
                <div className="font-medium">Error</div>
                <div className="text-sm">{error}</div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-2">
                  Username *
                </label>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                  className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-2">
                  Role *
                </label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#64748B]" />
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as AccountRole }))}
                    className="w-full pl-10 pr-3 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="staff">Staff</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t border-[#E2E8F0]">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2.5 border border-[#E2E8F0] text-[#64748B] rounded-lg hover:bg-[#F8FAFC] transition-colors text-sm font-medium disabled:opacity-50"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <User className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditAccountModal;