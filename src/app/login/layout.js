import HeaderLogReg from "@/components/Layout/HeaderLogReg";

export default function AdminLoginLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-[#f9fafb] text-gray-800">
        <main className="min-h-screen flex items-center justify-center">
        <HeaderLogReg/>
          {children}
        </main>
      </body>
    </html>
  );
}
