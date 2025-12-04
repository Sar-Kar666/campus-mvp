'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { MockService } from '@/lib/mock-service';
import { FeedPost } from '@/components/FeedPost';

export default function HomePage() {
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [isFetchingMore, setIsFetchingMore] = useState(false);
    const observer = useRef<IntersectionObserver | null>(null);
    const lastPostElementRef = useCallback((node: HTMLDivElement) => {
        if (loading || isFetchingMore) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prevPage => prevPage + 1);
            }
        });
        if (node) observer.current.observe(node);
    }, [loading, isFetchingMore, hasMore]);

    useEffect(() => {
        const fetchInitialPosts = async () => {
            const data = await MockService.getRecentPhotos(0, 5); // Fetch fewer initially for speed
            setPosts(data);
            setLoading(false);
            if (data.length < 5) setHasMore(false);
        };

        fetchInitialPosts();
    }, []);

    useEffect(() => {
        if (page === 0) return; // Already handled by initial fetch

        const fetchMorePosts = async () => {
            setIsFetchingMore(true);
            const data = await MockService.getRecentPhotos(page, 5);

            if (data.length === 0) {
                setHasMore(false);
            } else {
                setPosts(prev => {
                    // Filter out duplicates just in case
                    const newPosts = data.filter(p => !prev.some(existing => existing.id === p.id));
                    return [...prev, ...newPosts];
                });
                if (data.length < 5) setHasMore(false);
            }
            setIsFetchingMore(false);
        };

        fetchMorePosts();
    }, [page]);

    if (loading) {
        return <div className="flex justify-center items-center h-64 text-gray-400">Loading feed...</div>;
    }

    return (
        <div className="bg-white min-h-screen pb-20">
            {posts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center px-4">
                    <p className="text-gray-500 mb-2">No posts yet.</p>
                    <p className="text-sm text-gray-400">Connect with students and upload photos to see them here!</p>
                </div>
            ) : (
                <div className="flex flex-col">
                    {posts.map((post, index) => {
                        if (posts.length === index + 1) {
                            return (
                                <div ref={lastPostElementRef} key={post.id}>
                                    <FeedPost
                                        post={post}
                                        onDelete={() => setPosts(posts.filter(p => p.id !== post.id))}
                                    />
                                </div>
                            );
                        } else {
                            return (
                                <FeedPost
                                    key={post.id}
                                    post={post}
                                    onDelete={() => setPosts(posts.filter(p => p.id !== post.id))}
                                />
                            );
                        }
                    })}
                    {isFetchingMore && (
                        <div className="flex justify-center p-4">
                            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    )}
                    {!hasMore && posts.length > 0 && (
                        <div className="text-center p-4 text-gray-400 text-sm">
                            You're all caught up!
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
