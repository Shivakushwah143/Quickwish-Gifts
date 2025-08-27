export const adminAuth = {
  // Check if admin is authenticated
  isAuthenticated: (): boolean => {
    if (typeof window === 'undefined') return false;
    const token = localStorage.getItem('adminToken');
    return !!token;
  },

  // Get admin token
  getToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('adminToken');
  },

  // Get admin username
  getUsername: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('adminUsername');
  },

  // Logout admin
  logout: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUsername');
    window.location.href = '/';
  },

  // Make authenticated API request
  makeAuthenticatedRequest: async (url: string, options: RequestInit = {}): Promise<Response> => {
    const token = adminAuth.getToken();
    
    if (!token) {
      throw new Error('No admin token found');
    }

    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
    };

    return fetch(url, {
      ...options,
      headers,
    });
  }
};
