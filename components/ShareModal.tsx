import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Send } from 'lucide-react';
import { MockService } from '@/lib/mock-service';
import { User } from '@/types';
import { toast } from 'sonner';

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    postUrl: string;
    postId: string;
    postUsername: string;
    postCaption?: string;
    postUserImage?: string;
}

export function ShareModal({ isOpen, onClose, postUrl, postId, postUsername, postCaption, postUserImage }: ShareModalProps) {
    const [query, setQuery] = useState('');
    const [connections, setConnections] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            fetchConnections();
        }
    }, [isOpen]);

    const fetchConnections = async () => {
        setLoading(true);
        const currentUser = await MockService.getCurrentUser();
        if (!currentUser) return;

        const conns = await MockService.getConnections(currentUser.id);

        // Filter for accepted connections only
        const acceptedConns = conns.filter(c => c.status === 'accepted');

        // Get user IDs of connections
        const connectedUserIds = acceptedConns.map(c =>
            c.requester_id === currentUser.id ? c.receiver_id : c.requester_id
        );

        // Fetch user details
        // Note: In a real app, we'd have a bulk fetch method. 
        // For now, we'll fetch all users and filter (since we have that cached usually)
        // or fetch individually if list is small. 
        // Let's use getAllUsers and filter for now as it's simpler with current MockService
        const allUsers = await MockService.getAllUsers();
        const connectedUsers = allUsers.filter(u => connectedUserIds.includes(u.id));

        setConnections(connectedUsers);
        setLoading(false);
    };

    const filteredConnections = connections.filter(user =>
        user.username.toLowerCase().includes(query.toLowerCase()) ||
        user.name.toLowerCase().includes(query.toLowerCase())
    );

    const handleSend = async (user: User) => {
        setSending(user.id);
        const currentUser = await MockService.getCurrentUser();
        if (!currentUser) return;

        // Structured message format: SHARED_POST::postId::postUrl::username::caption::userImage
        const message = `SHARED_POST::${postId}::${postUrl}::${postUsername}::${postCaption || ''}::${postUserImage || ''}`;

        await MockService.sendMessage(currentUser.id, user.id, message);

        toast.success(`Sent to ${user.username}`);
        setSending(null);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Share Post</DialogTitle>
                </DialogHeader>

                <div className="relative mb-4">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search connections..."
                        className="pl-9"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                </div>

                <div className="max-h-[300px] overflow-y-auto space-y-2">
                    {loading ? (
                        <div className="text-center py-4 text-gray-500">Loading...</div>
                    ) : filteredConnections.length === 0 ? (
                        <div className="text-center py-4 text-gray-500">No connections found.</div>
                    ) : (
                        filteredConnections.map(user => (
                            <div key={user.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <img
                                        src={user.profile_image || `https://ui-avatars.com/api/?name=${user.name}`}
                                        alt={user.username}
                                        className="w-10 h-10 rounded-full object-cover"
                                    />
                                    <div>
                                        <p className="font-medium text-sm">{user.username}</p>
                                        <p className="text-xs text-gray-500">{user.name}</p>
                                    </div>
                                </div>
                                <Button
                                    size="sm"
                                    variant={sending === user.id ? "outline" : "default"}
                                    onClick={() => handleSend(user)}
                                    disabled={!!sending}
                                >
                                    {sending === user.id ? 'Sent' : 'Send'}
                                </Button>
                            </div>
                        ))
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
