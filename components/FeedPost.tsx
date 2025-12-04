'use client';

import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

interface FeedPostProps {
    post: {
        id: string;
        url: string;
        created_at: string;
        users: {
            id: string;
            name: string;
            profile_image: string;
            college: string;
        };
    };
}

import { useState, useEffect } from 'react';
import { Heart, MessageCircle, Send, X } from 'lucide-react';
import { MockService } from '@/lib/mock-service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface FeedPostProps {
    post: {
        id: string;
        url: string;
        created_at: string;
        users: {
            id: string;
            name: string;
            profile_image: string;
            college: string;
        };
    };
}

export function FeedPost({ post }: FeedPostProps) {
    const user = post.users;
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState<any[]>([]);
    const [newComment, setNewComment] = useState('');
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [replyingTo, setReplyingTo] = useState<{ id: string; name: string } | null>(null);

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

    const rootComments = comments.filter(c => !c.parent_id);
    const getReplies = (commentId: string) => comments.filter(c => c.parent_id === commentId);

    const CommentItem = ({ comment, isReply = false }: { comment: any, isReply?: boolean }) => (
        <div className={`flex space-x-3 ${isReply ? 'ml-8 mt-2' : 'mt-4'}`}>
            <img
                src={comment.users?.profile_image || `https://ui-avatars.com/api/?name=${comment.users?.name}`}
                className="w-8 h-8 rounded-full object-cover"
            />
            <div className="flex-1">
                <div className="flex items-baseline space-x-2">
                    <span className="font-bold text-sm">{comment.users?.name}</span>
                    <span className="text-xs text-gray-500">{formatDistanceToNow(new Date(comment.created_at))}</span>
                </div>
                <p className="text-sm text-gray-800">{comment.content}</p>
                <button
                    onClick={() => setReplyingTo({ id: comment.id, name: comment.users?.name })}
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
            <div className="flex items-center p-3">
                <Link href={`/profile/${user.id}`} className="flex items-center space-x-3">
                    <img
                        src={user.profile_image || `https://ui-avatars.com/api/?name=${user.name}&background=random`}
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover border border-gray-100"
                    />
                    <div>
                        <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                        <p className="text-[10px] text-gray-500">{user.college}</p>
                    </div>
                </Link>
            </div>

            {/* Image */}
            <div className="aspect-square w-full bg-gray-100" onDoubleClick={handleLike}>
                <img
                    src={post.url}
                    alt={`Post by ${user.name}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                />
            </div>

            {/* Actions */}
            <div className="px-3 pt-3 flex items-center space-x-4">
                <button onClick={handleLike} className="focus:outline-none transition-transform active:scale-125">
                    <Heart size={24} className={liked ? "fill-red-500 text-red-500" : "text-black"} />
                </button>
                <button onClick={() => setShowComments(true)} className="focus:outline-none">
                    <MessageCircle size={24} className="text-black" />
                </button>
            </div>

            {/* Likes Count */}
            <div className="px-3 pt-1">
                <p className="text-sm font-bold text-gray-900">{likeCount} likes</p>
            </div>

            {/* Caption / Comments Preview */}
            <div className="px-3 pt-1">
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
                <p className="text-[10px] text-gray-400 uppercase tracking-wide">
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
                                <span>Replying to <b>{replyingTo.name}</b></span>
                                <button onClick={() => setReplyingTo(null)} className="text-black font-bold">Cancel</button>
                            </div>
                        )}
                        <form onSubmit={handleCommentSubmit} className="flex items-center space-x-2">
                            <Input
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder={replyingTo ? `Reply to ${replyingTo.name}...` : "Add a comment..."}
                                className="flex-1 border-none focus-visible:ring-0 bg-gray-50"
                            />
                            <Button type="submit" variant="ghost" size="icon" disabled={!newComment.trim()}>
                                <Send size={18} className="text-blue-500" />
                            </Button>
                        </form>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
