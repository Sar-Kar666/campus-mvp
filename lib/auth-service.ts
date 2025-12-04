import { supabase } from './supabase';

export const AuthService = {
    // Step 1: Send OTP to Email
    signInWithOtp: async (email: string) => {
        if (!supabase) return { error: { message: 'Supabase client not initialized' } };

        const { data, error } = await supabase.auth.signInWithOtp({
            email,
        });
        return { data, error };
    },

    // Step 2: Verify OTP
    verifyOtp: async (email: string, token: string) => {
        if (!supabase) return { data: null, error: { message: 'Supabase client not initialized' } };

        const { data, error } = await supabase.auth.verifyOtp({
            email,
            token,
            type: 'email',
        });
        return { data, error };
    },

    // Get current session
    getSession: async () => {
        if (!supabase) return null;
        const { data } = await supabase.auth.getSession();
        return data.session;
    },

    // Sign out
    signOut: async () => {
        if (!supabase) return;
        await supabase.auth.signOut();
    }
};
