import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import Navbar from "@/components/Navbar/Navbar";

export const metadata = {
  title: "MAREN — Dressed in Confidence",
  description: "Curated fashion pieces that speak to the woman who refuses to compromise — structured, deliberate, and entirely her own.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <main>{children}</main>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

