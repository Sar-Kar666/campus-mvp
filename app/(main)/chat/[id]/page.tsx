'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MockService } from '@/lib/mock-service';
import { User, Message } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Send } from 'lucide-react';

import { useUnread } from '@/context/UnreadContext';

export default function ChatScreen() {
    const params = useParams();
    const router = useRouter();
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [otherUser, setOtherUser] = useState<User | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { markMessagesAsRead, refreshUnread } = useUnread();

    const otherUserId = params.id as string;

    useEffect(() => {
        const fetchData = async () => {
            const user = await MockService.getCurrentUser();
            if (user) {
                setCurrentUser(user);
                const allUsers = await MockService.getAllUsers();
                const friend = allUsers.find(u => u.id === otherUserId);
                setOtherUser(friend || null);

                // Load initial messages
                const initialMessages = await MockService.getMessages(user.id, otherUserId);
                setMessages(initialMessages);

                // Mark messages as read
                markMessagesAsRead(user.id, otherUserId);
                refreshUnread();

                // Poll for new messages (simulating real-time)
                const interval = setInterval(async () => {
                    const newMessages = await MockService.getMessages(user.id, otherUserId);
                    setMessages(newMessages);
                }, 1000);

                return () => clearInterval(interval);
            }
        };
        fetchData();
    }, [otherUserId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!newMessage.trim() || !currentUser) return;
        await MockService.sendMessage(currentUser.id, otherUserId, newMessage);
        const updatedMessages = await MockService.getMessages(currentUser.id, otherUserId);
        setMessages(updatedMessages);
        setNewMessage('');
    };

    if (!otherUser) return <div className="p-4">Loading...</div>;

    return (
        <div className="flex flex-col h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white p-4 shadow-sm flex items-center space-x-3 z-10">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft size={24} />
                </Button>
                <img
                    src={otherUser.profile_image}
                    alt={otherUser.name}
                    className="w-10 h-10 rounded-full bg-gray-200 object-cover"
                />
                <div>
                    <h3 className="font-semibold text-sm">{otherUser.name}</h3>
                    <p className="text-xs text-gray-500">{otherUser.college}</p>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-20">
                {messages.map(msg => {
                    const isMe = msg.sender_id === currentUser?.id;
                    return (
                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div
                                className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${isMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white border text-gray-800 rounded-bl-none'
                                    }`}
                            >
                                {msg.content}
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="bg-white p-4 border-t sticky bottom-0">
                <form
                    onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                    className="flex space-x-2"
                >
                    <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1"
                    />
                    <Button type="submit" size="icon" disabled={!newMessage.trim()}>
                        <Send size={18} />
                    </Button>
                </form>
            </div>
        </div>
    );
}
