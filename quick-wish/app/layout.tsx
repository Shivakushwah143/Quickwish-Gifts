
import "./globals.css";
import AssistantDrawer from "./components/AssistantDrawer";


export default function RootLayout({children,}: Readonly<{children: React.ReactNode;}>) {
  return (
  
      <html lang="en">
        <body className="antialiased">
          {children}
          <AssistantDrawer />
        </body>
      </html>

  );
}
