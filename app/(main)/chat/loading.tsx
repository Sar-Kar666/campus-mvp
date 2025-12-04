import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
    return (
        <div className="min-h-screen bg-gray-50 p-4 space-y-4">
            <Skeleton className="h-8 w-32 mb-4" />
            {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="bg-white p-4 rounded-xl border border-gray-100 flex items-center space-x-3">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                        <div className="flex justify-between">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-12" />
                        </div>
                        <Skeleton className="h-3 w-3/4" />
                    </div>
                </div>
            ))}
        </div>
    )
}
