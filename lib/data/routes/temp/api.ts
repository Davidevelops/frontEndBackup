export class ApiEndpoints {
  private backendUrl: string;

  constructor() {
    const url = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!url) {
      throw new Error("NEXT_PUBLIC_BACKEND_URL not declared in .env");
    }
    this.backendUrl = url;
  }

  productGroup(groupId?: string) {
    if (groupId) {
      return `${this.backendUrl}/groups/${groupId}`;
    } else {
      return `${this.backendUrl}/groups`;
    }
  }

  productGroupArchive(groupId: string) {
    return `${this.backendUrl}/groups/${groupId}`;
  }

  productGroupUnarchive(groupId: string) {
    return `${this.backendUrl}/groups/${groupId}/unarchive`;
  }

  login() {
    return `${this.backendUrl}/auth/login`;
  }

  session() {
    return `${this.backendUrl}/auth/session`;
  }

  // Add other endpoints as per your requirements
}

export const apiEndpoints = new ApiEndpoints();