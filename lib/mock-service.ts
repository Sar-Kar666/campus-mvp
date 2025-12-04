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

            if (!error && data) {
                console.log('[MockService] User updated successfully:', data);
                localStorage.setItem(STORAGE_KEYS.USER_ID, data.id);
                return data as User;
            }

            console.warn('[MockService] Update failed (row might not exist), falling back to upsert:', error);
            // Fallthrough to upsert if update fails (e.g. row doesn't exist yet)
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

    getAllUsers: async (filters?: { query?: string; college?: string; branch?: string; year?: string }): Promise<User[]> => {
        if (!supabase) return [];

        let queryBuilder = supabase.from('users').select('*');

        if (filters?.query) {
            const q = filters.query.toLowerCase();
            queryBuilder = queryBuilder.or(`name.ilike.%${q}%,username.ilike.%${q}%`);
        }

        if (filters?.college && filters.college !== 'all') {
            queryBuilder = queryBuilder.eq('college', filters.college);
        }

        if (filters?.branch && filters.branch !== 'all') {
            queryBuilder = queryBuilder.eq('branch', filters.branch);
        }

        if (filters?.year && filters.year !== 'all') {
            queryBuilder = queryBuilder.eq('year', filters.year);
        }

        const { data, error } = await queryBuilder;

        if (error) {
            console.error('Error fetching users:', error);
            return [];
        }

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

    getUsersByIds: async (userIds: string[]): Promise<User[]> => {
        if (!supabase || userIds.length === 0) return [];
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .in('id', userIds);

        if (error) {
            console.error('[MockService] Error fetching users by IDs:', error);
            return [];
        }
        return (data as User[]) || [];
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

    getPendingConnections: async (userId: string): Promise<any[]> => {
        if (!supabase) return [];
        const { data, error } = await supabase
            .from('connections')
            .select(`
                *,
                requester:users!requester_id (
                    id,
                    name,
                    username,
                    profile_image,
                    college
                )
            `)
            .eq('receiver_id', userId)
            .eq('status', 'pending');

        if (error) {
            console.error('Error fetching pending connections:', error);
            return [];
        }
        return data || [];
    },

    acceptConnection: async (connectionId: string) => {
        if (!supabase) return;
        await supabase
            .from('connections')
            .update({ status: 'accepted' })
            .eq('id', connectionId);
    },

    rejectConnection: async (connectionId: string) => {
        if (!supabase) return;
        await supabase
            .from('connections')
            .update({ status: 'rejected' })
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

    getUserPhotos: async (userId: string): Promise<{ id: string; url: string }[]> => {
        if (!supabase) return [];
        const { data } = await supabase
            .from('photos')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
        return data || [];
    },

    createPost: async (userId: string, content: string, file?: File): Promise<{ success: boolean; error?: string }> => {
        if (!supabase) return { success: false, error: 'Supabase not initialized' };

        // 1. Check count (optional, maybe relax for text posts?)
        // Keeping strict for now to prevent spam
        const { count } = await supabase
            .from('photos')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId);

        if (count !== null && count >= 20) { // Increased limit for text posts
            return { success: false, error: 'Maximum 20 posts allowed' };
        }

        let publicUrl = null;

        // 2. Upload to Storage if file exists
        if (file) {
            const fileExt = file.name.split('.').pop();
            const fileName = `${userId}/${Math.random().toString(36).substring(2)}.${fileExt}`;
            const { error: uploadError } = await supabase.storage
                .from('user-photos')
                .upload(fileName, file);

            if (uploadError) {
                console.error('Upload error:', uploadError);
                return { success: false, error: 'Failed to upload image' };
            }

            const { data } = supabase.storage
                .from('user-photos')
                .getPublicUrl(fileName);
            publicUrl = data.publicUrl;
        }

        // 3. Insert into DB
        const { error: dbError } = await supabase
            .from('photos')
            .insert([{
                user_id: userId,
                url: publicUrl, // Can be null now
                caption: content
            }]);

        if (dbError) {
            console.error('DB Insert error:', dbError);
            return { success: false, error: 'Failed to save post' };
        }

        return { success: true };
    },

    uploadProfilePicture: async (userId: string, file: File): Promise<{ success: boolean; url?: string; error?: string }> => {
        if (!supabase) return { success: false, error: 'Supabase not initialized' };

        const fileExt = file.name.split('.').pop();
        const fileName = `avatars/${userId}-${Math.random().toString(36).substring(2)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
            .from('user-photos')
            .upload(fileName, file, { upsert: true });

        if (uploadError) {
            console.error('Upload error:', uploadError);
            return { success: false, error: 'Failed to upload image' };
        }

        const { data } = supabase.storage
            .from('user-photos')
            .getPublicUrl(fileName);

        return { success: true, url: data.publicUrl };
    },

    // Deprecated but kept for compatibility if needed, redirects to createPost
    uploadUserPhoto: async (userId: string, file: File, caption?: string): Promise<{ success: boolean; error?: string }> => {
        return MockService.createPost(userId, caption || '', file);
    },

    deleteUserPhoto: async (photoId: string): Promise<void> => {
        if (!supabase) return;
        // Note: We should technically delete from storage too, but for MVP just deleting DB record is safer/easier
        // to avoid complex path parsing. RLS will prevent unauthorized deletion.
        await supabase.from('photos').delete().eq('id', photoId);
    },

    searchUsers: async (query: string): Promise<User[]> => {
        if (!supabase || !query.trim()) return [];
        const { data } = await supabase
            .from('users')
            .select('*')
            .or(`name.ilike.%${query}%,username.ilike.%${query}%,college.ilike.%${query}%,branch.ilike.%${query}%`)
            .limit(20);
        return (data as User[]) || [];
    },

    getUnreadCount: async (userId: string): Promise<number> => {
        if (!supabase) return 0;
        const { count } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('receiver_id', userId)
            .eq('is_read', false);
        return count || 0;
    },

    markMessagesAsRead: async (userId: string, senderId: string): Promise<void> => {
        if (!supabase) return;
        await supabase
            .from('messages')
            .update({ is_read: true })
            .eq('receiver_id', userId)
            .eq('sender_id', senderId)
            .eq('is_read', false);
    },

    getRecentPhotos: async (): Promise<any[]> => {
        if (!supabase) return [];
        const { data, error } = await supabase
            .from('photos')
            .select(`
                *,
                users (
                    id,
                    name,
                    username,
                    profile_image,
                    college,
                    year
                )
            `)
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) {
            console.error('Error fetching recent photos:', error);
            return [];
        }
        return data || [];
    },

    toggleLike: async (photoId: string, userId: string) => {
        if (!supabase) return;

        // Check if already liked
        const { data } = await supabase
            .from('likes')
            .select('*')
            .eq('photo_id', photoId)
            .eq('user_id', userId)
            .single();

        if (data) {
            // Unlike
            await supabase
                .from('likes')
                .delete()
                .eq('photo_id', photoId)
                .eq('user_id', userId);
        } else {
            // Like
            await supabase
                .from('likes')
                .insert([{ photo_id: photoId, user_id: userId }]);
        }
    },

    getLikes: async (photoId: string): Promise<{ count: number }> => {
        if (!supabase) return { count: 0 };
        const { count } = await supabase
            .from('likes')
            .select('*', { count: 'exact', head: true })
            .eq('photo_id', photoId);
        return { count: count || 0 };
    },

    hasLiked: async (photoId: string, userId: string): Promise<boolean> => {
        if (!supabase) return false;
        const { data } = await supabase
            .from('likes')
            .select('*')
            .eq('photo_id', photoId)
            .eq('user_id', userId)
            .single();
        return !!data;
    },

    addComment: async (photoId: string, userId: string, content: string, parentId?: string) => {
        if (!supabase) return { comment: null };
        const { data, error } = await supabase
            .from('comments')
            .insert([{ photo_id: photoId, user_id: userId, content, parent_id: parentId }])
            .select(`
                *,
                users (
                    id,
                    name,
                    username,
                    profile_image
                )
            `)
            .single();

        if (error) {
            console.error('Error adding comment:', error);
            return { comment: null };
        }

        // --- Mention Notification Logic ---
        try {
            const mentionRegex = /@(\w+)/g;
            const matches = content.match(mentionRegex);

            if (matches) {
                const usernames = matches.map(m => m.substring(1)); // Remove @
                const uniqueUsernames = [...new Set(usernames)];

                // Find users by username
                const { data: mentionedUsers } = await supabase
                    .from('users')
                    .select('id, username')
                    .in('username', uniqueUsernames);

                if (mentionedUsers) {
                    for (const mentionedUser of mentionedUsers) {
                        if (mentionedUser.id !== userId) { // Don't notify self
                            await MockService.sendMessage(
                                userId,
                                mentionedUser.id,
                                `Mentioned you in a comment: "${content}"`
                            );
                        }
                    }
                }
            }
        } catch (err) {
            console.error('Error sending mention notifications:', err);
        }
        // ----------------------------------

        return { comment: data };
    },

    getComments: async (photoId: string): Promise<{ comments: any[] }> => {
        if (!supabase) return { comments: [] };
        const { data, error } = await supabase
            .from('comments')
            .select(`
                *,
                users (
                    id,
                    name,
                    username,
                    profile_image
                )
            `)
            .eq('photo_id', photoId)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching comments:', error);
            return { comments: [] };
        }
        return { comments: data || [] };
    },

    getConversations: async (userId: string): Promise<any[]> => {
        if (!supabase) return [];

        // 1. Fetch all messages involving the user
        const { data: messages, error } = await supabase
            .from('messages')
            .select('*')
            .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
            .order('created_at', { ascending: false });

        if (error || !messages) {
            console.error('Error fetching conversations:', error);
            return [];
        }

        // 2. Group by other user
        const conversationMap = new Map();

        for (const msg of messages) {
            const otherId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id;

            if (!conversationMap.has(otherId)) {
                conversationMap.set(otherId, {
                    otherUserId: otherId,
                    lastMessage: msg,
                    unreadCount: 0
                });
            }

            // Count unread if I am the receiver
            if (msg.receiver_id === userId && !msg.is_read) {
                const conv = conversationMap.get(otherId);
                conv.unreadCount += 1;
            }
        }

        // 3. Fetch user details for all conversation partners
        const otherUserIds = Array.from(conversationMap.keys());
        if (otherUserIds.length === 0) return [];

        const { data: users } = await supabase
            .from('users')
            .select('*')
            .in('id', otherUserIds);

        if (!users) return [];

        // 4. Combine data
        const conversations = users.map(user => {
            const conv = conversationMap.get(user.id);
            return {
                user,
                lastMessage: conv.lastMessage,
                unreadCount: conv.unreadCount
            };
        });

        // 5. Sort by last message time
        return conversations.sort((a, b) =>
            new Date(b.lastMessage.created_at).getTime() - new Date(a.lastMessage.created_at).getTime()
        );
    },
};
