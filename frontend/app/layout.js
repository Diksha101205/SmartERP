import './globals.css';

export const metadata = {
  title: 'SmartERP Dashboard',
  description: 'Dashboard UI for SmartERP billing, inventory, and accounting management.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
