import { MockService } from '@/lib/mock-service';
import { DiscoverView } from '@/components/DiscoverView';

export const dynamic = 'force-dynamic';

export default async function DiscoverPage() {
    const users = await MockService.getAllUsers();

    return <DiscoverView initialUsers={users} />;
}
