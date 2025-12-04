import { BottomNav } from '@/components/layout/BottomNav';
import { MobileContainer } from '@/components/layout/MobileContainer';
import { NotificationListener } from '@/components/NotificationListener';

export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <MobileContainer>
            <NotificationListener />
            <main className="pb-16 min-h-screen">
                {children}
            </main>
            <BottomNav />
        </MobileContainer>
    );
}
