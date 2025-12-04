import React from 'react';

export function MobileContainer({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-gray-50 flex justify-center">
            <div className="w-full max-w-md bg-white min-h-screen shadow-xl relative">
                {children}
            </div>
        </div>
    );
}
