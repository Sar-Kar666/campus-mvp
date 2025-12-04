'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/types';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Grid, Crown } from 'lucide-react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { FeedPost } from '@/components/FeedPost';
import { isGoldenUser } from '@/lib/constants';
import { MockService } from '@/lib/mock-service';

interface ProfileViewProps {
    user: User;
    currentUser: User | null;
    initialPhotos: any[];
    initialConnectionStatus: 'pending' | 'accepted' | 'rejected' | 'none';
    initialConnectionCount: number;
}

export function ProfileView({
    user,
    currentUser,
    initialPhotos,
    initialConnectionStatus,
    initialConnectionCount
}: ProfileViewProps) {
    const router = useRouter();
    const [loggedInUser, setLoggedInUser] = useState<User | null>(currentUser);
    const [connectionStatus, setConnectionStatus] = useState(initialConnectionStatus);
    const [selectedPost, setSelectedPost] = useState<any>(null);

    // We don't really need state for photos/count unless we implement real-time updates here,
    // but for now props are fine. If we wanted to support "Load More", we'd need state.
    // Let's keep it simple.

    useEffect(() => {
        if (!loggedInUser) {
            const fetchUserAndStatus = async () => {
                const me = await MockService.getCurrentUser();
                if (me) {
                    setLoggedInUser(me);
                    const connections = await MockService.getConnections(me.id);
                    const conn = connections.find(c =>
                        (c.requester_id === me.id && c.receiver_id === user.id) ||
                        (c.receiver_id === me.id && c.requester_id === user.id)
                    );
                    if (conn) setConnectionStatus(conn.status);
                }
            };
            fetchUserAndStatus();
        }
    }, []);

    const handleConnect = async () => {
        if (!loggedInUser || !user) return;
        await MockService.sendConnectionRequest(loggedInUser.id, user.id);
        setConnectionStatus('pending');
    };

    const isGolden = isGoldenUser(user.username);

    return (
        <div className={`min-h-screen pb-20 ${isGolden ? 'bg-gradient-to-b from-amber-50 via-white to-white' : 'bg-white'}`}>
            <div className="max-w-md mx-auto pt-6 px-4">
                <Button variant="ghost" className="mb-4 -ml-2 text-black hover:bg-gray-100" onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>

                {/* Top Section: Avatar & Stats */}
                <div className="flex items-center gap-6">
                    {/* Avatar */}
                    <div className={`relative shrink-0 ${isGolden ? 'p-[3px] rounded-full bg-gradient-to-tr from-amber-300 via-yellow-400 to-amber-500' : ''}`}>
                        <img
                            src={user.profile_image || `https://ui-avatars.com/api/?name=${user.name}`}
                            alt={user.name}
                            className={`w-24 h-24 rounded-full bg-gray-200 object-cover border-4 ${isGolden ? 'border-white' : 'border-gray-200'}`}
                        />
                    </div>

                    {/* Right Side: Name & Stats */}
                    <div className="flex-1 min-w-0 space-y-4">
                        <div className="flex items-center gap-2">
                            <h2 className={`text-xl font-bold truncate ${isGolden ? 'text-amber-600' : 'text-black'}`}>{user.name}</h2>
                            {isGolden && <Crown size={20} className="text-amber-500 fill-amber-500" />}
                        </div>

                        <div className="flex gap-8">
                            <div className="text-center">
                                <div className="font-bold text-lg text-black">{initialPhotos.length}</div>
                                <div className="text-sm text-gray-600">posts</div>
                            </div>
                            <div className="text-center">
                                <div className="font-bold text-lg text-black">{initialConnectionCount}</div>
                                <div className="text-sm text-gray-600">connections</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Middle Section: Bio & Info */}
                <div className="space-y-3 mt-4">
                    <div className="space-y-1">
                        <div className="font-semibold text-black">@{user.username}</div>
                        <div className="text-sm text-gray-500">
                            {user.college === 'Unknown' ? '' : user.college} • {user.branch === 'Unknown' ? '' : user.branch} • {user.year}
                        </div>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap text-gray-800">
                            {user.bio || 'No bio added yet.'}
                        </p>
                        {user.interests.length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-2">
                                {user.interests.map((interest, i) => (
                                    <span key={i} className="px-3 py-1 rounded-full bg-gray-100 text-xs font-medium text-gray-800">
                                        {interest}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                {loggedInUser && loggedInUser.id !== user.id && (
                    <div className="flex gap-2 pt-6">
                        {connectionStatus === 'none' && (
                            <Button
                                className="flex-1 bg-black text-white hover:bg-gray-800 font-semibold rounded-lg h-9"
                                onClick={handleConnect}
                            >
                                Connect
                            </Button>
                        )}
                        {connectionStatus === 'pending' && (
                            <Button
                                className="flex-1 bg-gray-100 text-gray-500 font-semibold rounded-lg h-9"
                                disabled
                            >
                                Requested
                            </Button>
                        )}
                        {connectionStatus === 'accepted' && (
                            <Button
                                className="flex-1 bg-gray-100 text-black hover:bg-gray-200 font-semibold rounded-lg h-9"
                                onClick={() => router.push(`/chat?userId=${user.id}`)}
                            >
                                Message
                            </Button>
                        )}
                    </div>
                )}

                {/* Instagram-style Tabs - Simplified */}
                <div className="flex justify-center pb-2 mt-8">
                    <button
                        className={`py-2 px-6 flex justify-center items-center text-black`}
                    >
                        <Grid size={24} />
                    </button>
                </div>

                {/* Photo Grid */}
                <div className="space-y-2">
                    <div className="grid grid-cols-3 gap-px bg-white">
                        {initialPhotos.map((photo) => (
                            <div
                                key={photo.id}
                                className="relative aspect-square group bg-gray-100 cursor-pointer"
                                onClick={() => setSelectedPost({
                                    ...photo,
                                    created_at: new Date().toISOString(), // Fallback if not available
                                    users: user
                                })}
                            >
                                {photo.url ? (
                                    <img
                                        src={photo.url}
                                        alt="User photo"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    // @ts-ignore - caption might not exist on old type but we handle it
                                    <div className="w-full h-full flex flex-col items-center justify-center bg-black p-2 text-center">
                                        <p className="text-white text-[10px] leading-tight line-clamp-3 font-agbalumo" style={{ fontFamily: 'var(--font-agbalumo)' }}>
                                            {(photo as any).caption}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                        {initialPhotos.length === 0 && (
                            <div className="col-span-3 text-center py-12 text-gray-400 text-sm">
                                <div className="flex justify-center mb-2">
                                    <div className="p-4 rounded-full border-2 border-gray-200">
                                        <Grid size={32} className="text-gray-300" />
                                    </div>
                                </div>
                                <p className="font-semibold text-gray-900">No Posts Yet</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Post Detail Modal */}
            <Dialog open={!!selectedPost} onOpenChange={(open) => !open && setSelectedPost(null)}>
                <DialogContent className="p-0 max-w-sm bg-transparent border-none shadow-none">
                    {selectedPost && (
                        <div className="bg-white rounded-lg overflow-hidden">
                            <FeedPost post={selectedPost} />
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
