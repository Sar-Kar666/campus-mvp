'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MockService } from '@/lib/mock-service';
import { FeedPost } from '@/components/FeedPost';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function PostPage() {
    const params = useParams();
    const router = useRouter();
    const [post, setPost] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPost = async () => {
            const postId = params.id as string;
            // We need a method to get a single post. 
            // MockService.getRecentPhotos() returns all. 
            // Let's assume we can filter or add a getPostById method.
            // For now, let's fetch feed and find it.
            const feed = await MockService.getRecentPhotos();
            const foundPost = feed.find((p: any) => p.id === postId);
            setPost(foundPost || null);
            setLoading(false);
        };
        fetchPost();
    }, [params.id]);

    if (loading) return <div className="p-4 text-center">Loading post...</div>;
    if (!post) return <div className="p-4 text-center">Post not found</div>;

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <div className="bg-white p-4 shadow-sm flex items-center space-x-3 sticky top-0 z-10">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft size={24} />
                </Button>
                <h1 className="font-semibold text-lg">Post</h1>
            </div>
            <div className="max-w-md mx-auto mt-4">
                <FeedPost post={post} />
            </div>
        </div>
    );
}
