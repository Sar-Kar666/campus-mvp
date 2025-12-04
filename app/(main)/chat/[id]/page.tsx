'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MockService } from '@/lib/mock-service';
import { User, Message } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Send } from 'lucide-react';

import { useUnread } from '@/context/UnreadContext';

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { User as UserIcon, Bell, Ban, Flag, ChevronRight } from 'lucide-react';

export default function ChatScreen() {
    const params = useParams();
    const router = useRouter();
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [otherUser, setOtherUser] = useState<User | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [showSettings, setShowSettings] = useState(false);
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
                    setMessages(prev => {
                        if (JSON.stringify(prev) !== JSON.stringify(newMessages)) {
                            return newMessages;
                        }
                        return prev;
                    });
                }, 1000);

                return () => clearInterval(interval);
            }
        };
        fetchData();
    }, [otherUserId]);

    const isInitialLoad = useRef(true);



    useEffect(() => {
        if (messages.length > 0) {
            if (isInitialLoad.current) {
                messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
                isInitialLoad.current = false;
            } else {
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }
        }
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
        <div className="flex flex-col h-[calc(100vh-7.5rem)] bg-gray-50">
            {/* Header */}
            <div className="bg-white p-4 shadow-sm flex items-center space-x-3 z-10">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft size={24} />
                </Button>
                <div
                    className="flex items-center space-x-3 flex-1 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => setShowSettings(true)}
                >
                    <img
                        src={otherUser.profile_image}
                        alt={otherUser.name}
                        className="w-10 h-10 rounded-full bg-gray-200 object-cover"
                    />
                    <div>
                        <h3 className="font-semibold text-sm text-black">{otherUser.name || otherUser.username}</h3>
                        <p className="text-xs text-gray-500">
                            {otherUser.college} {otherUser.year ? `• ${otherUser.year}` : ''}
                        </p>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-20">
                {messages.map(msg => {
                    const isMe = msg.sender_id === currentUser?.id;
                    return (
                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start items-end space-x-2'}`}>
                            {!isMe && (
                                <img
                                    src={otherUser.profile_image || `https://ui-avatars.com/api/?name=${otherUser.name}`}
                                    alt={otherUser.name}
                                    className="w-6 h-6 rounded-full object-cover mb-1 cursor-pointer hover:opacity-80 transition-opacity"
                                    onClick={() => setShowSettings(true)}
                                />
                            )}
                            <div
                                className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${isMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white border text-gray-900 rounded-bl-none'
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
                        className="flex-1 bg-white text-black placeholder:text-gray-500 border-none focus-visible:ring-0 shadow-none"
                    />
                    <Button type="submit" size="icon" disabled={!newMessage.trim()}>
                        <Send size={18} />
                    </Button>
                </form>
            </div>

            {/* Chat Settings Modal */}
            <Dialog open={showSettings} onOpenChange={setShowSettings}>
                <DialogContent className="sm:max-w-sm p-0 gap-0 overflow-hidden bg-white text-black border-gray-100 !rounded-3xl">
                    <div className="flex flex-col items-center p-8 border-b border-gray-100 bg-gray-50/50">
                        <img
                            src={otherUser.profile_image}
                            alt={otherUser.name}
                            className="w-24 h-24 rounded-full mb-4 object-cover border-4 border-white shadow-sm"
                        />
                        <h2 className="text-xl font-bold text-gray-900">{otherUser.name || otherUser.username}</h2>
                        <p className="text-gray-900 font-medium">@{otherUser.username}</p>
                        <p className="text-xs text-gray-400 mt-1">
                            {otherUser.college} {otherUser.year ? `• ${otherUser.year}` : ''} • {otherUser.branch}
                        </p>
                    </div>
                    <div className="p-4 space-y-2">
                        <Button
                            variant="ghost"
                            className="w-full justify-between h-14 text-base font-normal hover:bg-gray-50 rounded-xl"
                            onClick={() => router.push(`/profile/${otherUser.id}`)}
                        >
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center">
                                    <UserIcon size={18} className="text-black" />
                                </div>
                                <span>View Profile</span>
                            </div>
                            <ChevronRight size={18} className="text-gray-400" />
                        </Button>
                        <Button
                            variant="ghost"
                            className="w-full justify-between h-14 text-base font-normal hover:bg-gray-50 rounded-xl"
                            onClick={() => { }}
                        >
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center">
                                    <Bell size={18} className="text-black" />
                                </div>
                                <span>Mute Messages</span>
                            </div>
                            <ChevronRight size={18} className="text-gray-400" />
                        </Button>
                        <Button
                            variant="ghost"
                            className="w-full justify-between h-14 text-base font-normal hover:bg-red-50 text-red-600 hover:text-red-700 rounded-xl"
                            onClick={() => { }}
                        >
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                                    <Ban size={18} className="text-red-600" />
                                </div>
                                <span>Block</span>
                            </div>
                            <ChevronRight size={18} className="text-red-200" />
                        </Button>
                        <Button
                            variant="ghost"
                            className="w-full justify-between h-14 text-base font-normal hover:bg-red-50 text-red-600 hover:text-red-700 rounded-xl"
                            onClick={() => { }}
                        >
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                                    <Flag size={18} className="text-red-600" />
                                </div>
                                <span>Report</span>
                            </div>
                            <ChevronRight size={18} className="text-red-200" />
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
