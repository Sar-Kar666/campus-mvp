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
// ... imports

// ... inside component
const [activeTab, setActiveTab] = useState('posts');

// ... inside render, replacing the photos section
{/* Stats Section */ }
{
    !isEditing && (
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
    )
}

{/* Instagram-style Tabs */ }
{
    !isEditing && (
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
    )
}

{/* Photo Grid */ }
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

{
    isEditing && (
        <div className="flex space-x-2 pt-4">
            <Button id="cancel-profile-btn" className="flex-1" variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
            <Button id="save-profile-btn" className="flex-1" onClick={handleSave}>
                <Save size={16} className="mr-2" /> Save Changes
            </Button>
        </div>
    )
}
                </CardContent >
            </Card >
        </div >
    );
}
