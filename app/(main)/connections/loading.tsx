import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Tabs Skeleton */}
            <div className="bg-white p-4 shadow-sm sticky top-0 z-10">
                <div className="flex space-x-4 border-b">
                    <Skeleton className="h-8 w-24 mb-2" />
                    <Skeleton className="h-8 w-32 mb-2" />
                </div>
            </div>

            {/* List Skeleton */}
            <div className="p-4 space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <Skeleton className="h-12 w-12 rounded-full" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-3 w-24" />
                            </div>
                        </div>
                        <div className="flex space-x-2">
                            <Skeleton className="h-8 w-8 rounded-md" />
                            <Skeleton className="h-8 w-8 rounded-md" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
