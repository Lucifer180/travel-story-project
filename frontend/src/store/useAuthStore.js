import { create } from 'zustand';
import {
    logIn,
    requestPasswordReset as requestPasswordResetApi,
    resetPassword as resetPasswordApi,
    signUp,
} from '../api/auth.api';
import { getUser } from '../api/user.api';

const TOKEN_KEY = 'token';

const readToken = () => {
    try {
        return localStorage.getItem(TOKEN_KEY);
    } catch {
        return null;
    }
};

// Pulls the server's message out of an axios error, with a generic fallback.
const errorMessage = (err, fallback) => err.response?.data?.message || fallback;

export const useAuthStore = create((set, get) => ({
    token: readToken(),
    user: null,

    setToken: (token) => {
        if (token) localStorage.setItem(TOKEN_KEY, token);
        else localStorage.removeItem(TOKEN_KEY);
        set({ token });
    },

    // Resolves to null on success, or an error message to show the user.
    login: async ({ email, password }) => {
        try {
            const response = await logIn({ email, password });
            if (response.data?.accessToken) {
                get().setToken(response.data.accessToken);
                set({ user: response.data.user || null });
                return null;
            }
            return 'An unexpected error occured.please try again';
        } catch (err) {
            return errorMessage(err, 'An unexpected error occured.please try again');
        }
    },

    signup: async ({ fullName, email, password }) => {
        try {
            const response = await signUp({ fullName, email, password });
            if (response.data?.accessToken) {
                get().setToken(response.data.accessToken);
                set({ user: response.data.user || null });
                return null;
            }
            return 'An unexpected error occured.please try again';
        } catch (err) {
            return errorMessage(err, 'An unexpected error occured.please try again');
        }
    },

    // Returns false when the session is no longer valid (caller redirects).
    fetchUser: async () => {
        try {
            const response = await getUser();
            if (response.data?.user) {
                set({ user: response.data.user });
            } else {
                console.error('User data not found');
            }
            return true;
        } catch (error) {
            if (error.response?.status === 401) {
                get().logout();
                return false;
            }
            console.error('Error fetching user info:', error);
            return true;
        }
    },

    logout: () => {
        get().setToken(null);
        set({ user: null });
    },

    // Both resolve to { message } on success or { error } with a message to show.
    requestPasswordReset: async (email) => {
        try {
            const response = await requestPasswordResetApi(email);
            return { message: response.data?.message };
        } catch (err) {
            return { error: errorMessage(err, 'Could not send the reset email. Please try again.') };
        }
    },

    resetPassword: async ({ token, password }) => {
        try {
            const response = await resetPasswordApi({ token, password });
            return { message: response.data?.message };
        } catch (err) {
            return { error: errorMessage(err, 'Could not reset the password. Please try again.') };
        }
    },
}));
