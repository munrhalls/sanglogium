import 'server-only';
// Server-only entry: the store chrome (header, footer, navigation, drawers, shelf, content layout, newsletter). Never import from client components.
import { subscribeToNewsletter } from './adapters/resend/subscribeNewsletter';
import { subscribeNewsletter as subscribeNewsletterUseCase } from './commands/subscribeNewsletter';

const newsletterSubscriptions = { subscribe: subscribeToNewsletter };
export const subscribeNewsletter = (input: unknown) =>
  subscribeNewsletterUseCase(newsletterSubscriptions, input);

export { default as StoreShell } from './view/StoreShell';
export { default as Header } from './view/header/Header';
export { default as NavbarActionsServer } from './view/header/NavbarActionsServer';
export { default as ActionBarServer } from './view/navigation/ActionBarServer';
export { default as BrandLogo } from './ui/header/BrandLogo';
export { default as Footer } from './ui/footer/Footer';
export { default as DrawersManager } from './ui/drawers/DrawersManager';
export { default as Shelf } from './ui/shelf/Shelf';
export { default as ContentLayout, ContentSection } from './ui/content/ContentLayout';
