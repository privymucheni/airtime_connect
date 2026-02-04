import AuthenticatedLayout from "@/components/AuthenticatedLayout";

export default function CompanyLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <AuthenticatedLayout>{children}</AuthenticatedLayout>;
}
