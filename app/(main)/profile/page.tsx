'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { MockService } from '@/lib/mock-service';
import { User } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from "@/components/ui/textarea";
import { Badge } from '@/components/ui/badge';
import { LogOut, Edit2, Save, Trash2, Grid, Bookmark, SquareUser, X, UserPlus, Share2, Camera } from 'lucide-react';
import { Select } from '@/components/ui/select';
import { College, Branch, Year } from '@/types';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { FeedPost } from '@/components/FeedPost';
import { toast } from "sonner";

import { AuthService } from '@/lib/auth-service';
import { isGoldenUser } from '@/lib/constants';
import { Crown } from 'lucide-react';

const COLLEGES: College[] = ['TIT', 'ICFAI', 'Techno', 'JIS', 'KIIT', 'VIT', 'LPU'];
const BRANCHES: Branch[] = ['CSE', 'ECE', 'ME', 'CE', 'IT', 'AIML', 'BBA', 'MBA'];
const YEARS: Year[] = ['1st', '2nd', '3rd', '4th'];

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        name: '',
        username: '',
        bio: '',
        interests: '',
        profile_image: '',
        college: '',
        branch: '',
        year: '',
    });
    const [connectionCount, setConnectionCount] = useState(0);
    const [photos, setPhotos] = useState<{ id: string; url: string | null; caption?: string }[]>([]);
    const [selectedPost, setSelectedPost] = useState<any>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchPhotos = async (userId: string) => {
        const userPhotos = await MockService.getUserPhotos(userId);
        setPhotos(userPhotos);
    };

    const fetchStats = async (userId: string) => {
        const connections = await MockService.getConnections(userId);
        // Filter for accepted connections only
        const accepted = connections.filter(c => c.status === 'accepted');
        setConnectionCount(accepted.length);
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const currentUser = await MockService.getCurrentUser();
                if (currentUser) {
                    setUser(currentUser);
                    setEditForm({
                        name: currentUser.name,
                        username: currentUser.username || '',
                        bio: currentUser.bio || '',
                        interests: currentUser.interests.join(', '),
                        profile_image: currentUser.profile_image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.name}`,
                        college: currentUser.college === 'Unknown' ? '' : currentUser.college,
                        branch: currentUser.branch === 'Unknown' ? '' : currentUser.branch,
                        year: currentUser.year === '1st' && currentUser.college === 'Unknown' ? '' : currentUser.year,
                    });
                    fetchPhotos(currentUser.id);
                    fetchStats(currentUser.id);
                } else {
                    router.push('/onboarding');
                }
            } catch (error) {
                console.error('Error loading profile:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [router]);

    const handleLogout = async () => {
        if (!confirm('Are you sure you want to logout?')) return;
        await AuthService.signOut();
        localStorage.removeItem('cc_user_id');
        router.push('/onboarding');
    };



    const handleSave = async () => {
        if (!user) return;

        try {
            const updatedUser = {
                ...user,
                name: editForm.name,
                username: editForm.username,
                bio: editForm.bio,
                interests: editForm.interests.split(',').map(i => i.trim()).filter(i => i),
                profile_image: editForm.profile_image,
                college: editForm.college || 'Unknown',
                branch: editForm.branch || 'Unknown',
                year: editForm.year || '1st',
            };

            const savedUser = await MockService.saveCurrentUser(updatedUser);

            if (savedUser) {
                setUser(savedUser);
                setIsEditing(false);
            } else {
                console.error('Failed to save user');
            }
        } catch (error) {
            console.error('Error saving profile:', error);
        }
    };

    const [showConnections, setShowConnections] = useState(false);
    const [connectionsList, setConnectionsList] = useState<any[]>([]);

    const fetchConnectionsList = async (userId: string) => {
        const connections = await MockService.getConnections(userId);
        const accepted = connections.filter(c => c.status === 'accepted');

        // Fetch user details for each connection
        const userIds = accepted.map(c => c.requester_id === userId ? c.receiver_id : c.requester_id);
        if (userIds.length > 0) {
            const users = await MockService.getUsersByIds(userIds);
            setConnectionsList(users);
        } else {
            setConnectionsList([]);
        }
    };

    const handleShowConnections = () => {
        if (!user) return;
        fetchConnectionsList(user.id);
        setShowConnections(true);
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }



    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;

        // Optimistic update (optional, but let's wait for upload)
        const toastId = toast.loading("Uploading image...");

        const { success, url, error } = await MockService.uploadProfilePicture(user.id, file);

        if (success && url) {
            setEditForm(prev => ({ ...prev, profile_image: url }));
            toast.success("Image uploaded!", { id: toastId });
        } else {
            toast.error(error || "Failed to upload image", { id: toastId });
        }
    };

    const handleCameraClick = () => {
        fileInputRef.current?.click();
    };

    if (!user) return null;

    const isGolden = isGoldenUser(user.username);

    return (
        <div className={`min-h-screen pb-20 ${isGolden ? 'bg-gradient-to-b from-amber-50 via-white to-white' : 'bg-white'}`}>
            <div className="max-w-md mx-auto pt-6 px-4">
                {/* Top Section: Avatar & Stats */}
                <div className="flex items-center gap-6">
                    {/* Avatar */}
                    <div className={`relative shrink-0 group ${isGolden ? 'p-[3px] rounded-full bg-gradient-to-tr from-amber-300 via-yellow-400 to-amber-500' : ''}`}>
                        <img
                            src={isEditing ? editForm.profile_image : user.profile_image}
                            alt={user.name}
                            className={`w-24 h-24 rounded-full bg-gray-200 object-cover border-4 ${isGolden ? 'border-white' : 'border-gray-200'}`}
                        />
                        {isEditing && (
                            <div
                                className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full cursor-pointer hover:bg-black/50 transition-colors"
                                onClick={handleCameraClick}
                                title="Upload Photo"
                            >
                                <Camera className="text-white w-8 h-8 opacity-80" />
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                            </div>
                        )}
                    </div>

                    {/* Right Side: Name & Stats */}
                    <div className="flex-1 min-w-0 space-y-4">
                        {!isEditing && (
                            <div className="flex items-center gap-2">
                                <h2 className={`text-xl font-bold truncate ${isGolden ? 'text-amber-600' : 'text-black'}`}>{user.name}</h2>
                                {isGolden && <Crown size={20} className="text-amber-500 fill-amber-500" />}
                            </div>
                        )}

                        {!isEditing && (
                            <div className="flex gap-8">
                                <div className="text-center">
                                    <div className="font-bold text-lg text-black">{photos.length}</div>
                                    <div className="text-sm text-gray-600">posts</div>
                                </div>
                                <div onClick={handleShowConnections} className="text-center cursor-pointer hover:opacity-70 transition-opacity">
                                    <div className="font-bold text-lg text-black">{connectionCount}</div>
                                    <div className="text-sm text-gray-600">connections</div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Middle Section: Bio & Info */}
                <div className="space-y-3">
                    {!isEditing ? (
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
                    ) : (
                        /* Edit Form */
                        <div className="space-y-6 pt-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-900 uppercase tracking-wide">Name</label>
                                    <Input
                                        value={editForm.name}
                                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                        className="bg-white text-black border-gray-200 focus:border-black transition-colors"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-900 uppercase tracking-wide">Username</label>
                                    <Input
                                        value={editForm.username}
                                        onChange={(e) => setEditForm({ ...editForm, username: e.target.value.toLowerCase().replace(/\s/g, '') })}
                                        className="bg-white text-black border-gray-200 focus:border-black transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-900 uppercase tracking-wide">Bio</label>
                                <Textarea
                                    value={editForm.bio}
                                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                                    placeholder="Tell us about yourself"
                                    className="bg-white text-black border-gray-200 focus:border-black transition-colors min-h-[80px] resize-none"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-900 uppercase tracking-wide">Interests</label>
                                <div className="flex flex-wrap gap-2 p-3 bg-white border border-gray-200 rounded-md focus-within:border-black transition-colors">
                                    {editForm.interests.split(',').filter(i => i.trim()).map((interest, i) => (
                                        <span key={i} className="flex items-center px-3 py-1 rounded-full bg-gray-100 text-sm font-medium text-gray-900">
                                            {interest.trim()}
                                            <button
                                                onClick={() => {
                                                    const newInterests = editForm.interests.split(',').filter((_, index) => index !== i).join(', ');
                                                    setEditForm({ ...editForm, interests: newInterests });
                                                }}
                                                className="ml-2 text-gray-400 hover:text-red-500 focus:outline-none"
                                            >
                                                <X size={14} />
                                            </button>
                                        </span>
                                    ))}
                                    <input
                                        className="flex-1 min-w-[120px] outline-none text-sm py-1 bg-transparent text-black placeholder:text-gray-400"
                                        placeholder={editForm.interests ? "Add another..." : "Type interest & press Enter"}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ',') {
                                                e.preventDefault();
                                                const val = e.currentTarget.value.trim();
                                                if (val) {
                                                    const current = editForm.interests.split(',').map(i => i.trim()).filter(i => i);
                                                    if (!current.includes(val)) {
                                                        setEditForm({ ...editForm, interests: [...current, val].join(', ') });
                                                    }
                                                    e.currentTarget.value = '';
                                                }
                                            } else if (e.key === 'Backspace' && e.currentTarget.value === '') {
                                                const current = editForm.interests.split(',').map(i => i.trim()).filter(i => i);
                                                if (current.length > 0) {
                                                    current.pop();
                                                    setEditForm({ ...editForm, interests: current.join(', ') });
                                                }
                                            }
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <Select value={editForm.college} onChange={(e) => setEditForm({ ...editForm, college: e.target.value })}>
                                    <option value="">College</option>
                                    {COLLEGES.map(c => <option key={c} value={c}>{c}</option>)}
                                </Select>
                                <Select value={editForm.branch} onChange={(e) => setEditForm({ ...editForm, branch: e.target.value })}>
                                    <option value="">Branch</option>
                                    {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                                </Select>
                                <Select value={editForm.year} onChange={(e) => setEditForm({ ...editForm, year: e.target.value })}>
                                    <option value="">Year</option>
                                    {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                                </Select>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button
                                    variant="outline"
                                    className="flex-1 h-11 font-semibold border-gray-200 hover:bg-gray-50 hover:text-black"
                                    onClick={() => setIsEditing(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    className="flex-1 h-11 bg-black text-white hover:bg-gray-800 font-semibold"
                                    onClick={handleSave}
                                >
                                    Save Changes
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Action Buttons (Only show when NOT editing) */}
                {!isEditing && (
                    <div className="flex gap-2 pt-6">
                        <Button
                            className="flex-1 bg-gray-100 text-black hover:bg-gray-200 font-semibold rounded-lg h-9"
                            onClick={() => setIsEditing(true)}
                        >
                            Edit profile
                        </Button>
                        <Button
                            className="flex-1 bg-gray-100 text-black hover:bg-gray-200 font-semibold rounded-lg h-9"
                            onClick={() => {
                                navigator.clipboard.writeText(window.location.href);
                                toast.success("Profile link copied!");
                            }}
                        >
                            Share profile
                        </Button>
                    </div>
                )}

                {/* Instagram-style Tabs - Simplified */}
                {!isEditing && (
                    <div className="flex justify-center pb-2 mt-8">
                        <button
                            className={`py-2 px-6 flex justify-center items-center text-black`}
                        >
                            <Grid size={24} />
                        </button>
                    </div>
                )}

                {/* Photo Grid - Only show when NOT editing */}
                {!isEditing && (
                    <div className="space-y-2">
                        <div className="grid grid-cols-3 gap-px bg-white">
                            {photos.map((photo) => (
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
                                        <div className="w-full h-full flex flex-col items-center justify-center bg-black p-2 text-center">
                                            <p className="text-white text-[10px] leading-tight line-clamp-3 font-agbalumo" style={{ fontFamily: 'var(--font-agbalumo)' }}>
                                                {photo.caption}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))}
                            {photos.length === 0 && (
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
                )}


            </div>


            {/* Post Detail Modal */}
            <Dialog open={!!selectedPost} onOpenChange={(open) => !open && setSelectedPost(null)}>
                <DialogContent className="p-0 max-w-sm bg-transparent border-none shadow-none">
                    {selectedPost && (
                        <div className="bg-white rounded-lg overflow-hidden">
                            <FeedPost
                                post={selectedPost}
                                onDelete={() => {
                                    setSelectedPost(null);
                                    if (user) {
                                        fetchPhotos(user.id);
                                        fetchStats(user.id);
                                    }
                                }}
                            />
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Connections List Modal */}
            <Dialog open={showConnections} onOpenChange={setShowConnections}>
                <DialogContent className="max-w-sm max-h-[80vh] overflow-y-auto">
                    <div className="space-y-4">
                        <h3 className="font-bold text-lg text-center border-b pb-2">Connections</h3>
                        {connectionsList.length === 0 ? (
                            <p className="text-center text-gray-500 py-4">No connections yet.</p>
                        ) : (
                            <div className="space-y-3">
                                {connectionsList.map((connUser) => (
                                    <div key={connUser.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer" onClick={() => router.push(`/profile/${connUser.id}`)}>
                                        <div className="flex items-center space-x-3">
                                            <img
                                                src={connUser.profile_image || `https://ui-avatars.com/api/?name=${connUser.name}`}
                                                alt={connUser.name}
                                                className="w-10 h-10 rounded-full object-cover"
                                            />
                                            <div>
                                                <p className="font-semibold text-sm">{connUser.name}</p>
                                                <p className="text-xs text-gray-500">@{connUser.username}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div >
    );
}
