'use client';

import { useState, useEffect } from 'react';
import { MockService } from '@/lib/mock-service';
import { User, Connection } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, X, MessageCircle } from 'lucide-react';
import Link from 'next/link';

export default function ConnectionsPage() {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [connections, setConnections] = useState<Connection[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [activeTab, setActiveTab] = useState<'requests' | 'connected'>('requests');

    useEffect(() => {
        const fetchData = async () => {
            const user = await MockService.getCurrentUser();
            if (user) {
                setCurrentUser(user);
                const userConnections = await MockService.getConnections(user.id);
                setConnections(userConnections);
            }
            const allUsers = await MockService.getAllUsers();
            setUsers(allUsers);
        };
        fetchData();
    }, []);

    const handleAction = async (connectionId: string, status: 'accepted' | 'rejected') => {
        await MockService.updateConnectionStatus(connectionId, status);
        if (currentUser) {
            const updatedConnections = await MockService.getConnections(currentUser.id);
            setConnections(updatedConnections);
        }
    };

    const getUser = (userId: string) => users.find(u => u.id === userId);

    const pendingRequests = connections.filter(c =>
        c.receiver_id === currentUser?.id && c.status === 'pending'
    );

    const connectedUsers = connections.filter(c =>
        c.status === 'accepted'
    ).map(c => {
        const otherUserId = c.requester_id === currentUser?.id ? c.receiver_id : c.requester_id;
        return { connection: c, user: getUser(otherUserId) };
    }).filter(item => item.user);

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white p-4 shadow-sm sticky top-0 z-10">
                <div className="flex space-x-4 border-b">
                    <button
                        className={`pb-2 text-sm font-medium ${activeTab === 'requests' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
                        onClick={() => setActiveTab('requests')}
                    >
                        Requests ({pendingRequests.length})
                    </button>
                    <button
                        className={`pb-2 text-sm font-medium ${activeTab === 'connected' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
                        onClick={() => setActiveTab('connected')}
                    >
                        My Connections ({connectedUsers.length})
                    </button>
                </div>
            </div>

            <div className="p-4 space-y-4">
                {activeTab === 'requests' && (
                    pendingRequests.length === 0 ? (
                        <div className="text-center py-10 text-gray-500">No pending requests.</div>
                    ) : (
                        pendingRequests.map(c => {
                            const requester = getUser(c.requester_id);
                            if (!requester) return null;
                            return (
                                <Card key={c.id}>
                                    <CardContent className="p-4 flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <img
                                                src={requester.profile_image}
                                                alt={requester.name}
                                                className="w-12 h-12 rounded-full bg-gray-200 object-cover"
                                            />
                                            <div>
                                                <h3 className="font-semibold">{requester.name}</h3>
                                                <p className="text-xs text-gray-500">{requester.college} • {requester.branch}</p>
                                            </div>
                                        </div>
                                        <div className="flex space-x-2">
                                            <Button size="icon" variant="outline" className="h-8 w-8 text-red-500" onClick={() => handleAction(c.id, 'rejected')}>
                                                <X size={16} />
                                            </Button>
                                            <Button size="icon" className="h-8 w-8 bg-green-500 hover:bg-green-600" onClick={() => handleAction(c.id, 'accepted')}>
                                                <Check size={16} />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })
                    )
                )}

                {activeTab === 'connected' && (
                    connectedUsers.length === 0 ? (
                        <div className="text-center py-10 text-gray-500">No connections yet.</div>
                    ) : (
                        connectedUsers.map(({ connection, user }) => (
                            <Card key={connection.id}>
                                <CardContent className="p-4 flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <img
                                            src={user!.profile_image}
                                            alt={user!.name}
                                            className="w-12 h-12 rounded-full bg-gray-200 object-cover"
                                        />
                                        <div>
                                            <h3 className="font-semibold">{user!.name}</h3>
                                            <p className="text-xs text-gray-500">{user!.college} • {user!.branch}</p>
                                        </div>
                                    </div>
                                    <Link href={`/chat/${user!.id}`}>
                                        <Button size="sm" variant="outline">
                                            <MessageCircle className="w-4 h-4 mr-2" />
                                            Chat
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        ))
                    )
                )}
            </div>
        </div>
    );
}
