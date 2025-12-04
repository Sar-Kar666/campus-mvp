import { MockService } from '@/lib/mock-service';
import { FeedList } from '@/components/FeedList';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
    const posts = await MockService.getRecentPhotos();

    return (
        <div className="bg-white min-h-screen">
            <FeedList initialPosts={posts} />
        </div>
    );
}
