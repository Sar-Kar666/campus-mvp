import { supabase } from './supabase';
import { User, Connection, Message } from '@/types';

const STORAGE_KEYS = {
    USER_ID: 'cc_user_id',
};

export const MockService = {
    getCurrentUser: async (): Promise<User | null> => {
        if (typeof window === 'undefined' || !supabase) return null;

        // 1. Check Supabase Auth Session first
        const { data: { session } } = await supabase.auth.getSession();
        let userId = session?.user?.id;

        console.log('[MockService] Auth Session User ID:', userId);

        // 2. Fallback to localStorage (legacy/mock)
        if (!userId) {
            userId = localStorage.getItem(STORAGE_KEYS.USER_ID) || undefined;
            console.log('[MockService] LocalStorage User ID:', userId);
        }

        if (!userId) {
            console.log('[MockService] No User ID found');
            return null;
        }

        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

        if (error || !data) {
            console.error('[MockService] Error fetching user from DB:', error);
            console.log('[MockService] User ID queried:', userId);
            return null;
        }

        return data as User;
    },

    saveCurrentUser: async (user: Partial<User> & { email?: string }) => {
        if (typeof window === 'undefined' || !supabase) return;

        console.log('[MockService] Saving user:', user);

        // Explicitly handle update vs insert to ensure we update the correct row
        if (user.id) {
            console.log('[MockService] Updating existing user:', user.id);
            const { data, error } = await supabase
                .from('users')
                .update(user)
                .eq('id', user.id)
                .select()
                .single();

            if (error) {
                console.error('[MockService] Error updating user:', error);
                return undefined;
            }

            if (data) {
                console.log('[MockService] User updated successfully:', data);
                localStorage.setItem(STORAGE_KEYS.USER_ID, data.id);
                return data as User;
            }
        }

        // If no ID, try upsert (or insert)
        console.log('[MockService] Creating/Upserting user (no ID provided)');
        const { data, error } = await supabase
            .from('users')
            .upsert(user)
            .select()
            .single();

        if (error) {
            console.error('[MockService] Error saving user:', error);
            return undefined;
        }

        if (data) {
            console.log('[MockService] User saved successfully:', data);
            localStorage.setItem(STORAGE_KEYS.USER_ID, data.id);
            return data as User;
        }
    },

    getAllUsers: async (): Promise<User[]> => {
        if (!supabase) return [];
        const { data } = await supabase.from('users').select('*');
        return (data as User[]) || [];
    },

    getUserById: async (userId: string): Promise<User | null> => {
        if (!supabase) return null;
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            console.error('[MockService] Error fetching user by ID:', error);
            return null;
        }
        return data as User;
    },

    getConnections: async (userId: string): Promise<Connection[]> => {
        if (!supabase) return [];
        const { data } = await supabase
            .from('connections')
            .select('*')
            .or(`requester_id.eq.${userId},receiver_id.eq.${userId}`);
        return (data as Connection[]) || [];
    },

    sendConnectionRequest: async (requesterId: string, receiverId: string) => {
        if (!supabase) return;
        await supabase.from('connections').insert([{
            requester_id: requesterId,
            receiver_id: receiverId,
            status: 'pending'
        }]);
    },

    updateConnectionStatus: async (connectionId: string, status: 'accepted' | 'rejected') => {
        if (!supabase) return;
        await supabase
            .from('connections')
            .update({ status })
            .eq('id', connectionId);
    },

    getMessages: async (userId: string, otherUserId: string): Promise<Message[]> => {
        if (!supabase) return [];
        const { data } = await supabase
            .from('messages')
            .select('*')
            .or(`and(sender_id.eq.${userId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${userId})`)
            .order('created_at', { ascending: true });
        return (data as Message[]) || [];
    },

    sendMessage: async (senderId: string, receiverId: string, content: string) => {
        if (!supabase) return;
        await supabase.from('messages').insert([{
            sender_id: senderId,
            receiver_id: receiverId,
            content
        }]);
    },
};
