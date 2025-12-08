import React, { useState } from 'react';
import { Permission } from '@/lib/types';
import { AccountRole } from './AccountManagement';
import {
  X,
  Loader2,
  User,
  Lock,
  Shield,
  Check,
} from 'lucide-react';

interface CreateAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    username: string;
    password: string;
    role: AccountRole;
    permissions: string[];
  }) => Promise<void>;
  permissions: Permission[];
}

const CreateAccountModal: React.FC<CreateAccountModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  permissions,
}) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    role: 'staff' as AccountRole,
    selectedPermissions: [] as string[],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.username.trim()) {
      setError('Username is required');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      await onSubmit({
        username: formData.username.trim(),
        password: formData.password,
        role: formData.role,
        permissions: formData.selectedPermissions,
      });
      resetForm();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      username: '',
      password: '',
      confirmPassword: '',
      role: 'staff',
      selectedPermissions: [],
    });
    setError(null);
  };

  const handlePermissionToggle = (permissionId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedPermissions: prev.selectedPermissions.includes(permissionId)
        ? prev.selectedPermissions.filter(id => id !== permissionId)
        : [...prev.selectedPermissions, permissionId]
    }));
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white border border-[#E2E8F0] rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-[#1E293B] p-2 rounded-lg">
                <User className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#0F172A]">Create New Account</h2>
                <p className="text-sm text-[#64748B]">Enter details for the new user account</p>
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
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#64748B]" />
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                    className="w-full pl-10 pr-3 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E293B] focus:border-transparent"
                    placeholder="Enter username"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-2">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#64748B]" />
                    <input
                      type="password"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      className="w-full pl-10 pr-3 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E293B] focus:border-transparent"
                      placeholder="Enter password"
                    />
                  </div>
                  <p className="text-xs text-[#64748B] mt-2">Minimum 6 characters</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-2">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#64748B]" />
                    <input
                      type="password"
                      required
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="w-full pl-10 pr-3 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E293B] focus:border-transparent"
                      placeholder="Confirm password"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-2">
                  Role *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as AccountRole }))}
                  className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E293B] focus:border-transparent"
                >
                  <option value="staff">Staff</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            {/* <div className="border-t border-[#E2E8F0] pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-[#64748B]" />
                  <h3 className="text-lg font-medium text-[#0F172A]">Permissions</h3>
                </div>
                <span className="text-sm text-[#64748B]">
                  {formData.selectedPermissions.length} selected
                </span>
              </div>
              
              <div className="border border-[#E2E8F0] rounded-lg p-4 max-h-60 overflow-y-auto bg-[#F8FAFC]">
                {permissions.length === 0 ? (
                  <p className="text-[#64748B] text-sm text-center py-4">No permissions available</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {permissions.map((permission) => (
                      <div key={permission.id} className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            type="checkbox"
                            id={`perm-${permission.id}`}
                            checked={formData.selectedPermissions.includes(permission.id)}
                            onChange={() => handlePermissionToggle(permission.id)}
                            className="h-4 w-4 text-[#1E293B] border-[#E2E8F0] rounded focus:ring-[#1E293B]"
                          />
                        </div>
                        <label htmlFor={`perm-${permission.id}`} className="ml-2 cursor-pointer flex-1">
                          <div className="flex items-center">
                            <span className="text-sm font-medium text-[#0F172A]">{permission.name}</span>
                            {formData.selectedPermissions.includes(permission.id) && (
                              <Check className="ml-2 h-4 w-4 text-green-500" />
                            )}
                          </div>
                          {permission.description && (
                            <p className="text-xs text-[#64748B] mt-0.5">{permission.description}</p>
                          )}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div> */}

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
                className="px-4 py-2.5 bg-[#1E293B] text-white rounded-lg hover:bg-[#0F172A] transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <User className="h-4 w-4" />
                    Create Account
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

export default CreateAccountModal;