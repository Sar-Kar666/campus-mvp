import { BottomNav } from '@/components/layout/BottomNav';
import { MobileContainer } from '@/components/layout/MobileContainer';
import { NotificationListener } from '@/components/NotificationListener';
import { TopNav } from '@/components/layout/TopNav';

export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <MobileContainer>
            <NotificationListener />
            <TopNav />
            <main className="pb-16 pt-14 min-h-screen">
                {children}
            </main>
            <BottomNav />
        </MobileContainer>
    );
}
