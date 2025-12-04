'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MockService } from '@/lib/mock-service';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from "@/components/ui/skeleton";

export default function ChatListPage() {
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [conversations, setConversations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const user = await MockService.getCurrentUser();
                if (user) {
                    setCurrentUser(user);
                    const data = await MockService.getConversations(user.id);
                    setConversations(data);
                } else {
                    setCurrentUser(null); // Ensure currentUser is null if not logged in
                }
            } catch (error) {
                console.error("Failed to fetch chat data:", error);
                // Optionally handle error state
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 p-4 space-y-4">
                <Skeleton className="h-8 w-32 mb-4" />
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="bg-white p-4 rounded-xl border border-gray-100 flex items-center space-x-3">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="flex-1 space-y-2">
                            <div className="flex justify-between">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-3 w-12" />
                            </div>
                            <Skeleton className="h-3 w-3/4" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (!currentUser) {
        return <div className="p-4 text-center">Please log in to view messages.</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 space-y-4">
            <h1 className="text-2xl font-bold mb-4 text-black">Messages</h1>
            {conversations.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                    No messages yet. Start a conversation!
                </div>
            ) : (
                conversations.map(({ user, lastMessage, unreadCount }) => (
                    <Link key={user.id} href={`/chat/${user.id}`}>
                        <Card className="hover:bg-gray-50 transition-colors">
                            <CardContent className="p-4 flex items-center space-x-3">
                                <img
                                    src={user.profile_image}
                                    alt={user.name}
                                    className="w-12 h-12 rounded-full bg-gray-200 object-cover"
                                />
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline">
                                        <h3 className={`font-semibold truncate ${unreadCount > 0 ? 'text-black' : 'text-gray-900'}`}>
                                            {user.name}
                                        </h3>
                                        {lastMessage && (
                                            <span className={`text-xs ${unreadCount > 0 ? 'text-blue-600 font-bold' : 'text-gray-400'}`}>
                                                {new Date(lastMessage.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <p className={`text-sm truncate ${unreadCount > 0 ? 'font-bold text-black' : 'text-gray-500'}`}>
                                            {lastMessage ? (
                                                <>
                                                    {lastMessage.sender_id === currentUser?.id && 'You: '}
                                                    {lastMessage.content}
                                                </>
                                            ) : (
                                                'Tap to chat'
                                            )}
                                        </p>
                                        {unreadCount > 0 && (
                                            <span className="ml-2 bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                                {unreadCount}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))
            )}
        </div>
    );
}
