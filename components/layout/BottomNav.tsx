'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, MessageCircle, User, Search } from 'lucide-react';
import { cn } from "@/lib/utils"
import { useUnread } from '@/context/UnreadContext';

export function BottomNav() {
    const pathname = usePathname();
    const { unreadCount } = useUnread();

    const links = [
        { href: '/discover', label: 'Discover', icon: Home },
        { href: '/search', label: 'Search', icon: Search },
        { href: '/connections', label: 'Connect', icon: Users },
        { href: '/chat', label: 'Chat', icon: MessageCircle, badge: unreadCount > 0 },
        { href: '/profile', label: 'Profile', icon: User },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 pb-safe">
            <div className="flex justify-around items-center h-16 max-w-md mx-auto">
                {links.map(({ href, label, icon: Icon, badge }) => {
                    const isActive = pathname.startsWith(href);
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={cn(
                                "flex flex-col items-center justify-center w-full h-full space-y-1 relative",
                                isActive ? "text-blue-600" : "text-gray-500 hover:text-gray-900"
                            )}
                        >
                            <div className="relative">
                                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                                {badge && (
                                    <span className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                                )}
                            </div>
                            <span className="text-[10px] font-medium">{label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
