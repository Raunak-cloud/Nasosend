// app/layout.js
import "./globals.css";
import { Inter } from "next/font/google";
import { AuthContextProvider } from "@/contexts/AuthContext";
import GlobalNavigation from "@/components/GlobalNavigation";
import Footer from "@/components/Footer";
import AuthWrapper from "@/components/AuthWrapper";
import VisitorTracker from "@/components/VisitorTracker";
import GlobalLiveChat from "@/components/GlobalLiveChat";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Nasosend - Crowdshipping Australia to Nepal",
  description: "Connect travelers and senders for reliable item delivery",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthContextProvider>
          <VisitorTracker />
          <AuthWrapper>
            <GlobalNavigation />
            {<main className="min-h-screen bg-gray-50">{children}</main>}
            <Footer />
            <GlobalLiveChat />
          </AuthWrapper>
        </AuthContextProvider>
      </body>
    </html>
  );
}
