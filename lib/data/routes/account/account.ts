import { apiEndpoints } from "@/lib/apiEndpoints";
import { Account, CreateAccountRequest, Permission } from "@/lib/types";
import axios from "axios";

export const getAccounts = async (): Promise<Account[] | null> => {
  try {
    const response = await axios.get(
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
    const response = await axios.post(apiEndpoints.account(), accountData, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error: any) {
    throw error;
  }
};

export const getAvailablePermissions = async (): Promise<
  Permission[] | null
> => {
  try {
    const response = await axios.get(apiEndpoints.permissions());
    return response.data.data;
  } catch (error) {
    return null;
  }
};

export const addAccountPermissions = async (
  accountId: string,
): Promise<Permission[] | null> => {
  try {
    const response = await axios.post(
      apiEndpoints.accountPermissions(accountId),
    );
    return response.data.data;
  } catch (error) {
    return null;
  }
};

export const updateAccount = async (
  accountId: string,
  accountData: { username: string; role: string },
) => {
  try {
    const response = await axios.patch(
      apiEndpoints.account(accountId),
      accountData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    return response.data;
  } catch (error: any) {
    throw error;
  }
};

export const deleteAccount = async (accountId: string) => {
  try {
    const response = await axios.delete(apiEndpoints.account(accountId));
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

export const changePassword = async (
  accountId: string,
  passwordData: { password: string },
) => {
  try {
    const response = await axios.put(
      apiEndpoints.accountPassword(accountId),
      passwordData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    return response.data;
  } catch (error: any) {
    throw error;
  }
};
