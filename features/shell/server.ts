import 'server-only';
// Server-only entry: the store chrome (header, footer, navigation, drawers, content layout). Never import from client components.
export { default as StoreShell } from './view/StoreShell';
export { default as BrandLogo } from './ui/header/BrandLogo';
export { default as ContentLayout, ContentSection } from './ui/content/ContentLayout';
