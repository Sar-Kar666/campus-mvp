'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUnread } from '@/context/UnreadContext';
import { House, User, Search, MessageCircle, Plus } from 'lucide-react';
import { cn } from "@/lib/utils"
import { CreatePostModal } from '@/components/CreatePostModal';

export function BottomNav() {
    const pathname = usePathname();
    const { unreadCount } = useUnread();
    const [showCreatePost, setShowCreatePost] = useState(false);

    const links = [
        { href: '/home', label: 'Home', icon: House },
        { href: '/search', label: 'Search', icon: Search },
        { href: 'create-post', label: 'Post', icon: Plus },
        { href: '/chat', label: 'Messages', icon: MessageCircle },
        { href: '/profile', label: 'Profile', icon: User },
    ];

    return (
        <>
            <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 pb-safe">
                <div className="flex justify-around items-center h-12 max-w-md mx-auto px-2">
                    {links.map(({ href, label, icon: Icon }) => {
                        const isActive = pathname.startsWith(href);
                        const isCreatePost = href === 'create-post';

                        if (isCreatePost) {
                            return (
                                <button
                                    key={href}
                                    onClick={() => setShowCreatePost(true)}
                                    className="flex items-center justify-center w-full h-full text-black hover:scale-105 transition-transform"
                                >
                                    <Icon size={26} strokeWidth={showCreatePost ? 3 : 2} />
                                </button>
                            );
                        }

                        return (
                            <Link
                                key={href}
                                href={href}
                                className={cn(
                                    "flex items-center justify-center w-full h-full relative transition-colors",
                                    isActive ? "text-black" : "text-gray-500 hover:text-gray-900"
                                )}
                            >
                                <div className="relative">
                                    <Icon size={26} strokeWidth={isActive ? 3 : 2} />
                                    {label === 'Messages' && unreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                                    )}
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </nav>

            <CreatePostModal open={showCreatePost} onOpenChange={setShowCreatePost} />
        </>
    );
}
