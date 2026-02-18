import AuthenticatedLayout from "@/components/AuthenticatedLayout";
import { ChatBot } from "@/components/ChatBot";

export default function CompanyLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AuthenticatedLayout>
            {children}
            <ChatBot />
        </AuthenticatedLayout>
    );
}
