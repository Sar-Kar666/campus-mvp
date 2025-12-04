'use client';

import { useState } from 'react';
import { FeedPost } from '@/components/FeedPost';

interface FeedListProps {
    initialPosts: any[];
}

export function FeedList({ initialPosts }: FeedListProps) {
    const [posts, setPosts] = useState(initialPosts);

    if (posts.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-center px-4">
                <p className="text-gray-500 mb-2">No posts yet.</p>
                <p className="text-sm text-gray-400">Connect with students and upload photos to see them here!</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col">
            {posts.map((post) => (
                <FeedPost
                    key={post.id}
                    post={post}
                    onDelete={() => setPosts(posts.filter(p => p.id !== post.id))}
                />
            ))}
        </div>
    );
}
