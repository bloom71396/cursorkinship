import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kinship",
  description: "Welcome to Kinship",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body 
        className="min-h-screen flex flex-col"
        style={{ 
          background: 'linear-gradient(to bottom right, #fafaf9, #fffbed33, #f5f5f4)',
          margin: 0
        }}
      >
        {children}
      </body>
    </html>
  );
}