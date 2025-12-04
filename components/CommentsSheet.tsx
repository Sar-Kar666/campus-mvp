'use client';

import { useState, useEffect } from 'react';
import { Send } from 'lucide-react';
import { MockService } from '@/lib/mock-service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface CommentsSheetProps {
    isOpen: boolean;
    onClose: (open: boolean) => void;
    postId: string;
    currentUser: any;
}

export function CommentsSheet({ isOpen, onClose, postId, currentUser }: CommentsSheetProps) {
    const [comments, setComments] = useState<any[]>([]);
    const [newComment, setNewComment] = useState('');
    const [replyingTo, setReplyingTo] = useState<{ id: string; name: string; username: string } | null>(null);

    useEffect(() => {
        if (isOpen) {
            const fetchComments = async () => {
                const { comments } = await MockService.getComments(postId);
                setComments(comments);
            };
            fetchComments();
        }
    }, [isOpen, postId]);

    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || !currentUser) return;

        const { comment } = await MockService.addComment(postId, currentUser.id, newComment, replyingTo?.id);
        if (comment) {
            setComments([...comments, comment]);
            setNewComment('');
            setReplyingTo(null);
        }
    };

    const handleReply = (comment: any) => {
        const parentId = comment.parent_id || comment.id;
        setReplyingTo({
            id: parentId,
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
        <Dialog open={isOpen} onOpenChange={onClose}>
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
    );
}
