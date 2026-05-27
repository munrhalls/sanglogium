// Suppress Next.js Image warnings in development
if (process.env.NODE_ENV === "development") {
  const originalWarn = console.warn;
  const originalError = console.error;
  
  console.warn = (...args) => {
    const message = args[0];
    if (
      typeof message === 'string' &&
      message.includes('has "fill" and a height value of 0')
    ) {
      return;
    }
    originalWarn.apply(console, args);
  };
}
