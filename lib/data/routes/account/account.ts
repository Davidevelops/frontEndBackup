import { apiEndpoints } from "@/lib/apiEndpoints";
import { Account, CreateAccountRequest, Permission } from "@/lib/types";
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

export const createAccount = async (accountData: CreateAccountRequest) => {
  try {
    const response = await apiClient.post(apiEndpoints.account(), accountData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

export const getAvailablePermissions = async (): Promise<Permission[] | null> => {
  try {
    const response = await apiClient.get(apiEndpoints.permissions());
    return response.data.data;
  } catch (error) {
    return null;
  }
};

export const addAccountPermissions = async (accountId: string): Promise<Permission[] | null> => {
  try {
    const response = await apiClient.post(apiEndpoints.accountPermissions(accountId));
    return response.data.data;
  } catch (error) {
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
    throw error;
  }
};

export const deleteAccount = async (accountId: string) => {
  try {
    const response = await apiClient.delete(apiEndpoints.account(accountId));
    return response.data;
  } catch (error: any) {
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
    throw error;
  }
};