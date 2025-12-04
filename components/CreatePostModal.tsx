'use client';

import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MockService } from '@/lib/mock-service';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { ImagePlus, X, Loader2, PenTool } from 'lucide-react';

interface CreatePostModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CreatePostModal({ open, onOpenChange }: CreatePostModalProps) {
    const router = useRouter();
    const [mode, setMode] = useState<'select' | 'text' | 'photo'>('select');
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [caption, setCaption] = useState('');
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Reset mode when opening
    if (open && mode !== 'select' && !file && !caption && !uploading) {
        // This might cause infinite loop if not careful, better to do it in onOpenChange wrapper or useEffect
        // But for now, let's just reset when closing
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            setPreviewUrl(URL.createObjectURL(selectedFile));
        }
    };

    const handleUpload = async () => {
        if (mode === 'photo' && !file) {
            toast.error('Please select a photo');
            return;
        }
        if (mode === 'text' && !caption.trim()) return;
        if (!file && !caption.trim()) return;

        setUploading(true);
        try {
            const user = await MockService.getCurrentUser();
            if (!user) {
                toast.error('You must be logged in to post');
                return;
            }

            const { success, error } = await MockService.createPost(user.id, caption, file || undefined);

            if (success) {
                toast.success('Post created successfully!');
                handleClose();
                router.refresh();
            } else {
                toast.error(error || 'Failed to create post');
            }
        } catch (error) {
            console.error(error);
            toast.error('An unexpected error occurred');
        } finally {
            setUploading(false);
        }
    };

    const handleClose = () => {
        onOpenChange(false);
        setTimeout(() => {
            setMode('select');
            setFile(null);
            setPreviewUrl(null);
            setCaption('');
        }, 300); // Wait for animation
    };

    const renderSelectMode = () => (
        <div className="grid grid-cols-2 gap-3 py-6">
            <button
                onClick={() => setMode('text')}
                className="flex flex-col items-center justify-center p-5 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 hover:border-white/30 transition-all group backdrop-blur-sm"
            >
                <div className="w-12 h-12 bg-white/10 text-white rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <PenTool size={24} />
                </div>
                <span className="font-bold text-white text-sm">Write</span>
                <span className="text-[10px] text-white/60 mt-1">Share your thoughts</span>
            </button>

            <button
                onClick={() => setMode('photo')}
                className="flex flex-col items-center justify-center p-5 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 hover:border-white/30 transition-all group backdrop-blur-sm"
            >
                <div className="w-12 h-12 bg-white/10 text-white rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <ImagePlus size={24} />
                </div>
                <span className="font-bold text-white text-sm">Upload</span>
                <span className="text-[10px] text-white/60 mt-1">Post a photo</span>
            </button>
        </div>
    );

    const renderTextMode = () => (
        <div className="space-y-4">
            <div className="aspect-square w-full bg-black/20 rounded-2xl flex flex-col items-center justify-center p-8 text-center shadow-inner relative border border-white/5">
                <textarea
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="What's on your mind?"
                    className="w-full h-full bg-transparent border-none outline-none text-white text-3xl leading-relaxed font-agbalumo placeholder-white/20 focus:ring-0 text-center resize-none overflow-hidden flex items-center justify-center pt-[30%]"
                    style={{ fontFamily: 'var(--font-agbalumo)' }}
                    autoFocus
                />
                <p className="absolute bottom-4 right-4 text-white/40 text-xl italic font-serif pointer-events-none">
                    -you
                </p>
            </div>
            <div className="flex justify-between items-center pt-2 px-1">
                <Button
                    variant="ghost"
                    onClick={() => setMode('select')}
                    disabled={uploading}
                    className="text-white/60 hover:text-white hover:bg-white/10 font-medium transition-colors"
                >
                    Back
                </Button>
                <Button
                    onClick={handleUpload}
                    disabled={!caption.trim() || uploading}
                    className="bg-white text-black hover:bg-white/90 rounded-full px-8 py-2 font-bold text-md transition-all transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                >
                    {uploading ? (
                        <>
                            <Loader2 size={16} className="mr-2 animate-spin" />
                            Posting...
                        </>
                    ) : (
                        'Post'
                    )}
                </Button>
            </div>
        </div>
    );

    const renderPhotoMode = () => (
        <div className="space-y-4">
            <div
                className="aspect-square w-full bg-white/5 rounded-2xl flex flex-col items-center justify-center cursor-pointer border-2 border-dashed border-white/20 hover:border-white/50 hover:bg-white/10 transition-all relative overflow-hidden"
                onClick={() => !previewUrl && fileInputRef.current?.click()}
            >
                {previewUrl ? (
                    <>
                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setFile(null);
                                setPreviewUrl(null);
                            }}
                            className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-black/70"
                        >
                            <X size={16} />
                        </button>
                    </>
                ) : (
                    <div className="text-center p-4">
                        <ImagePlus size={40} className="mx-auto text-white/40 mb-2" />
                        <p className="text-sm text-white/60 font-medium">Click to select photo</p>
                    </div>
                )}
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileSelect}
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">Caption</label>
                <textarea
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Write a caption..."
                    className="w-full min-h-[80px] p-3 rounded-xl border border-white/20 bg-white/5 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 text-sm resize-none"
                />
            </div>

            <div className="flex justify-between items-center pt-2 px-1">
                <Button
                    variant="ghost"
                    onClick={() => setMode('select')}
                    disabled={uploading}
                    className="text-white/60 hover:text-white hover:bg-white/10 font-medium transition-colors"
                >
                    Back
                </Button>
                <Button
                    onClick={handleUpload}
                    disabled={!file || uploading}
                    className="bg-white text-black hover:bg-white/90 rounded-full px-8 py-2 font-bold text-md transition-all transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                >
                    {uploading ? (
                        <>
                            <Loader2 size={16} className="mr-2 animate-spin" />
                            Posting...
                        </>
                    ) : (
                        'Share'
                    )}
                </Button>
            </div>
        </div>
    );

    return (
        <Dialog open={open} onOpenChange={(val) => !val && handleClose()}>
            <DialogContent className="sm:max-w-[340px] bg-gray-900/20 backdrop-blur-xl border-white/10 shadow-2xl text-white !rounded-3xl">
                <DialogHeader>
                    <DialogTitle className="text-center font-bold text-white text-lg">
                        {mode === 'select' ? 'Create New Post' : mode === 'text' ? 'Write Post' : 'Upload Photo'}
                    </DialogTitle>
                </DialogHeader>

                {mode === 'select' && renderSelectMode()}
                {mode === 'text' && renderTextMode()}
                {mode === 'photo' && renderPhotoMode()}
            </DialogContent>
        </Dialog>
    );
}
