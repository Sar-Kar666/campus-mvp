import { BottomNav } from '@/components/layout/BottomNav';
import { NotificationListener } from '@/components/NotificationListener';

export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="pb-16 min-h-screen bg-gray-50">
            <NotificationListener />
            {children}
            <BottomNav />
        </div>
    );
}
