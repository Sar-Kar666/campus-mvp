'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MockService } from '@/lib/mock-service';
import { User } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LogOut, Edit2, Save, Trash2, Grid, Bookmark, SquareUser } from 'lucide-react';
import { Select } from '@/components/ui/select';
import { College, Branch, Year } from '@/types';

import { AuthService } from '@/lib/auth-service';

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
        bio: '',
        interests: '',
        profile_image: '',
        college: '',
        branch: '',
        year: '',
    });
    const [photos, setPhotos] = useState<{ id: string; url: string }[]>([]);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [activeTab, setActiveTab] = useState('posts');

    const fetchPhotos = async (userId: string) => {
        const userPhotos = await MockService.getUserPhotos(userId);
        setPhotos(userPhotos);
    };

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !e.target.files[0] || !user) return;
        setUploadingPhoto(true);
        try {
            const result = await MockService.uploadUserPhoto(user.id, e.target.files[0]);
            if (result.success) {
                await fetchPhotos(user.id);
            } else {
                alert(result.error || 'Failed to upload photo');
            }
        } catch (error) {
            console.error('Upload error:', error);
        } finally {
            setUploadingPhoto(false);
        }
    };

    const handlePhotoDelete = async (photoId: string) => {
        if (!confirm('Delete this photo?') || !user) return;
        try {
            await MockService.deleteUserPhoto(photoId);
            await fetchPhotos(user.id);
        } catch (error) {
            console.error('Delete error:', error);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const currentUser = await MockService.getCurrentUser();
                if (currentUser) {
                    setUser(currentUser);
                    setEditForm({
                        name: currentUser.name,
                        bio: currentUser.bio || '',
                        interests: currentUser.interests.join(', '),
                        profile_image: currentUser.profile_image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.name}`,
                        college: currentUser.college === 'Unknown' ? '' : currentUser.college,
                        branch: currentUser.branch === 'Unknown' ? '' : currentUser.branch,
                        year: currentUser.year === '1st' && currentUser.college === 'Unknown' ? '' : currentUser.year,
                    });
                    fetchPhotos(currentUser.id);
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

    const handleRegenerateAvatar = () => {
        const randomSeed = Math.random().toString(36).substring(7);
        setEditForm(prev => ({
            ...prev,
            profile_image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${randomSeed}`
        }));
    };

    const handleSave = async () => {
        if (!user) return;

        try {
            const updatedUser = {
                ...user,
                name: editForm.name,
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

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-50 p-4 space-y-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-2xl font-bold text-black">My Profile</CardTitle>
                    <div className="flex items-center gap-2">
                        {!isEditing && (
                            <Button id="edit-profile-btn" variant="ghost" size="icon" onClick={() => setIsEditing(true)} className="text-black hover:bg-gray-100">
                                <Edit2 size={20} />
                            </Button>
                        )}
                        <Button variant="ghost" size="icon" onClick={handleLogout} className="text-red-500">
                            <LogOut size={20} />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex flex-col items-center space-y-3">
                        <div className="relative">
                            <img
                                src={isEditing ? editForm.profile_image : user.profile_image}
                                alt={user.name}
                                className="w-24 h-24 rounded-full bg-gray-200 object-cover border-4 border-white shadow-sm"
                            />
                            {isEditing && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0 bg-white"
                                    onClick={handleRegenerateAvatar}
                                    title="Regenerate Avatar"
                                >
                                    <Edit2 size={12} />
                                </Button>
                            )}
                        </div>

                        {!isEditing ? (
                            <div className="text-center">
                                <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
                                <p className="text-sm text-gray-900 font-medium mt-1">
                                    {user.college === 'Unknown' ? 'College not set' : user.college} •
                                    {user.branch === 'Unknown' ? 'Branch not set' : user.branch} •
                                    {user.year}
                                </p>
                            </div>
                        ) : (
                            <div className="w-full max-w-xs space-y-3">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-900">Name</label>
                                    <Input
                                        id="name-input"
                                        value={editForm.name}
                                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                        className="text-center font-bold"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-left">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-900">College</label>
                                        <Select
                                            value={editForm.college}
                                            onChange={(e) => setEditForm({ ...editForm, college: e.target.value })}
                                        >
                                            <option value="">Select</option>
                                            {COLLEGES.map(c => <option key={c} value={c}>{c}</option>)}
                                        </Select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-900">Branch</label>
                                        <Select
                                            value={editForm.branch}
                                            onChange={(e) => setEditForm({ ...editForm, branch: e.target.value })}
                                        >
                                            <option value="">Select</option>
                                            {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                                        </Select>
                                    </div>
                                    <div className="space-y-1 col-span-2">
                                        <label className="text-xs font-bold text-gray-900">Year</label>
                                        <Select
                                            value={editForm.year}
                                            onChange={(e) => setEditForm({ ...editForm, year: e.target.value })}
                                        >
                                            <option value="">Select</option>
                                            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                                        </Select>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-bold text-gray-900">Bio</label>
                        </div>
                        {!isEditing ? (
                            <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md border border-gray-200">
                                {user.bio || 'No bio added yet.'}
                            </p>
                        ) : (
                            <Input
                                id="bio-input"
                                value={editForm.bio}
                                onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                                placeholder="Tell us about yourself"
                            />
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-900">Interests</label>
                        {!isEditing ? (
                            <div className="flex flex-wrap gap-2">
                                {user.interests.map((interest, i) => (
                                    <Badge key={i} className="bg-gray-900 text-white hover:bg-gray-800">{interest}</Badge>
                                ))}
                            </div>
                        ) : (
                            <Input
                                id="interests-input"
                                value={editForm.interests}
                                onChange={(e) => setEditForm({ ...editForm, interests: e.target.value })}
                                placeholder="Comma separated interests (e.g. Coding, Music)"
                            />
                        )}
                    </div>

                    {/* Stats Section */}
                    {!isEditing && (
                        <div className="flex justify-around text-center py-2 border-t border-gray-100">
                            <div>
                                <div className="font-bold text-lg">{photos.length}</div>
                                <div className="text-xs text-gray-500">Posts</div>
                            </div>
                            <div>
                                <div className="font-bold text-lg">0</div>
                                <div className="text-xs text-gray-500">Connections</div>
                            </div>
                            <div>
                                <div className="font-bold text-lg">0</div>
                                <div className="text-xs text-gray-500">Following</div>
                            </div>
                        </div>
                    )}

                    {/* Instagram-style Tabs */}
                    {!isEditing && (
                        <div className="flex border-t border-gray-200">
                            <button
                                onClick={() => setActiveTab('posts')}
                                className={`flex-1 py-3 flex justify-center items-center ${activeTab === 'posts' ? 'border-b-2 border-black text-black' : 'text-gray-400'}`}
                            >
                                <Grid size={24} />
                            </button>
                            <button
                                onClick={() => setActiveTab('saved')}
                                className={`flex-1 py-3 flex justify-center items-center ${activeTab === 'saved' ? 'border-b-2 border-black text-black' : 'text-gray-400'}`}
                            >
                                <Bookmark size={24} />
                            </button>
                            <button
                                onClick={() => setActiveTab('tagged')}
                                className={`flex-1 py-3 flex justify-center items-center ${activeTab === 'tagged' ? 'border-b-2 border-black text-black' : 'text-gray-400'}`}
                            >
                                <SquareUser size={24} />
                            </button>
                        </div>
                    )}

                    {/* Photo Grid */}
                    <div className="space-y-2">
                        {isEditing && (
                            <div className="flex justify-between items-center px-1">
                                <label className="text-sm font-bold text-gray-900">Photos ({photos.length}/5)</label>
                                {photos.length < 5 && (
                                    <div className="relative">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            onChange={handlePhotoUpload}
                                            disabled={uploadingPhoto}
                                        />
                                        <Button size="sm" variant="outline" disabled={uploadingPhoto}>
                                            {uploadingPhoto ? 'Uploading...' : 'Add Photo'}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'posts' ? (
                            <div className="grid grid-cols-3 gap-px bg-white">
                                {photos.map((photo) => (
                                    <div key={photo.id} className="relative aspect-square group bg-gray-100">
                                        <img
                                            src={photo.url}
                                            alt="User photo"
                                            className="w-full h-full object-cover"
                                        />
                                        {isEditing && (
                                            <button
                                                onClick={() => handlePhotoDelete(photo.id)}
                                                className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full"
                                            >
                                                <Trash2 size={12} />
                                            </button>
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
                        ) : (
                            <div className="py-12 text-center text-gray-400 text-sm">
                                <p>Nothing here yet</p>
                            </div>
                        )}
                    </div>

                    {isEditing && (
                        <div className="flex space-x-2 pt-4">
                            <Button id="cancel-profile-btn" className="flex-1" variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                            <Button id="save-profile-btn" className="flex-1" onClick={handleSave}>
                                <Save size={16} className="mr-2" /> Save Changes
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
