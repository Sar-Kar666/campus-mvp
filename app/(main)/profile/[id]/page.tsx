'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MockService } from '@/lib/mock-service';
import { User, Connection } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserPlus, MessageSquare, ArrowLeft } from 'lucide-react';

export default function PublicProfilePage() {
    const params = useParams();
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [connectionStatus, setConnectionStatus] = useState<'pending' | 'accepted' | 'rejected' | 'none'>('none');
    const [photos, setPhotos] = useState<{ id: string; url: string }[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userId = params.id as string;
                if (!userId) return;

                const [fetchedUser, loggedInUser] = await Promise.all([
                    MockService.getUserById(userId),
                    MockService.getCurrentUser()
                ]);

                if (fetchedUser) {
                    setUser(fetchedUser);
                    // Fetch photos for the displayed user
                    const userPhotos = await MockService.getUserPhotos(userId);
                    setPhotos(userPhotos);
                }

                if (loggedInUser) {
                    setCurrentUser(loggedInUser);

                    // Check connection status
                    const connections = await MockService.getConnections(loggedInUser.id);
                    const connection = connections.find(c =>
                        (c.requester_id === loggedInUser.id && c.receiver_id === userId) ||
                        (c.receiver_id === loggedInUser.id && c.requester_id === userId)
                    );

                    if (connection) {
                        setConnectionStatus(connection.status);
                    }
                }
            } catch (error) {
                console.error('Error loading profile:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [params.id]);

    const handleConnect = async () => {
        if (!currentUser || !user) return;
        await MockService.sendConnectionRequest(currentUser.id, user.id);
        setConnectionStatus('pending');
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    if (!user) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4">
                <p>User not found</p>
                <Button onClick={() => router.back()}>Go Back</Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 space-y-4">
            <Button variant="ghost" className="mb-2" onClick={() => router.back()}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Student Profile</CardTitle>
                    {currentUser && currentUser.id !== user.id && (
                        <div className="flex gap-2">
                            {connectionStatus === 'none' && (
                                <Button size="sm" onClick={handleConnect}>
                                    <UserPlus className="mr-2 h-4 w-4" /> Connect
                                </Button>
                            )}
                            {connectionStatus === 'pending' && (
                                <Button size="sm" variant="outline" disabled>
                                    Request Sent
                                </Button>
                            )}
                            {connectionStatus === 'accepted' && (
                                <Button size="sm" variant="outline" onClick={() => router.push(`/chat?userId=${user.id}`)}>
                                    <MessageSquare className="mr-2 h-4 w-4" /> Message
                                </Button>
                            )}
                        </div>
                    )}
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex flex-col items-center space-y-3">
                        <div className="relative">
                            <img
                                src={user.profile_image || `https://ui-avatars.com/api/?name=${user.name}`}
                                alt={user.name}
                                className="w-24 h-24 rounded-full bg-gray-200 object-cover border-4 border-white shadow-sm"
                            />
                        </div>

                        <div className="text-center">
                            <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
                            <p className="text-sm text-gray-900 font-medium mt-1">
                                {user.college === 'Unknown' ? 'College N/A' : user.college} •
                                {user.branch === 'Unknown' ? 'Branch N/A' : user.branch} •
                                {user.year}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-bold text-gray-900">Bio</label>
                        </div>
                        <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md border border-gray-200">
                            {user.bio || 'No bio added yet.'}
                        </p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-500">Interests</label>
                        <div className="flex flex-wrap gap-2">
                            {user.interests.map((interest, i) => (
                                <Badge key={i} className="bg-gray-900 text-white hover:bg-gray-800">{interest}</Badge>
                            ))}
                            {user.interests.length === 0 && <span className="text-sm text-gray-400">No interests listed</span>}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-900">Photos</label>
                        <div className="grid grid-cols-3 gap-0.5">
                            {photos.map((photo) => (
                                <div key={photo.id} className="relative aspect-square">
                                    <img
                                        src={photo.url}
                                        alt="User photo"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            ))}
                            {photos.length === 0 && (
                                <div className="col-span-3 text-center py-8 text-gray-400 text-sm bg-gray-50">
                                    No photos yet
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
