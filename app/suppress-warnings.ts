// Suppress Next.js Image warnings in development
if (process.env.NODE_ENV === "development") {
  const originalWarn = console.warn;
  const originalError = console.error;
  
  console.warn = (...args) => {
    const message = args[0];
    if (
      typeof message === 'string' &&
      (message.includes('has "fill" and a height value of 0') ||
       message.includes('clerk.sang-logium.com') ||
       message.includes('Failed to load Clerk'))
    ) {
      return;
    }
    originalWarn.apply(console, args);
  };
  
  console.error = (...args) => {
    const message = args[0];
    if (
      typeof message === 'string' &&
      (message.includes('clerk.sang-logium.com') ||
       message.includes('Failed to load Clerk'))
    ) {
      return;
    }
    originalError.apply(console, args);
  };
}
