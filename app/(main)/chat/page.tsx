'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MockService } from '@/lib/mock-service';
import { User, Connection } from '@/types';
import { Card, CardContent } from '@/components/ui/card';

export default function ChatListPage() {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [connectedUsers, setConnectedUsers] = useState<User[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            const user = await MockService.getCurrentUser();
            if (user) {
                setCurrentUser(user);
                const connections = await MockService.getConnections(user.id);
                const allUsers = await MockService.getAllUsers();

                const friends = connections
                    .filter(c => c.status === 'accepted')
                    .map(c => {
                        const otherId = c.requester_id === user.id ? c.receiver_id : c.requester_id;
                        return allUsers.find(u => u.id === otherId);
                    })
                    .filter((u): u is User => !!u);

                // Deduplicate friends by ID
                const uniqueFriends = Array.from(new Map(friends.map(f => [f.id, f])).values());

                setConnectedUsers(uniqueFriends);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 p-4 space-y-4">
            <h1 className="text-2xl font-bold mb-4">Messages</h1>
            {connectedUsers.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                    No connections yet. Connect with students to start chatting.
                </div>
            ) : (
                connectedUsers.map(user => (
                    <Link key={user.id} href={`/chat/${user.id}`}>
                        <Card className="hover:bg-gray-50 transition-colors">
                            <CardContent className="p-4 flex items-center space-x-3">
                                <img
                                    src={user.profile_image}
                                    alt={user.name}
                                    className="w-12 h-12 rounded-full bg-gray-200 object-cover"
                                />
                                <div className="flex-1">
                                    <h3 className="font-semibold">{user.name}</h3>
                                    <p className="text-xs text-gray-500 line-clamp-1">Tap to chat</p>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))
            )}
        </div>
    );
}
