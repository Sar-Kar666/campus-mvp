'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MockService } from '@/lib/mock-service';
import { User } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LogOut, Edit2, Save } from 'lucide-react';
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
                        year: currentUser.year === '1st' && currentUser.college === 'Unknown' ? '' : currentUser.year, // Handle default logic
                    });
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
        localStorage.removeItem('cc_user_id'); // Clear local storage fallback
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
        console.log('Saving profile...', editForm);
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
                // Optionally show an error toast here
            }
        } catch (error) {
            console.error('Error saving profile:', error);
        }
    };

    console.log('Render ProfilePage. isEditing:', isEditing, 'editForm:', editForm);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-50 p-4 space-y-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>My Profile</CardTitle>
                    <div className="flex items-center gap-2">
                        {!isEditing && (
                            <Button id="edit-profile-btn" variant="ghost" size="icon" onClick={() => setIsEditing(true)}>
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
                                    <Badge key={i} variant="secondary">{interest}</Badge>
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
