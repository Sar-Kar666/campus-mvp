'use client';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface AlertModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string;
    onConfirm?: () => void;
    confirmText?: string;
    cancelText?: string;
    type?: 'alert' | 'confirm';
}

export function AlertModal({
    isOpen,
    onClose,
    title,
    message,
    onConfirm,
    confirmText = "OK",
    cancelText = "Cancel",
    type = 'alert'
}: AlertModalProps) {
    const handleConfirm = () => {
        if (onConfirm) {
            onConfirm();
        }
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] bg-white border-none shadow-xl rounded-3xl">
                <DialogHeader>
                    <DialogTitle className="text-center text-xl font-bold">{title}</DialogTitle>
                    <DialogDescription className="text-center text-gray-500 mt-2">
                        {message}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex-col sm:flex-row gap-2 mt-4">
                    {type === 'confirm' && (
                        <Button
                            variant="outline"
                            onClick={onClose}
                            className="w-full sm:w-auto rounded-full border-gray-200"
                        >
                            {cancelText}
                        </Button>
                    )}
                    <Button
                        onClick={handleConfirm}
                        className="w-full sm:w-auto rounded-full bg-black text-white hover:bg-gray-800"
                    >
                        {confirmText}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
