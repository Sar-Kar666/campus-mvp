'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { MockService } from '@/lib/mock-service';

interface UnreadContextType {
    unreadCount: number;
    incrementUnread: () => void;
    decrementUnread: (amount?: number) => void;
    setUnread: (count: number) => void;
    refreshUnread: () => Promise<void>;
    markMessagesAsRead: (userId: string, senderId: string) => Promise<void>;
}

const UnreadContext = createContext<UnreadContextType | undefined>(undefined);

export function UnreadProvider({ children }: { children: React.ReactNode }) {
    const [unreadCount, setUnreadCount] = useState(0);

    const refreshUnread = async () => {
        const userId = localStorage.getItem('cc_user_id');
        if (userId) {
            const count = await MockService.getUnreadCount(userId);
            setUnreadCount(count);
        }
    };

    useEffect(() => {
        refreshUnread();
    }, []);

    const incrementUnread = () => setUnreadCount((prev) => prev + 1);

    const decrementUnread = (amount = 1) => {
        setUnreadCount((prev) => Math.max(0, prev - amount));
    };

    const setUnread = (count: number) => setUnreadCount(count);

    const markMessagesAsRead = async (userId: string, senderId: string) => {
        await MockService.markMessagesAsRead(userId, senderId);
        await refreshUnread();
    };

    return (
        <UnreadContext.Provider value={{ unreadCount, incrementUnread, decrementUnread, setUnread, refreshUnread, markMessagesAsRead }}>
            {children}
        </UnreadContext.Provider>
    );
}

export function useUnread() {
    const context = useContext(UnreadContext);
    if (context === undefined) {
        throw new Error('useUnread must be used within an UnreadProvider');
    }
    return context;
}
