import { MockService } from '@/lib/mock-service';
import { ProfileView } from '@/components/ProfileView';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function PublicProfilePage({ params }: { params: { id: string } }) {
    const userId = params.id;

    // Fetch data in parallel
    const [user, photos, connections] = await Promise.all([
        MockService.getUserById(userId),
        MockService.getUserPhotos(userId),
        MockService.getConnections(userId)
    ]);

    if (!user) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4">
                <p className="text-xl font-semibold">User not found</p>
                <p className="text-sm text-gray-500">ID: {userId}</p>
                <Link href="/home">
                    <Button>Go Home</Button>
                </Link>
            </div>
        );
    }

    // Get current user (server-side session check)
    // Note: MockService.getCurrentUser() might fail on server if it relies on localStorage.
    // We should use a server-safe way or pass null and let client handle "Connect" visibility if needed.
    // However, MockService.getCurrentUser() does check supabase.auth.getSession(), which works on server if cookies are passed.
    // But standard supabase-js client might not have cookies. 
    // For this MVP, let's try to get the session user ID directly if possible, or pass null.

    // Actually, for the "Connect" button logic, we need to know who is viewing.
    // If we can't get it on server easily without proper cookie setup, we might need to fetch it in ProfileView.
    // But let's try to fetch it here. If it returns null, ProfileView will just not show "Connect" initially or we can fetch it there.
    // Let's fetch it here.
    const currentUser = await MockService.getCurrentUser();

    let connectionStatus: 'pending' | 'accepted' | 'rejected' | 'none' = 'none';

    if (currentUser) {
        const myConnections = await MockService.getConnections(currentUser.id);
        const connection = myConnections.find(c =>
            (c.requester_id === currentUser.id && c.receiver_id === userId) ||
            (c.receiver_id === currentUser.id && c.requester_id === userId)
        );
        if (connection) {
            connectionStatus = connection.status;
        }
    }

    const acceptedConnections = connections.filter(c => c.status === 'accepted');

    return (
        <ProfileView
            user={user}
            currentUser={currentUser}
            initialPhotos={photos}
            initialConnectionStatus={connectionStatus}
            initialConnectionCount={acceptedConnections.length}
        />
    );
}
