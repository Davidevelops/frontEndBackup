"use client";

import { useState, useEffect } from "react";
import {
	createAccount,
	getAvailablePermissions,
	getAccounts,
	updateAccount,
	deleteAccount,
	changePassword,
} from "@/lib/data/routes/account/account";
import {
	UserPlus,
	Users,
	Shield,
	User,
	Key,
	RefreshCw,
	AlertCircle,
	CheckCircle2,
	Lock,
	Unlock,
	Eye,
	Trash2,
	Edit,
	Search,
	Save,
	KeyRound,
	UserPen,
	MoreHorizontal,
} from "lucide-react";
import {
	CreateAccountRequest,
	Permission,
	Account,
	AccountPermission,
} from "@/lib/types";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import axios from "axios";

export default function StaffAccountCreation() {
	const [loading, setLoading] = useState(false);
	const [refreshing, setRefreshing] = useState(false);
	const [success, setSuccess] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [availablePerms, setAvailablePerms] = useState<Permission[]>([]);
	const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
	const [loadingPermissions, setLoadingPermissions] = useState(true);
	const [accounts, setAccounts] = useState<Account[]>([]);
	const [loadingAccounts, setLoadingAccounts] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");

	// Dialog states
	const [editingAccount, setEditingAccount] = useState<Account | null>(null);
	const [changingPasswordAccount, setChangingPasswordAccount] =
		useState<Account | null>(null);
	const [deletingAccount, setDeletingAccount] = useState<Account | null>(null);

	const [editFormData, setEditFormData] = useState({ username: "", role: "" });
	const [passwordData, setPasswordData] = useState({
		password: "",
		confirmPassword: "",
	});
	const [passwordError, setPasswordError] = useState("");

	const [formData, setFormData] = useState<CreateAccountRequest>({
		username: "",
		password: "",
		role: "staff",
	});

	const [createPasswordError, setCreatePasswordError] = useState<string | null>(
		null
	);

	useEffect(() => {
		fetchAvailablePermissions();
		fetchAccounts();
	}, []);

	const fetchAvailablePermissions = async () => {
		try {
			setLoadingPermissions(true);
			const permissions = await getAvailablePermissions();
			setAvailablePerms(permissions || []);
		} catch (err) {
			console.error("Failed to fetch permissions:", err);
			setError("Failed to load available permissions");
		} finally {
			setLoadingPermissions(false);
		}
	};

	const fetchAccounts = async () => {
		try {
			setLoadingAccounts(true);
			const accountsData = await getAccounts();
			setAccounts(accountsData || []);
		} catch (err) {
			console.error("Failed to fetch accounts:", err);
			if (axios.isAxiosError(err)) {
				setError(err.response?.data?.error || "An unknown error occurred");
			} else {
				setError("An unexpected error occurred");
			}
		} finally {
			setLoadingAccounts(false);
		}
	};

	const handleInputChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));

		if (name === "password") {
			setCreatePasswordError(null);
		}
	};

	const validatePassword = (password: string): boolean => {
		if (password.length < 8) {
			setCreatePasswordError("Password must be at least 8 characters long");
			return false;
		}
		setCreatePasswordError(null);
		return true;
	};

	const handlePermissionToggle = (permissionId: string) => {
		setSelectedPermissions((prev) =>
			prev.includes(permissionId)
				? prev.filter((id) => id !== permissionId)
				: [...prev, permissionId]
		);
	};

	const handleSelectAll = () => {
		if (selectedPermissions.length === availablePerms.length) {
			setSelectedPermissions([]);
		} else {
			setSelectedPermissions(availablePerms.map((perm) => perm.id));
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setSuccess(false);

		if (!validatePassword(formData.password)) {
			return;
		}

		setLoading(true);

		try {
			await createAccount(formData);
			setSuccess(true);
			setFormData({
				username: "",
				password: "",
				role: "staff",
			});
			setSelectedPermissions([]);

			await fetchAccounts();
		} catch (err: any) {
			setError(
				err.response?.data?.message ||
				err.message ||
				"Failed to create account. Please try again."
			);
		} finally {
			setLoading(false);
		}
	};

	const handleRefresh = () => {
		setRefreshing(true);
		setError(null);
		setSuccess(false);
		fetchAvailablePermissions();
		fetchAccounts();
		setTimeout(() => setRefreshing(false), 1000);
	};

	const handleEditAccount = async () => {
		if (!editingAccount) return;

		try {
			await updateAccount(editingAccount.id, editFormData);
			setEditingAccount(null);
			setEditFormData({ username: "", role: "" });
			await fetchAccounts();
			setSuccess(true);
			setError(null);
		} catch (err: any) {
			setError(
				err.response?.data?.message ||
				err.message ||
				"Failed to update account."
			);
		}
	};

	const handleChangePassword = async () => {
		if (!changingPasswordAccount) return;

		setPasswordError("");

		if (passwordData.password.length < 8) {
			setPasswordError("Password must be at least 8 characters long");
			return;
		}

		if (passwordData.password !== passwordData.confirmPassword) {
			setPasswordError("Passwords do not match");
			return;
		}

		try {
			await changePassword(changingPasswordAccount.id, {
				password: passwordData.password,
			});
			setChangingPasswordAccount(null);
			setPasswordData({ password: "", confirmPassword: "" });
			setSuccess(true);
			setError(null);
		} catch (err: any) {
			setError(
				err.response?.data?.message ||
				err.message ||
				"Failed to change password."
			);
		}
	};

	const handleDeleteAccount = async () => {
		if (!deletingAccount) return;

		try {
			await deleteAccount(deletingAccount.id);
			setDeletingAccount(null);
			await fetchAccounts();
			setSuccess(true);
			setError(null);
		} catch (err: any) {
			setError(
				err.response?.data?.message ||
				err.message ||
				"Failed to delete account."
			);
		}
	};

	useEffect(() => {
		if (editingAccount) {
			setEditFormData({
				username: editingAccount.username,
				role: editingAccount.role,
			});
		}
	}, [editingAccount]);

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	const getRoleColor = (role: string) => {
		switch (role) {
			case "admin":
				return "bg-purple-100 text-purple-800 border-purple-200";
			case "manager":
				return "bg-indigo-100 text-indigo-800 border-indigo-200";
			default:
				return "bg-blue-100 text-blue-800 border-blue-200";
		}
	};

	const getUniquePermissions = (
		permissions: AccountPermission[] | undefined
	) => {
		if (!permissions) return [];

		const unique = permissions.filter(
			(perm, index, self) => index === self.findIndex((p) => p.id === perm.id)
		);
		return unique;
	};

	const filteredAccounts = accounts.filter(
		(account) =>
			account.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
			account.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
			account.id.toLowerCase().includes(searchTerm.toLowerCase())
	);

	const totalStaff = accounts.length;
	const activeAccounts = accounts.filter(
		(account) => account.deletedAt === null
	).length;

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30 p-6">
			<div className="max-w-7xl mx-auto">
				<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
					<div className="flex items-center gap-4 mb-4 lg:mb-0">
						<div className="relative">
							<div className="bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-600 p-3 rounded-2xl shadow-lg shadow-purple-500/20">
								<Shield className="h-8 w-8 text-white" />
							</div>
							<div className="absolute -top-1 -right-1 w-5 h-5 bg-green-400 border-2 border-white rounded-full animate-pulse"></div>
						</div>
						<div>
							<h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-purple-700 to-purple-800 bg-clip-text text-transparent">
								Staff Account Management
							</h1>
							<div className="flex items-center gap-4 mt-3">
								<p className="text-gray-600 flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-gray-100 shadow-xs">
									<Users className="h-4 w-4 text-purple-500" />
									<span className="font-semibold text-gray-800">
										{totalStaff}
									</span>{" "}
									total staff
								</p>
								<p className="text-gray-600 flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-gray-100 shadow-xs">
									<CheckCircle2 className="h-4 w-4 text-green-500" />
									<span className="font-semibold text-gray-800">
										{activeAccounts}
									</span>{" "}
									active accounts
								</p>
							</div>
						</div>
					</div>

					<div className="flex items-center gap-3">
						<button
							onClick={handleRefresh}
							disabled={refreshing}
							className="flex items-center gap-2 bg-white/80 backdrop-blur-sm hover:bg-white border border-gray-200 text-gray-700 px-4 py-3 rounded-xl font-medium transition-all duration-200 hover:shadow-md hover:border-gray-300 disabled:opacity-50"
						>
							<RefreshCw
								className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
							/>
							Refresh
						</button>
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
					<div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100 rounded-2xl p-6 shadow-xs hover:shadow-sm transition-shadow duration-200">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-purple-700 mb-1">
									Total Staff Accounts
								</p>
								<p className="text-3xl font-bold text-gray-800">{totalStaff}</p>
							</div>
							<div className="bg-white p-3 rounded-xl shadow-xs">
								<Users className="h-6 w-6 text-purple-600" />
							</div>
						</div>
					</div>

					<div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 rounded-2xl p-6 shadow-xs hover:shadow-sm transition-shadow duration-200">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-green-700 mb-1">
									Active Accounts
								</p>
								<p className="text-3xl font-bold text-gray-800">
									{activeAccounts}
								</p>
							</div>
							<div className="bg-white p-3 rounded-xl shadow-xs">
								<CheckCircle2 className="h-6 w-6 text-green-600" />
							</div>
						</div>
					</div>

					<div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 rounded-2xl p-6 shadow-xs hover:shadow-sm transition-shadow duration-200">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-blue-700 mb-1">
									System Access
								</p>
								<p className="text-lg font-semibold text-gray-800 flex items-center gap-2">
									<span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
									Admin Privileges
								</p>
							</div>
							<div className="bg-white p-3 rounded-xl shadow-xs">
								<Shield className="h-6 w-6 text-blue-600" />
							</div>
						</div>
					</div>
				</div>

				<div className="mb-8">
					<div className="bg-gradient-to-r from-purple-50/80 to-indigo-50/80 backdrop-blur-sm border border-purple-200/60 rounded-2xl p-6 mb-6 shadow-xs">
						<div className="flex items-center gap-4">
							<div className="bg-white p-3 rounded-xl shadow-xs">
								<UserPlus className="h-6 w-6 text-purple-600" />
							</div>
							<div className="flex-1">
								<h3 className="font-semibold text-gray-800 text-lg">
									Create New Staff Account
								</h3>
								<p className="text-gray-600 mt-1">
									Add new staff members to the system with appropriate roles and
									permissions. Password must be at least 8 characters long.
								</p>
							</div>
							<div className="hidden md:block">
								<div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
							</div>
						</div>
					</div>

					{success && (
						<div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 mb-6 shadow-xs">
							<div className="flex items-center gap-4">
								<div className="bg-white p-3 rounded-xl shadow-xs">
									<CheckCircle2 className="h-6 w-6 text-green-600" />
								</div>
								<div className="flex-1">
									<h3 className="font-semibold text-gray-800 text-lg">
										Operation Successful!
									</h3>
									<p className="text-gray-600 mt-1">
										The operation was completed successfully.
									</p>
								</div>
							</div>
						</div>
					)}

					{error && (
						<div className="bg-gradient-to-br from-red-50 to-orange-50 border border-red-200 rounded-2xl p-6 mb-6 shadow-xs">
							<div className="flex items-center gap-4">
								<div className="bg-white p-3 rounded-xl shadow-xs">
									<AlertCircle className="h-6 w-6 text-red-600" />
								</div>
								<div className="flex-1">
									<h3 className="font-semibold text-gray-800 text-lg">
										Operation Failed
									</h3>
									<p className="text-gray-600 mt-1">{error}</p>
								</div>
							</div>
						</div>
					)}

					<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
						<div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xs border border-gray-100/80 overflow-hidden hover:shadow-sm transition-shadow duration-200">
							<div className="p-6">
								<h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
									<User className="h-5 w-5 text-purple-500" />
									Account Details
								</h3>
								<form onSubmit={handleSubmit} className="space-y-6">
									<div className="space-y-4">
										<div className="space-y-2">
											<label className="flex items-center gap-2 text-sm font-medium text-gray-700">
												<User className="h-4 w-4 text-purple-500" />
												Username
											</label>
											<input
												type="text"
												name="username"
												value={formData.username}
												onChange={handleInputChange}
												required
												className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 outline-none"
												placeholder="Choose a username"
											/>
										</div>

										<div className="space-y-2">
											<label className="flex items-center gap-2 text-sm font-medium text-gray-700">
												<Key className="h-4 w-4 text-purple-500" />
												Password
												<span className="text-xs text-gray-500">
													(min. 8 characters)
												</span>
											</label>
											<input
												type="password"
												name="password"
												value={formData.password}
												onChange={handleInputChange}
												required
												className={`w-full px-4 py-3 bg-white/80 backdrop-blur-sm border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 outline-none ${createPasswordError
													? "border-red-300 focus:ring-red-500"
													: "border-gray-200 focus:ring-purple-500"
													}`}
												placeholder="Set a secure password"
											/>
											{createPasswordError && (
												<p className="text-red-500 text-sm flex items-center gap-1">
													<AlertCircle className="h-4 w-4" />
													{createPasswordError}
												</p>
											)}
										</div>

										<div className="space-y-2">
											<label className="flex items-center gap-2 text-sm font-medium text-gray-700">
												<Shield className="h-4 w-4 text-purple-500" />
												Role
											</label>
											<select
												name="role"
												value={formData.role}
												onChange={handleInputChange}
												required
												className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 outline-none"
											>
												<option value="staff">Staff</option>
												<option value="admin">Admin</option>
												<option value="manager">Manager</option>
											</select>
										</div>
									</div>

									<div className="flex justify-end pt-4">
										<button
											type="submit"
											disabled={loading || !!createPasswordError}
											className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
										>
											{loading ? (
												<RefreshCw className="h-5 w-5 animate-spin" />
											) : (
												<UserPlus className="h-5 w-5" />
											)}
											{loading ? "Creating Account..." : "Create Staff Account"}
										</button>
									</div>
								</form>
							</div>
						</div>

						<div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xs border border-gray-100/80 overflow-hidden hover:shadow-sm transition-shadow duration-200">
							<div className="p-6">
								<div className="flex items-center justify-between mb-4">
									<h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
										<Lock className="h-5 w-5 text-purple-500" />
										Available Permissions
									</h3>
									<button
										type="button"
										onClick={handleSelectAll}
										className="text-sm text-purple-600 hover:text-purple-700 font-medium"
									>
										{selectedPermissions.length === availablePerms.length
											? "Deselect All"
											: "Select All"}
									</button>
								</div>

								{loadingPermissions ? (
									<div className="space-y-3">
										{[...Array(3)].map((_, i) => (
											<div key={i} className="animate-pulse">
												<div className="h-4 bg-gray-200 rounded mb-2"></div>
												<div className="h-3 bg-gray-200 rounded w-3/4"></div>
											</div>
										))}
									</div>
								) : availablePerms.length === 0 ? (
									<div className="text-center py-8 text-gray-500">
										<Unlock className="h-12 w-12 mx-auto mb-3 text-gray-300" />
										<p>No permissions available</p>
									</div>
								) : (
									<div className="space-y-4 max-h-96 overflow-y-auto">
										{availablePerms.map((permission) => (
											<label
												key={permission.id}
												className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:bg-purple-50/30 cursor-pointer transition-colors duration-150"
											>
												<input
													type="checkbox"
													checked={selectedPermissions.includes(permission.id)}
													onChange={() => handlePermissionToggle(permission.id)}
													className="mt-0.5 text-purple-600 focus:ring-purple-500 rounded"
												/>
												<div className="flex-1 min-w-0">
													<p className="font-medium text-gray-800 text-sm">
														{permission.name}
													</p>
												</div>
											</label>
										))}
									</div>
								)}

								<div className="mt-4 pt-4 border-t border-gray-200">
									<p className="text-sm text-gray-600">
										<span className="font-semibold text-purple-800">
											{selectedPermissions.length}
										</span>{" "}
										permissions selected for reference
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xs border border-gray-100/80 overflow-hidden hover:shadow-sm transition-shadow duration-200">
					<div className="p-6">
						<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
							<h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
								<Users className="h-5 w-5 text-purple-500" />
								Staff Accounts ({filteredAccounts.length})
							</h3>
							<div className="flex items-center gap-3">
								<div className="relative">
									<Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
									<input
										type="text"
										placeholder="Search accounts..."
										value={searchTerm}
										onChange={(e) => setSearchTerm(e.target.value)}
										className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-200 w-full sm:w-64"
									/>
								</div>
								<button
									onClick={fetchAccounts}
									disabled={refreshing}
									className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
									title="Refresh Accounts"
								>
									<RefreshCw
										className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
									/>
								</button>
							</div>
						</div>

						{loadingAccounts ? (
							<div className="space-y-4">
								<div className="animate-pulse">
									<div className="h-12 bg-gray-200 rounded mb-4"></div>
									{[...Array(5)].map((_, i) => (
										<div
											key={i}
											className="h-16 bg-gray-200 rounded mb-2"
										></div>
									))}
								</div>
							</div>
						) : filteredAccounts.length === 0 ? (
							<div className="text-center py-12 text-gray-500">
								<Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
								<p className="text-lg font-medium text-gray-600 mb-2">
									{searchTerm
										? "No accounts match your search"
										: "No staff accounts found"}
								</p>
								<p className="text-sm text-gray-500">
									{searchTerm
										? "Try adjusting your search terms"
										: "Create your first staff account to get started"}
								</p>
							</div>
						) : (
							<div className="overflow-x-auto">
								<table className="w-full">
									<thead>
										<tr className="border-b border-gray-200">
											<th className="text-left py-4 px-4 text-sm font-medium text-gray-700">
												Username
											</th>
											<th className="text-left py-4 px-4 text-sm font-medium text-gray-700">
												Role
											</th>
											<th className="text-left py-4 px-4 text-sm font-medium text-gray-700">
												Permissions
											</th>
											<th className="text-left py-4 px-4 text-sm font-medium text-gray-700">
												Created
											</th>
											<th className="text-left py-4 px-4 text-sm font-medium text-gray-700">
												Status
											</th>
											<th className="text-left py-4 px-4 text-sm font-medium text-gray-700">
												Actions
											</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-gray-100">
										{filteredAccounts.map((account) => {
											const uniquePermissions = getUniquePermissions(
												account.permissions
											);
											return (
												<tr
													key={account.id}
													className="hover:bg-purple-50/30 transition-colors duration-150"
												>
													<td className="py-4 px-4">
														<div className="flex items-center gap-3">
															<div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
																<User className="h-5 w-5 text-white" />
															</div>
															<div>
																<div className="font-medium text-gray-800">
																	{account.username}
																</div>
																<div className="text-xs text-gray-500 font-mono">
																	{account.id.slice(0, 8)}...
																</div>
															</div>
														</div>
													</td>
													<td className="py-4 px-4">
														<span
															className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getRoleColor(
																account.role
															)}`}
														>
															{account.role}
														</span>
													</td>
													<td className="py-4 px-4">
														<div className="max-w-xs">
															{uniquePermissions.length > 0 ? (
																<div className="flex flex-wrap gap-1">
																	{uniquePermissions
																		.slice(0, 3)
																		.map((permission) => (
																			<span
																				key={permission.id}
																				className="inline-block bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded border border-purple-200"
																			>
																				{permission.name
																					.replace("MANAGE_", "")
																					.toLowerCase()}
																			</span>
																		))}
																	{uniquePermissions.length > 3 && (
																		<span className="inline-block bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded border border-gray-200">
																			+{uniquePermissions.length - 3} more
																		</span>
																	)}
																</div>
															) : (
																<span className="text-xs text-gray-400 italic">
																	No permissions
																</span>
															)}
														</div>
													</td>
													<td className="py-4 px-4 text-sm text-gray-600">
														{formatDate(account.createdAt)}
													</td>
													<td className="py-4 px-4">
														{account.deletedAt ? (
															<span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
																Inactive
															</span>
														) : (
															<span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
																Active
															</span>
														)}
													</td>
													<td className="py-4 px-4">
														<div className="flex items-center gap-1">
															<button
																className="p-2 hover:bg-purple-50 rounded-lg transition-colors duration-200"
																title="Change Password"
																onClick={() =>
																	setChangingPasswordAccount(account)
																}
															>
																<KeyRound className="h-4 w-4 text-purple-600" />
															</button>
															<button
																className="p-2 hover:bg-purple-50 rounded-lg transition-colors duration-200"
																title="Edit Account"
																onClick={() => setEditingAccount(account)}
															>
																<UserPen className="h-4 w-4 text-purple-600" />
															</button>
															<button
																className="p-2 hover:bg-red-50 rounded-lg transition-colors duration-200"
																title="Delete Account"
																onClick={() => setDeletingAccount(account)}
															>
																<Trash2 className="h-4 w-4 text-red-500" />
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
				</div>

				<Dialog
					open={!!editingAccount}
					onOpenChange={() => setEditingAccount(null)}
				>
					<DialogContent className="sm:max-w-md">
						<DialogHeader>
							<div className="flex items-center gap-3">
								<div className="bg-purple-100 p-2 rounded-lg">
									<UserPen className="h-6 w-6 text-purple-600" />
								</div>
								<div>
									<DialogTitle className="text-lg">Edit Account</DialogTitle>
									<DialogDescription>
										Update the username and role for this staff account.
									</DialogDescription>
								</div>
							</div>
						</DialogHeader>
						<div className="space-y-4 py-4">
							<div className="space-y-2">
								<Label htmlFor="username" className="text-sm font-medium">
									Username
								</Label>
								<Input
									id="username"
									value={editFormData.username}
									onChange={(e) =>
										setEditFormData((prev) => ({
											...prev,
											username: e.target.value,
										}))
									}
									placeholder="Enter username"
									className="focus:ring-purple-500"
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="role" className="text-sm font-medium">
									Role
								</Label>
								<select
									id="role"
									value={editFormData.role}
									onChange={(e) =>
										setEditFormData((prev) => ({
											...prev,
											role: e.target.value,
										}))
									}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
								>
									<option value="staff">Staff</option>
									<option value="admin">Admin</option>
									<option value="manager">Manager</option>
								</select>
							</div>
						</div>
						<DialogFooter>
							<Button variant="outline" onClick={() => setEditingAccount(null)}>
								Cancel
							</Button>
							<Button
								onClick={handleEditAccount}
								className="bg-purple-600 hover:bg-purple-700"
							>
								<Save className="h-4 w-4 mr-2" />
								Save Changes
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>

				<Dialog
					open={!!changingPasswordAccount}
					onOpenChange={() => setChangingPasswordAccount(null)}
				>
					<DialogContent className="sm:max-w-md">
						<DialogHeader>
							<div className="flex items-center gap-3">
								<div className="bg-purple-100 p-2 rounded-lg">
									<KeyRound className="h-6 w-6 text-purple-600" />
								</div>
								<div>
									<DialogTitle className="text-lg">Change Password</DialogTitle>
									<DialogDescription>
										Set a new password for {changingPasswordAccount?.username}.
										Password must be at least 8 characters long.
									</DialogDescription>
								</div>
							</div>
						</DialogHeader>
						<div className="space-y-4 py-4">
							<div className="space-y-2">
								<Label htmlFor="new-password" className="text-sm font-medium">
									New Password
								</Label>
								<Input
									id="new-password"
									type="password"
									value={passwordData.password}
									onChange={(e) =>
										setPasswordData((prev) => ({
											...prev,
											password: e.target.value,
										}))
									}
									placeholder="Enter new password"
									className="focus:ring-purple-500"
								/>
							</div>
							<div className="space-y-2">
								<Label
									htmlFor="confirm-password"
									className="text-sm font-medium"
								>
									Confirm Password
								</Label>
								<Input
									id="confirm-password"
									type="password"
									value={passwordData.confirmPassword}
									onChange={(e) =>
										setPasswordData((prev) => ({
											...prev,
											confirmPassword: e.target.value,
										}))
									}
									placeholder="Confirm new password"
									className="focus:ring-purple-500"
								/>
							</div>
							{passwordError && (
								<div className="bg-red-50 border border-red-200 rounded-lg p-3">
									<p className="text-red-700 text-sm flex items-center gap-2">
										<AlertCircle className="h-4 w-4" />
										{passwordError}
									</p>
								</div>
							)}
						</div>
						<DialogFooter>
							<Button
								variant="outline"
								onClick={() => setChangingPasswordAccount(null)}
							>
								Cancel
							</Button>
							<Button
								onClick={handleChangePassword}
								className="bg-purple-600 hover:bg-purple-700"
							>
								<KeyRound className="h-4 w-4 mr-2" />
								Change Password
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>

				<AlertDialog
					open={!!deletingAccount}
					onOpenChange={() => setDeletingAccount(null)}
				>
					<AlertDialogContent>
						<AlertDialogHeader>
							<div className="flex items-center gap-3">
								<div className="bg-red-100 p-2 rounded-lg">
									<Trash2 className="h-6 w-6 text-red-600" />
								</div>
								<div>
									<AlertDialogTitle>Delete Account</AlertDialogTitle>
									<AlertDialogDescription>
										Are you sure you want to delete the account{" "}
										<strong>"{deletingAccount?.username}"</strong>? This action
										cannot be undone and will permanently remove the account
										from the system.
									</AlertDialogDescription>
								</div>
							</div>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel>Cancel</AlertDialogCancel>
							<AlertDialogAction
								onClick={handleDeleteAccount}
								className="bg-red-600 hover:bg-red-700 text-white"
							>
								<Trash2 className="h-4 w-4 mr-2" />
								Delete Account
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			</div>
		</div>
	);
}
