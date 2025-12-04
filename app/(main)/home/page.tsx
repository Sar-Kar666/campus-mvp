'use client';

import { useState, useEffect } from 'react';
import { MockService } from '@/lib/mock-service';
import { FeedPost } from '@/components/FeedPost';

export default function HomePage() {
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            const data = await MockService.getRecentPhotos();
            setPosts(data);
            setLoading(false);
        };

        fetchPosts();
    }, []);

    if (loading) {
        return <div className="flex justify-center items-center h-64 text-gray-400">Loading feed...</div>;
    }

    return (
        <div className="bg-white min-h-screen">
            {posts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center px-4">
                    <p className="text-gray-500 mb-2">No posts yet.</p>
                    <p className="text-sm text-gray-400">Connect with students and upload photos to see them here!</p>
                </div>
            ) : (
                <div className="flex flex-col">
                    {posts.map((post) => (
                        <FeedPost
                            key={post.id}
                            post={post}
                            onDelete={() => setPosts(posts.filter(p => p.id !== post.id))}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
