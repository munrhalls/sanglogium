// Development-only layout for seeing tool
// Runs only in development - zero production interference

const isDevelopment = process.env.NODE_ENV === 'development';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Block access in production
  if (!isDevelopment) {
    return null;
  }

  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
