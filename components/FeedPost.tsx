'use client';

import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';



import { useState, useEffect } from 'react';
import { Heart, MessageCircle, MoreHorizontal, Bookmark, Send, Trash2, X } from 'lucide-react';
import { MockService } from '@/lib/mock-service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

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

import { ShareModal } from './ShareModal';

export function FeedPost({ post, onDelete }: FeedPostProps) {
    const user = post.users;
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [showComments, setShowComments] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [comments, setComments] = useState<any[]>([]);
    const [newComment, setNewComment] = useState('');
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [replyingTo, setReplyingTo] = useState<{ id: string; name: string; username: string } | null>(null);
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
            setLikeCount(count);

            const { comments } = await MockService.getComments(post.id);
            setComments(comments);
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

    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || !currentUser) return;

        const { comment } = await MockService.addComment(post.id, currentUser.id, newComment, replyingTo?.id);
        if (comment) {
            setComments([...comments, comment]);
            setNewComment('');
            setReplyingTo(null);
        }
    };

    const handleReply = (comment: any) => {
        // If replying to a reply, use the PARENT'S id so it stays in the same thread
        // If replying to a root comment, use that comment's id
        const parentId = comment.parent_id || comment.id;

        setReplyingTo({
            id: parentId, // Use the root parent ID
            name: comment.users?.name,
            username: comment.users?.username || 'user'
        });
        setNewComment(`@${comment.users?.username || 'user'} `);
    };

    const rootComments = comments.filter(c => !c.parent_id);
    const getReplies = (commentId: string) => comments.filter(c => c.parent_id === commentId);

    const CommentItem = ({ comment, isReply = false }: { comment: any, isReply?: boolean }) => (
        <div className={`flex space-x-3 ${isReply ? 'ml-8 mt-2' : 'mt-4'}`}>
            <img
                src={comment.users?.profile_image || `https://ui-avatars.com/api/?name=${comment.users?.name}`}
                className="w-8 h-8 rounded-full object-cover"
                loading="lazy"
                decoding="async"
            />
            <div className="flex-1">
                <div className="bg-gray-100 p-3 rounded-lg rounded-tl-none">
                    <div className="flex justify-between items-start">
                        <span className="font-bold text-sm text-gray-900">{comment.users?.username}</span>
                        <span className="text-xs text-gray-500">{new Date(comment.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-gray-800 mt-1">{comment.content}</p>
                </div>
                <button
                    onClick={() => handleReply(comment)}
                    className="text-xs text-gray-500 font-semibold mt-1 hover:text-gray-800"
                >
                    Reply
                </button>
            </div>
        </div>
    );

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
                    <button className="hover:opacity-60 transition-opacity">
                        <Bookmark size={24} className="text-black" />
                    </button>
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
                {comments.length > 0 && (
                    <button onClick={() => setShowComments(true)} className="text-gray-500 text-sm">
                        View all {comments.length} comments
                    </button>
                )}
                {comments.slice(-2).map((comment) => (
                    <div key={comment.id} className="flex items-start space-x-1 mt-1">
                        <span className="font-bold text-sm text-gray-900">{comment.users?.name}</span>
                        <span className="text-sm text-gray-800 line-clamp-1">{comment.content}</span>
                    </div>
                ))}
            </div>

            {/* Timestamp */}
            <div className="px-3 pt-1">
                <p className="text-[10px] text-gray-500 uppercase tracking-wide">
                    {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                </p>
            </div>

            {/* Comments Dialog/Sheet */}
            <Dialog open={showComments} onOpenChange={setShowComments}>
                <DialogContent className="max-w-md h-[80vh] flex flex-col p-0 gap-0">
                    <DialogHeader className="p-4 border-b">
                        <DialogTitle className="text-center">Comments</DialogTitle>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto p-4 space-y-0">
                        {comments.length === 0 ? (
                            <div className="text-center text-gray-500 mt-10">No comments yet.</div>
                        ) : (
                            rootComments.map((comment) => (
                                <div key={comment.id}>
                                    <CommentItem comment={comment} />
                                    {getReplies(comment.id).map(reply => (
                                        <CommentItem key={reply.id} comment={reply} isReply={true} />
                                    ))}
                                </div>
                            ))
                        )}
                    </div>

                    <div className="p-3 border-t bg-white">
                        {replyingTo && (
                            <div className="flex justify-between items-center px-2 pb-2 text-xs text-gray-500">
                                <span>Replying to <b>{replyingTo.name}</b> (@{replyingTo.username})</span>
                                <button onClick={() => { setReplyingTo(null); setNewComment(''); }} className="text-black font-bold">Cancel</button>
                            </div>
                        )}
                        <form onSubmit={handleCommentSubmit} className="flex items-center space-x-2">
                            <Input
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder={replyingTo ? `Reply to @${replyingTo.username}...` : "Add a comment..."}
                                className="flex-1 border-none focus-visible:ring-0 bg-gray-50 text-gray-900 placeholder:text-gray-500"
                            />
                            <Button type="submit" variant="ghost" size="icon" disabled={!newComment.trim()}>
                                <Send size={18} className="text-blue-500" />
                            </Button>
                        </form>
                    </div>
                </DialogContent>
            </Dialog>

            <ShareModal
                isOpen={showShareModal}
                onClose={() => setShowShareModal(false)}
                postUrl={post.url}
                postId={post.id}
                postUsername={user.username || 'User'}
                postCaption={post.caption}
            />
        </div>
    );
}
