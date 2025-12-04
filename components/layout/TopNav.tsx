'use client';

import Link from 'next/link';
import { MessageCircle } from 'lucide-react';
import { useUnread } from '@/context/UnreadContext';

export function TopNav() {
    const { unreadCount } = useUnread();

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
            <div className="flex justify-between items-center h-14 max-w-md mx-auto px-4">
                <Link href="/home" className="text-xl font-bold font-serif tracking-wide">
                    College Connect
                </Link>

                <Link href="/chat" className="relative p-2 -mr-2 text-gray-700 hover:text-black">
                    <MessageCircle size={24} />
                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                    )}
                </Link>
            </div>
        </header>
    );
}
