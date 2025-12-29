const AUTH_TOKEN_MISSING = 'AUTH_TOKEN_MISSING';

export const getAuthToken = (): string | null => {
    return localStorage.getItem('token');
};

export const requireAuthToken = (): string => {
    const token = getAuthToken();
    if (!token) {
        throw new Error(AUTH_TOKEN_MISSING);
    }
    return token;
};

export const buildAuthHeaders = (): Record<string, string> => {
    const token = requireAuthToken();
    return { Authorization: `Bearer ${token}` };
};

export const isAuthTokenMissingError = (error: unknown): boolean => {
    return error instanceof Error && error.message === AUTH_TOKEN_MISSING;
};
