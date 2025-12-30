export default function CustomersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Global Container (Hem sol hem sağ boşluk ayarı burada yapılır) */}
      <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto w-full">
        {children}
      </div>
    </div>
  );
}
