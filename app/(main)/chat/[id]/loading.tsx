import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft } from 'lucide-react'

export default function Loading() {
    return (
        <div className="flex flex-col h-[calc(100vh-7.5rem)] bg-gray-50">
            {/* Header Skeleton */}
            <div className="bg-white p-4 shadow-sm flex items-center space-x-3 z-10">
                <ArrowLeft size={24} className="text-gray-300" />
                <div className="flex items-center space-x-3 flex-1">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div className="space-y-1">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-32" />
                    </div>
                </div>
            </div>

            {/* Messages Skeleton */}
            <div className="flex-1 p-4 space-y-4 overflow-hidden">
                <div className="flex justify-start items-end space-x-2">
                    <Skeleton className="w-6 h-6 rounded-full" />
                    <Skeleton className="h-10 w-48 rounded-2xl rounded-bl-none" />
                </div>
                <div className="flex justify-end">
                    <Skeleton className="h-16 w-64 rounded-2xl rounded-br-none" />
                </div>
                <div className="flex justify-start items-end space-x-2">
                    <Skeleton className="w-6 h-6 rounded-full" />
                    <Skeleton className="h-8 w-32 rounded-2xl rounded-bl-none" />
                </div>
                <div className="flex justify-end">
                    <Skeleton className="h-10 w-40 rounded-2xl rounded-br-none" />
                </div>
            </div>

            {/* Input Skeleton */}
            <div className="bg-white p-4 border-t">
                <div className="flex space-x-2">
                    <Skeleton className="flex-1 h-10 rounded-md" />
                    <Skeleton className="w-10 h-10 rounded-md" />
                </div>
            </div>
        </div>
    )
}
