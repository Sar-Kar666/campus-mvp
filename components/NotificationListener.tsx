'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export function NotificationListener() {
    useEffect(() => {
        const userId = localStorage.getItem('cc_user_id');
        if (!userId || !supabase) return;

        const channel = supabase
            .channel('messages')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `receiver_id=eq.${userId}`,
                },
                async (payload) => {
                    if (!supabase) return;
                    // Fetch sender name
                    const { data: sender } = await supabase
                        .from('users')
                        .select('name')
                        .eq('id', payload.new.sender_id)
                        .single();

                    const senderName = sender?.name || 'Someone';
                    toast.info(`New message from ${senderName}`, {
                        description: payload.new.content,
                        duration: 4000,
                    });
                }
            )
            .subscribe();

        return () => {
            if (supabase) supabase.removeChannel(channel);
        };
    }, []);

    return null;
}
