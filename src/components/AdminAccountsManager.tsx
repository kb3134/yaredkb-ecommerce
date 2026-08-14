import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  UserX, 
  Edit3, 
  KeyRound, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  RefreshCw, 
  Search, 
  HelpCircle, 
  Lock, 
  User, 
  Mail, 
  X,
  Shield,
  Eye,
  EyeOff
} from 'lucide-react';
import { AdminUser } from '../types';

interface AdminAccountsManagerProps {
  currentAdminUser: AdminUser | null;
  addToast: (title: string, description?: string) => void;
}

export const AdminAccountsManager: React.FC<AdminAccountsManagerProps> = ({
  currentAdminUser,
  addToast
}) => {
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [passwordChangeTargetUser, setPasswordChangeTargetUser] = useState<AdminUser | null>(null);
  const [deletingUser, setDeletingUser] = useState<AdminUser | null>(null);

  // Form states - Create User
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newRole, setNewRole] = useState<AdminUser['role']>('Store Manager');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [newSecurityQuestion, setNewSecurityQuestion] = useState('What is the founding heritage city of Yared Tibeb?');
  const [newSecurityAnswer, setNewSecurityAnswer] = useState('');
  const [createError, setCreateError] = useState('');
  const [isSubmittingCreate, setIsSubmittingCreate] = useState(false);

  // Form states - Edit User
  const [editUsername, setEditUsername] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editFullName, setEditFullName] = useState('');
  const [editRole, setEditRole] = useState<AdminUser['role']>('Store Manager');
  const [editError, setEditError] = useState('');
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  // Form states - Password Change
  const [changePasswordVal, setChangePasswordVal] = useState('');
  const [confirmChangePasswordVal, setConfirmChangePasswordVal] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);

  // Fetch all admin accounts
  const fetchAdminAccounts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        setAdminUsers(data.users || []);
      } else {
        addToast('Error', 'Failed to load admin user list.');
      }
    } catch (err) {
      console.error('Failed fetching admin accounts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminAccounts();
  }, []);

  // Handle Create Admin Account
  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');

    if (!newUsername.trim()) return setCreateError('Username is required.');
    if (!newEmail.trim()) return setCreateError('Email address is required.');
    if (!newFullName.trim()) return setCreateError('Full Name is required.');
    if (!newPassword || newPassword.length < 6) return setCreateError('Password must be at least 6 characters.');
    if (newPassword !== confirmPassword) return setCreateError('Passwords do not match.');

    setIsSubmittingCreate(true);

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: newUsername.trim(),
          email: newEmail.trim(),
          fullName: newFullName.trim(),
          role: newRole,
          password: newPassword,
          securityQuestion: newSecurityQuestion,
          securityAnswer: newSecurityAnswer.trim() || 'Gondar'
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setCreateError(data.error || 'Failed to create admin user.');
        setIsSubmittingCreate(false);
        return;
      }

      addToast('Admin Account Created', `User @${data.user.username} has been created.`);
      setIsCreateModalOpen(false);
      resetCreateForm();
      fetchAdminAccounts();
    } catch (err) {
      console.error('Create admin error:', err);
      setCreateError('Server error creating account.');
    } finally {
      setIsSubmittingCreate(false);
    }
  };

  const resetCreateForm = () => {
    setNewUsername('');
    setNewEmail('');
    setNewFullName('');
    setNewRole('Store Manager');
    setNewPassword('');
    setConfirmPassword('');
    setNewSecurityAnswer('');
    setCreateError('');
  };

  // Open Edit Modal
  const openEditModal = (user: AdminUser) => {
    setEditingUser(user);
    setEditUsername(user.username);
    setEditEmail(user.email);
    setEditFullName(user.fullName);
    setEditRole(user.role);
    setEditError('');
  };

  // Submit Edit Admin Details
  const handleEditAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setEditError('');

    if (!editUsername.trim()) return setEditError('Username is required.');
    if (!editEmail.trim()) return setEditError('Email address is required.');
    if (!editFullName.trim()) return setEditError('Full Name is required.');

    setIsSubmittingEdit(true);

    try {
      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: editUsername.trim(),
          email: editEmail.trim(),
          fullName: editFullName.trim(),
          role: editRole
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setEditError(data.error || 'Failed to update admin account.');
        setIsSubmittingEdit(false);
        return;
      }

      addToast('Account Updated', `Updated details for @${data.user.username}`);
      setEditingUser(null);
      fetchAdminAccounts();
    } catch (err) {
      console.error('Edit admin error:', err);
      setEditError('Server error updating details.');
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  // Submit Password Change / Reset
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordChangeTargetUser) return;
    setPasswordError('');

    if (!changePasswordVal || changePasswordVal.length < 6) {
      setPasswordError('Password must be at least 6 characters.');
      return;
    }
    if (changePasswordVal !== confirmChangePasswordVal) {
      setPasswordError('Passwords do not match.');
      return;
    }

    setIsSubmittingPassword(true);

    try {
      const res = await fetch(`/api/admin/users/${passwordChangeTargetUser.id}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword: changePasswordVal })
      });

      const data = await res.json();

      if (!res.ok) {
        setPasswordError(data.error || 'Failed to update password.');
        setIsSubmittingPassword(false);
        return;
      }

      addToast('Password Changed', `Updated password for @${passwordChangeTargetUser.username}`);
      setPasswordChangeTargetUser(null);
      setChangePasswordVal('');
      setConfirmChangePasswordVal('');
    } catch (err) {
      console.error('Password update error:', err);
      setPasswordError('Server error updating password.');
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  // Toggle User Active / Inactive Status
  const handleToggleStatus = async (user: AdminUser) => {
    const nextStatus = user.status === 'active' ? 'inactive' : 'active';

    try {
      const res = await fetch(`/api/admin/users/${user.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });

      const data = await res.json();

      if (!res.ok) {
        addToast('Status Update Failed', data.error || 'Cannot modify account status.');
        return;
      }

      addToast('Status Updated', `@${user.username} is now ${nextStatus.toUpperCase()}`);
      fetchAdminAccounts();
    } catch (err) {
      console.error('Toggle status error:', err);
      addToast('Error', 'Server communication error.');
    }
  };

  // Delete User Account
  const handleDeleteUser = async () => {
    if (!deletingUser) return;

    try {
      const res = await fetch(`/api/admin/users/${deletingUser.id}`, {
        method: 'DELETE'
      });

      const data = await res.json();

      if (!res.ok) {
        addToast('Deletion Prevented', data.error || 'Failed deleting account.');
        setDeletingUser(null);
        return;
      }

      addToast('Account Deleted', `@${deletingUser.username} removed successfully.`);
      setDeletingUser(null);
      fetchAdminAccounts();
    } catch (err) {
      console.error('Delete user error:', err);
      addToast('Error', 'Server error deleting account.');
    }
  };

  // Filtered accounts
  const filteredUsers = adminUsers.filter(u => {
    const matchesSearch = 
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-[#231B15] border border-[#E5DFD3]/40 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-xs font-serif font-bold uppercase tracking-wider text-[#D4AF37] mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Role-Based Security & Governance</span>
          </div>
          <h2 className="font-serif font-bold text-2xl sm:text-3xl text-white">
            Admin Account Management
          </h2>
          <p className="text-xs text-[#A89885] mt-1 max-w-xl">
            Create, manage, and audit administrators, studio managers, and support accounts. Passwords are password-hashed securely via bcrypt.
          </p>
        </div>

        <button
          onClick={() => {
            resetCreateForm();
            setIsCreateModalOpen(true);
          }}
          className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#B8860B] via-[#D4AF37] to-[#B8860B] text-[#14100D] font-serif font-bold text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 transition shadow-md shadow-[#D4AF37]/20 flex items-center justify-center gap-2 shrink-0 cursor-pointer"
        >
          <UserPlus className="w-4 h-4 text-[#14100D]" />
          <span>Create Admin Account</span>
        </button>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#FDFBF7] border border-[#E5DFD3] rounded-2xl p-5 shadow-xs">
          <div className="flex justify-between text-xs text-gray-600 font-serif mb-1">
            <span>Total Accounts</span>
            <Users className="w-4 h-4 text-[#B8860B]" />
          </div>
          <p className="font-serif text-2xl font-bold text-[#231B15]">{adminUsers.length}</p>
          <p className="text-[11px] text-gray-500 font-mono">Registered Admins</p>
        </div>

        <div className="bg-[#FDFBF7] border border-[#E5DFD3] rounded-2xl p-5 shadow-xs">
          <div className="flex justify-between text-xs text-gray-600 font-serif mb-1">
            <span>Active Administrators</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="font-serif text-2xl font-bold text-emerald-800">
            {adminUsers.filter(u => u.status === 'active').length}
          </p>
          <p className="text-[11px] text-emerald-700 font-mono">Full Access Granted</p>
        </div>

        <div className="bg-[#FDFBF7] border border-[#E5DFD3] rounded-2xl p-5 shadow-xs">
          <div className="flex justify-between text-xs text-gray-600 font-serif mb-1">
            <span>Inactive / Suspended</span>
            <UserX className="w-4 h-4 text-amber-600" />
          </div>
          <p className="font-serif text-2xl font-bold text-amber-800">
            {adminUsers.filter(u => u.status === 'inactive').length}
          </p>
          <p className="text-[11px] text-gray-500 font-mono">Access Disabled</p>
        </div>

        <div className="bg-[#FDFBF7] border border-[#E5DFD3] rounded-2xl p-5 shadow-xs">
          <div className="flex justify-between text-xs text-gray-600 font-serif mb-1">
            <span>Super Administrators</span>
            <Shield className="w-4 h-4 text-blue-600" />
          </div>
          <p className="font-serif text-2xl font-bold text-blue-900">
            {adminUsers.filter(u => u.role === 'Super Admin').length}
          </p>
          <p className="text-[11px] text-gray-500 font-mono">Unrestricted Rights</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#FDFBF7] border border-[#E5DFD3] rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search username, name, email..."
            className="w-full bg-white border border-gray-300 rounded-xl pl-9 pr-4 py-2 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#B8860B]"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {['all', 'Super Admin', 'Store Manager', 'Inventory Specialist', 'Customer Support'].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-serif font-bold uppercase tracking-wider transition cursor-pointer whitespace-nowrap ${
                roleFilter === r
                  ? 'bg-[#231B15] text-[#D4AF37]'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {r === 'all' ? 'All Roles' : r}
            </button>
          ))}
        </div>
      </div>

      {/* Admin Accounts Table */}
      <div className="bg-[#FDFBF7] border border-[#E5DFD3] rounded-2xl overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="p-12 text-center text-gray-500 font-serif text-xs flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-[#B8860B]" />
            <span>Loading admin accounts...</span>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-gray-500 font-serif text-xs">
            No admin users found matching your search filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#231B15] text-[#D4AF37] font-serif text-[11px] uppercase tracking-wider border-b border-[#3D332A]">
                  <th className="p-4 font-bold">ADMINISTRATOR</th>
                  <th className="p-4 font-bold">USERNAME</th>
                  <th className="p-4 font-bold">ROLE</th>
                  <th className="p-4 font-bold">STATUS</th>
                  <th className="p-4 font-bold">LAST LOGIN</th>
                  <th className="p-4 font-bold text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5DFD3]">
                {filteredUsers.map((usr) => {
                  const isCurrent = currentAdminUser?.id === usr.id;
                  return (
                    <tr key={usr.id} className="hover:bg-white/80 transition">
                      {/* Name & Email */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#231B15] text-[#D4AF37] border border-[#D4AF37]/40 flex items-center justify-center font-serif font-bold text-xs shrink-0">
                            {usr.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-serif font-bold text-[#231B15] text-sm flex items-center gap-2">
                              <span>{usr.fullName}</span>
                              {isCurrent && (
                                <span className="px-1.5 py-0.5 rounded-md bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[9px] font-mono font-bold text-[#B8860B]">
                                  YOU
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-gray-500">{usr.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Username */}
                      <td className="p-4 font-mono font-bold text-gray-800">
                        @{usr.username}
                      </td>

                      {/* Role Badge */}
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-serif font-bold uppercase tracking-wider ${
                          usr.role === 'Super Admin'
                            ? 'bg-purple-100 text-purple-900 border border-purple-300'
                            : usr.role === 'Store Manager'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-blue-100 text-blue-900 border border-blue-300'
                        }`}>
                          <Shield className="w-3 h-3" />
                          <span>{usr.role}</span>
                        </span>
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        <button
                          onClick={() => handleToggleStatus(usr)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition cursor-pointer ${
                            usr.status === 'active'
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300'
                              : 'bg-red-100 text-red-800 hover:bg-red-200 border border-red-300'
                          }`}
                          title={usr.status === 'active' ? 'Click to deactivate' : 'Click to activate'}
                        >
                          {usr.status === 'active' ? (
                            <>
                              <CheckCircle className="w-3 h-3 text-emerald-600" />
                              <span>Active</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 text-red-600" />
                              <span>Inactive</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Last Login */}
                      <td className="p-4 font-mono text-[11px] text-gray-600">
                        {usr.lastLoginAt ? new Date(usr.lastLoginAt).toLocaleString() : 'Never logged in'}
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Edit Details */}
                          <button
                            onClick={() => openEditModal(usr)}
                            className="p-1.5 rounded-lg border border-gray-300 bg-white hover:bg-[#231B15] hover:text-[#D4AF37] transition cursor-pointer text-gray-700"
                            title="Edit User Info"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Change / Reset Password */}
                          <button
                            onClick={() => {
                              setPasswordChangeTargetUser(usr);
                              setChangePasswordVal('');
                              setConfirmChangePasswordVal('');
                              setPasswordError('');
                            }}
                            className="p-1.5 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-600 hover:text-white transition cursor-pointer text-amber-800"
                            title="Change Password"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete User */}
                          <button
                            onClick={() => setDeletingUser(usr)}
                            disabled={isCurrent}
                            className={`p-1.5 rounded-lg border transition cursor-pointer ${
                              isCurrent
                                ? 'border-gray-200 bg-gray-100 text-gray-300 cursor-not-allowed'
                                : 'border-red-200 bg-red-50 hover:bg-red-600 hover:text-white text-red-700'
                            }`}
                            title={isCurrent ? "You cannot delete your logged-in account" : "Delete Account"}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL 1: CREATE NEW ADMIN ACCOUNT */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#1C1612] border border-[#D4AF37]/40 rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl text-white my-8"
          >
            <div className="flex items-center justify-between pb-4 border-b border-[#3D332A] mb-6">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="font-serif font-bold text-lg text-white">Create New Admin Account</h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-lg hover:bg-[#3D332A] text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {createError && (
              <div className="mb-4 p-3 rounded-xl bg-red-950/50 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{createError}</span>
              </div>
            )}

            <form onSubmit={handleCreateAdmin} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-serif font-semibold text-[#D4AF37] uppercase mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="e.g. yared_manager"
                    className="w-full bg-[#120E0C] border border-[#3D332A] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-serif font-semibold text-[#D4AF37] uppercase mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={newFullName}
                    onChange={(e) => setNewFullName(e.target.value)}
                    placeholder="e.g. Helina Tekle"
                    className="w-full bg-[#120E0C] border border-[#3D332A] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-serif font-semibold text-[#D4AF37] uppercase mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="e.g. helina@yaredtibeb.com"
                    className="w-full bg-[#120E0C] border border-[#3D332A] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-serif font-semibold text-[#D4AF37] uppercase mb-1">
                    Administrative Role
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as AdminUser['role'])}
                    className="w-full bg-[#120E0C] border border-[#3D332A] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                  >
                    <option value="Super Admin">Super Admin (Full Access)</option>
                    <option value="Store Manager">Store Manager</option>
                    <option value="Inventory Specialist">Inventory Specialist</option>
                    <option value="Customer Support">Customer Support</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-serif font-semibold text-[#D4AF37] uppercase mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className="w-full bg-[#120E0C] border border-[#3D332A] rounded-xl pl-3.5 pr-8 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-serif font-semibold text-[#D4AF37] uppercase mb-1">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full bg-[#120E0C] border border-[#3D332A] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-serif font-semibold text-[#D4AF37] uppercase mb-1">
                  Security Recovery Answer
                </label>
                <input
                  type="text"
                  value={newSecurityAnswer}
                  onChange={(e) => setNewSecurityAnswer(e.target.value)}
                  placeholder="Answer for password recovery (default: Gondar)"
                  className="w-full bg-[#120E0C] border border-[#3D332A] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                />
                <p className="text-[10px] text-gray-500 mt-1">
                  Used by this account for secure password resets if forgotten.
                </p>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#3D332A]">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-600 text-xs font-bold text-gray-300 hover:bg-white/10 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingCreate}
                  className="px-5 py-2.5 rounded-xl bg-[#D4AF37] text-[#14100D] font-serif font-bold text-xs uppercase tracking-wider hover:brightness-110 cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmittingCreate ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                  <span>Create Admin Account</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* MODAL 2: EDIT ADMIN DETAILS */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#1C1612] border border-[#D4AF37]/40 rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl text-white"
          >
            <div className="flex items-center justify-between pb-4 border-b border-[#3D332A] mb-4">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="font-serif font-bold text-base text-white">Edit Account Details</h3>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="p-1 rounded-lg hover:bg-[#3D332A] text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {editError && (
              <div className="mb-4 p-3 rounded-xl bg-red-950/50 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{editError}</span>
              </div>
            )}

            <form onSubmit={handleEditAdmin} className="space-y-4">
              <div>
                <label className="block text-xs font-serif font-semibold text-[#D4AF37] uppercase mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  className="w-full bg-[#120E0C] border border-[#3D332A] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-serif font-semibold text-[#D4AF37] uppercase mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  className="w-full bg-[#120E0C] border border-[#3D332A] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-serif font-semibold text-[#D4AF37] uppercase mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full bg-[#120E0C] border border-[#3D332A] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-serif font-semibold text-[#D4AF37] uppercase mb-1">
                  Role
                </label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as AdminUser['role'])}
                  className="w-full bg-[#120E0C] border border-[#3D332A] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                >
                  <option value="Super Admin">Super Admin</option>
                  <option value="Store Manager">Store Manager</option>
                  <option value="Inventory Specialist">Inventory Specialist</option>
                  <option value="Customer Support">Customer Support</option>
                </select>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#3D332A]">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-xl border border-gray-600 text-xs font-bold text-gray-300 hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingEdit}
                  className="px-5 py-2 rounded-xl bg-[#D4AF37] text-[#14100D] font-serif font-bold text-xs uppercase tracking-wider hover:brightness-110 flex items-center gap-2"
                >
                  {isSubmittingEdit ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* MODAL 3: CHANGE PASSWORD */}
      {passwordChangeTargetUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#1C1612] border border-[#D4AF37]/40 rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl text-white"
          >
            <div className="flex items-center justify-between pb-4 border-b border-[#3D332A] mb-4">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="font-serif font-bold text-base text-white">
                  Change Password for @{passwordChangeTargetUser.username}
                </h3>
              </div>
              <button
                onClick={() => setPasswordChangeTargetUser(null)}
                className="p-1 rounded-lg hover:bg-[#3D332A] text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {passwordError && (
              <div className="mb-4 p-3 rounded-xl bg-red-950/50 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-serif font-semibold text-[#D4AF37] uppercase mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={changePasswordVal}
                  onChange={(e) => setChangePasswordVal(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full bg-[#120E0C] border border-[#3D332A] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-serif font-semibold text-[#D4AF37] uppercase mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmChangePasswordVal}
                  onChange={(e) => setConfirmChangePasswordVal(e.target.value)}
                  placeholder="Re-type new password"
                  className="w-full bg-[#120E0C] border border-[#3D332A] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                  required
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#3D332A]">
                <button
                  type="button"
                  onClick={() => setPasswordChangeTargetUser(null)}
                  className="px-4 py-2 rounded-xl border border-gray-600 text-xs font-bold text-gray-300 hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPassword}
                  className="px-5 py-2 rounded-xl bg-[#D4AF37] text-[#14100D] font-serif font-bold text-xs uppercase tracking-wider hover:brightness-110 flex items-center gap-2"
                >
                  {isSubmittingPassword ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
                  <span>Update Password</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* MODAL 4: DELETE CONFIRMATION */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#1C1612] border border-red-500/40 rounded-3xl p-6 sm:p-8 w-full max-w-sm shadow-2xl text-white text-center space-y-4"
          >
            <div className="w-12 h-12 rounded-full bg-red-950/60 border border-red-500/50 text-red-400 mx-auto flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="font-serif font-bold text-lg text-white">
              Delete Admin Account?
            </h3>

            <p className="text-xs text-gray-300 leading-relaxed">
              Are you sure you want to permanently delete <strong className="text-white">@{deletingUser.username}</strong> ({deletingUser.fullName})? This action cannot be undone.
            </p>

            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeletingUser(null)}
                className="px-4 py-2 rounded-xl border border-gray-600 text-xs font-bold text-gray-300 hover:bg-white/10 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteUser}
                className="px-5 py-2 rounded-xl bg-red-600 text-white font-serif font-bold text-xs uppercase tracking-wider hover:bg-red-700 cursor-pointer"
              >
                Delete Account
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
};
