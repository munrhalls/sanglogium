import 'server-only';
// Server-only entry: the store chrome (header, footer, navigation, drawers, content layout). Never import from client components.
export { default as StoreShell } from './view/StoreShell';
export { default as Header } from './view/header/Header';
export { default as NavbarActionsServer } from './view/header/NavbarActionsServer';
export { default as ActionBarServer } from './view/navigation/ActionBarServer';
export { default as BrandLogo } from './ui/header/BrandLogo';
export { default as Footer } from './ui/footer/Footer';
export { default as DrawersManager } from './ui/drawers/DrawersManager';
export { default as ContentLayout, ContentSection } from './ui/content/ContentLayout';
