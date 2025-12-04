'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { MessageCircle, Bell, Check, X, LogOut } from 'lucide-react';
import { useUnread } from '@/context/UnreadContext';
import { MockService } from '@/lib/mock-service';
import { AuthService } from '@/lib/auth-service';

export function TopNav() {
    const pathname = usePathname();
    const router = useRouter();
    const { unreadCount } = useUnread();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const notificationRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const init = async () => {
            const user = await MockService.getCurrentUser();
            setCurrentUser(user);
            if (user) {
                fetchNotifications(user.id);
            }
        };
        init();

        // Close dropdown when clicking outside
        const handleClickOutside = (event: MouseEvent) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchNotifications = async (userId: string) => {
        const pending = await MockService.getPendingConnections(userId);
        setNotifications(pending);
    };

    const handleAccept = async (connectionId: string) => {
        await MockService.acceptConnection(connectionId);
        if (currentUser) fetchNotifications(currentUser.id);
    };

    const handleReject = async (connectionId: string) => {
        await MockService.rejectConnection(connectionId);
        if (currentUser) fetchNotifications(currentUser.id);
    };

    const handleLogout = async () => {
        await AuthService.signOut();
        router.push('/login');
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
            <div className="flex justify-between items-center h-14 max-w-md mx-auto px-4">
                <Link href="/home" className="text-xl font-bold font-serif tracking-wide text-black">
                    College Connect
                </Link>

                <div className="flex items-center space-x-1">
                    {/* Notification Bell or Logout Button */}
                    {pathname === '/profile' ? (
                        <button
                            onClick={handleLogout}
                            className="p-2 text-red-500 hover:bg-gray-100 rounded-full"
                            title="Logout"
                        >
                            <LogOut size={24} />
                        </button>
                    ) : (
                        <div className="relative" ref={notificationRef}>
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="relative p-2 text-gray-700 hover:text-black"
                            >
                                <Bell size={24} />
                                {notifications.length > 0 && (
                                    <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                                )}
                            </button>

                            {/* Dropdown */}
                            {showNotifications && (
                                <div className="absolute right-0 top-12 w-80 bg-white shadow-xl rounded-lg border border-gray-100 overflow-hidden z-50">
                                    <div className="p-3 border-b border-gray-100 bg-gray-50">
                                        <h3 className="font-semibold text-sm">Notifications</h3>
                                    </div>
                                    <div className="max-h-80 overflow-y-auto">
                                        {notifications.length === 0 ? (
                                            <div className="p-8 text-center text-gray-500 text-sm">
                                                No new notifications
                                            </div>
                                        ) : (
                                            notifications.map((notif) => (
                                                <div key={notif.id} className="p-3 border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                                    <div className="flex items-start space-x-3">
                                                        <img
                                                            src={notif.requester.profile_image || `https://ui-avatars.com/api/?name=${notif.requester.name}`}
                                                            className="w-10 h-10 rounded-full object-cover"
                                                            alt={notif.requester.name}
                                                        />
                                                        <div className="flex-1">
                                                            <div className="text-sm text-black">
                                                                <span className="font-bold">@{notif.requester.username}</span> sent you a connection request.
                                                            </div>
                                                            <p className="text-xs text-gray-500 mt-0.5">{notif.requester.college}</p>
                                                            <div className="flex space-x-2 mt-2">
                                                                <button
                                                                    onClick={() => handleAccept(notif.id)}
                                                                    className="flex-1 bg-black text-white text-xs py-1.5 rounded-md hover:bg-gray-800 flex items-center justify-center"
                                                                >
                                                                    <Check size={12} className="mr-1" /> Accept
                                                                </button>
                                                                <button
                                                                    onClick={() => handleReject(notif.id)}
                                                                    className="flex-1 bg-gray-100 text-gray-700 text-xs py-1.5 rounded-md hover:bg-gray-200 flex items-center justify-center"
                                                                >
                                                                    <X size={12} className="mr-1" /> Decline
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
