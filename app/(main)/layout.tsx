import { BottomNav } from '@/components/layout/BottomNav';
import { MobileContainer } from '@/components/layout/MobileContainer';

export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <MobileContainer>
            <main className="pb-20 min-h-screen">
                {children}
            </main>
            <BottomNav />
        </MobileContainer>
    );
}
