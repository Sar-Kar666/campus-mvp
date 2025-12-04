'use client';

import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';



import { useState, useEffect } from 'react';
import { Heart, MessageCircle, MoreHorizontal, Bookmark, Send, Trash2, X } from 'lucide-react';
import { MockService } from '@/lib/mock-service';
import { Button } from '@/components/ui/button';


interface FeedPostProps {
    post: {
        id: string;
        url: string;
        created_at: string;
        caption?: string;
        users: {
            id: string;
            name: string;
            profile_image: string;
            college: string;
            year?: string;
            username?: string;
        };
    };
    onDelete?: () => void;
}

import dynamic from 'next/dynamic';

const ShareModal = dynamic(() => import('./ShareModal').then(mod => mod.ShareModal), {
    loading: () => null,
    ssr: false
});

// We can't easily dynamic import the Dialog parts individually as they are exports from a file.
// But we can dynamic import the Dialog itself if we wrap it or just the ShareModal is a big win.
// Let's also dynamic import the comments section content if possible, but for now ShareModal is a distinct component.
// To optimize Dialog, we would need to move the comments logic to a separate component and dynamic import that.

// Let's create a CommentsSheet component to lazy load the comments UI.
const CommentsSheet = dynamic(() => import('./CommentsSheet').then(mod => mod.CommentsSheet), {
    loading: () => null,
    ssr: false
});

export function FeedPost({ post, onDelete }: FeedPostProps) {
    const user = post.users;
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [commentCount, setCommentCount] = useState(0);
    const [showComments, setShowComments] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [showOptions, setShowOptions] = useState(false);

    useEffect(() => {
        const init = async () => {
            const curUser = await MockService.getCurrentUser();
            setCurrentUser(curUser);
            if (curUser) {
                const hasLiked = await MockService.hasLiked(post.id, curUser.id);
                setLiked(hasLiked);
            }
            const { count } = await MockService.getLikes(post.id);
            const { count: cCount } = await MockService.getCommentCount(post.id);
            setCommentCount(cCount);
        };
        init();
    }, [post.id]);

    const handleDelete = async () => {
        if (confirm('Are you sure you want to delete this post?')) {
            await MockService.deleteUserPhoto(post.id);
            if (onDelete) onDelete();
        }
        setShowOptions(false);
    };

    const handleLike = async () => {
        if (!currentUser) return;

        // Optimistic update
        const newLiked = !liked;
        setLiked(newLiked);
        setLikeCount(prev => newLiked ? prev + 1 : prev - 1);

        await MockService.toggleLike(post.id, currentUser.id);
    };



    return (
        <div className="bg-white border-b border-gray-100 pb-4 mb-4">
            {/* Header */}
            <div className="flex items-center justify-between p-3">
                <Link href={`/profile/${user.id}`} className="flex items-center space-x-3">
                    <img
                        src={user.profile_image || `https://ui-avatars.com/api/?name=${user.name}&background=random`}
                        alt={user.name}
                        loading="lazy"
                        decoding="async"
                        className="w-8 h-8 rounded-full object-cover border border-gray-100"
                    />
                    <div>
                        <p className="text-sm font-semibold text-gray-900">{user.username}</p>
                        <p className="text-[10px] text-gray-500">
                            {user.college} {user.year ? `• ${user.year}` : ''}
                        </p>
                    </div>
                </Link>

                {currentUser && currentUser.id === user.id && (
                    <div className="relative">
                        <button onClick={() => setShowOptions(!showOptions)} className="text-gray-500 hover:text-black">
                            <MoreHorizontal size={20} />
                        </button>
                        {showOptions && (
                            <div className="absolute right-0 top-8 bg-white shadow-lg rounded-md border border-gray-100 py-1 z-10 w-32">
                                <button
                                    onClick={handleDelete}
                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                                >
                                    <Trash2 size={14} className="mr-2" />
                                    Delete
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Post Content */}
            <div className="w-full">
                {post.url ? (
                    // Image Post
                    <div className="relative aspect-square bg-gray-100" onDoubleClick={handleLike}>
                        <img
                            src={post.url}
                            alt={post.caption || `Post by ${user.name}`}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            decoding="async"
                        />
                    </div>
                ) : (
                    // Text Post
                    <div className="aspect-square w-full bg-black flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
                        <p className="text-white text-4xl leading-relaxed z-10 relative drop-shadow-lg" style={{ fontFamily: 'var(--font-agbalumo)' }}>
                            {post.caption}
                        </p>
                        <p className="absolute bottom-8 right-8 text-white/80 text-xl italic font-serif z-10">
                            -{user.username}
                        </p>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="p-3">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={handleLike}
                            className="hover:opacity-60 transition-opacity"
                        >
                            <Heart
                                size={24}
                                className={liked ? "fill-red-500 text-red-500" : "text-black"}
                            />
                        </button>
                        <button onClick={() => setShowComments(true)} className="hover:opacity-60 transition-opacity">
                            <MessageCircle size={24} className="text-black" />
                        </button>
                        <button onClick={() => setShowShareModal(true)} className="hover:opacity-60 transition-opacity">
                            <Send size={24} className="text-black" />
                        </button>
                    </div>

                </div>

                {/* Likes */}
                <div className="font-bold text-sm mb-1 text-black">
                    {likeCount} likes
                </div>

                {/* Caption (Only for Image Posts, Text Posts have it inside) */}
                {post.url && post.caption && (
                    <div className="flex flex-col">
                        <span className="font-bold text-sm text-black mr-1">{user.username}</span>
                        <span className="text-sm text-gray-900">{post.caption}</span>
                    </div>
                )}

                {/* Comments Preview */}
                <button onClick={() => setShowComments(true)} className="text-gray-500 text-sm mt-1">
                    {commentCount > 0 ? `View all ${commentCount} comments` : 'Add a comment...'}
                </button>
            </div>

            {/* Timestamp */}
            <div className="px-3 pt-1">
                <p className="text-[10px] text-gray-500 uppercase tracking-wide">
                    {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                </p>
            </div>

            {/* Comments Sheet */}
            {showComments && (
                <CommentsSheet
                    isOpen={showComments}
                    onClose={setShowComments}
                    postId={post.id}
                    currentUser={currentUser}
                />
            )}

            <ShareModal
                isOpen={showShareModal}
                onClose={() => setShowShareModal(false)}
                postUrl={post.url}
                postId={post.id}
                postUsername={user.username || 'User'}
                postCaption={post.caption}
                postUserImage={user.profile_image}
            />
        </div>
    );
}
