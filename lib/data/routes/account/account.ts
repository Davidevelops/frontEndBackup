
import { apiEndpoints } from "@/lib/apiEndpoints";
import { Account, CreateAccountRequest, Permission, GrantPermissionRequest } from "@/lib/types";
import apiClient from "@/lib/axiosConfig";

export const getAccounts = async (): Promise<Account[] | null> => {
  try {
    const response = await apiClient.get(
      `${apiEndpoints.account()}?include=permissions`,
    );
    return response.data.data;
  } catch (error) {
    console.error("Error while getting accounts: ", error);
    return null;
  }
};

export const getAccountWithPermissions = async (accountId: string): Promise<Account | null> => {
  try {
    const response = await apiClient.get(
      `${apiEndpoints.account(accountId)}?include=permissions`
    );
    return response.data.data;
  } catch (error) {
    console.error("Error while getting account with permissions: ", error);
    return null;
  }
};

export const createAccount = async (accountData: CreateAccountRequest) => {
  try {
    const response = await apiClient.post(apiEndpoints.account(), accountData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error: any) {
    console.error("Error creating account:", error.response?.data || error.message);
    throw error;
  }
};

export const getAvailablePermissions = async (): Promise<Permission[] | null> => {
  try {
    const response = await apiClient.get(apiEndpoints.permissions());
    return response.data.data;
  } catch (error) {
    console.error("Error getting available permissions:", error);
    return null;
  }
};


export const updateAccount = async (accountId: string, accountData: { username: string; role: string }) => {
  try {
    const response = await apiClient.patch(apiEndpoints.account(accountId), accountData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error: any) {
    console.error("Error updating account:", error.response?.data || error.message);
    throw error;
  }
};

export const deleteAccount = async (accountId: string) => {
  try {
    const response = await apiClient.delete(apiEndpoints.account(accountId));
    return response.data;
  } catch (error: any) {
    console.error("Error deleting account:", error.response?.data || error.message);
    throw error;
  }
};

export const changePassword = async (accountId: string, passwordData: { password: string }) => {
  try {
    const response = await apiClient.put(apiEndpoints.accountPassword(accountId), passwordData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error: any) {
    console.error("Error changing password:", error.response?.data || error.message);
    throw error;
  }
};

export const grantPermission = async (accountId: string, permissionId: string) => {
  try {
    console.log("Granting permission:", { accountId, permissionId });
    
    const response = await apiClient.post(
      apiEndpoints.accountPermissions(accountId),
      { permissionId },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    
    console.log("Permission granted successfully:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Error granting permission:", {
      accountId,
      permissionId,
      error: error.response?.data || error.message,
      status: error.response?.status
    });
    throw error;
  }
};

export const revokePermission = async (accountId: string, permissionId: string) => {
  try {
    console.log("Revoking permission:", { accountId, permissionId });
    
    const response = await apiClient.delete(
      apiEndpoints.accountPermissions(accountId, permissionId)
    );
    
    console.log("Permission revoked successfully:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Error revoking permission:", {
      accountId,
      permissionId,
      error: error.response?.data || error.message,
      status: error.response?.status
    });
    throw error;
  }
};