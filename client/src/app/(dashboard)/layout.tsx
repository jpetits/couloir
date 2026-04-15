export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main className="container mx-auto py-6">{children}</main>;
}
