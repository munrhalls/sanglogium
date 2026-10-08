import 'server-only';
// Server-only entry: the store chrome (header, footer, navigation, drawers, content layout). Never import from client components.
export { default as StoreShellView } from './view/StoreShellView';
export { default as BrandLogo } from './ui/header/BrandLogo';
export { default as ContentLayout, ContentSection } from './ui/ContentLayout';
