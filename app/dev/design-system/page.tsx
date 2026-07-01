import fs from 'fs';
import path from 'path';
import type { ReactNode } from 'react';
import CheckoutSummary from '@/app/checkout/payment/_components/CheckoutSummary';
import { BasketItemDisplay } from './_showcase/BasketItemDisplay';
import { PaymentMethodSelector } from './_showcase/PaymentMethodSelector';

const mockCheckoutData = {
  items: [
    {
      productId: '1',
      name: 'Sennheiser HD 560S',
      quantity: 1,
      unitPrice: 125965,
      lineTotal: 125965,
    },
    {
      productId: '2',
      name: 'Meze Audio 99 Series',
      quantity: 1,
      unitPrice: 5500,
      lineTotal: 5500,
    },
  ],
  subtotal: 131465,
  shippingCost: 1466,
  shippingLabel: 'Orlen Paczka (2 business days)',
  shippingEstimatedDays: 2,
  address: {
    firstName: 'Jan',
    lastName: 'J.',
    street: 'Balonowa',
    streetNumber: '9',
    city: 'Wrocław',
    postalCode: '54-129',
    regionCode: 'PL',
  },
  grandTotal: 132931,
  vatAmount: 24857,
};

const Dim = ({ children }: { children: ReactNode }) => (
  <span className="opacity-40">{children}</span>
);

const Spot = ({ children }: { children: ReactNode }) => (
  <span className="bg-accent-500 bg-opacity-20 text-accent-300">{children}</span>
);

export default function DesignSystemPage() {
  const tailwindConfig = fs.readFileSync(
    path.join(process.cwd(), 'tailwind.config.ts'),
    'utf-8'
  );

  return (
    <div className="bg-brand-700 min-h-screen text-brand-400 px-8 py-16">
      <div className="max-w-5xl mx-auto">

        {/* ───────────────────────────────────────── */}
        {/* SECTION 1: HEADLINE                       */}
        {/* ───────────────────────────────────────── */}
        <section className="text-center mb-24">
          <h1 className="text-7xl font-bold text-brand-400 mb-4">
            Complete Design System
          </h1>
          <p className="text-2xl text-secondary-300">
            Premium quality. Unified experience. Zero friction. Trust throughout.
          </p>
        </section>

        {/* ───────────────────────────────────────── */}
        {/* SECTION 2: 11-ELEMENT GRID                */}
        {/* ───────────────────────────────────────── */}
        <section className="mb-32">
          <div className="grid grid-cols-4 md:grid-cols-2 sm:grid-cols-1 gap-8">

            {/* Element 1: Color Palette */}
            <div className="bg-secondary-900 border border-secondary-700 p-6 rounded-lg">
              <h3 className="text-sm text-accent-500 mb-4">COLOR PALETTE</h3>
              <div className="flex gap-2">
                <div className="w-10 h-10 rounded bg-brand-400" title="brand-400" />
                <div className="w-10 h-10 rounded bg-brand-500" title="brand-500" />
                <div className="w-10 h-10 rounded bg-accent-500" title="accent-500" />
                <div className="w-10 h-10 rounded bg-secondary-300" title="secondary-300" />
                <div className="w-10 h-10 rounded bg-success-500" title="success-500" />
                <div className="w-10 h-10 rounded bg-error-500" title="error-500" />
              </div>
            </div>

            {/* Element 2: Visual Hierarchy */}
            <div className="bg-secondary-900 border border-secondary-700 p-6 rounded-lg">
              <h3 className="text-sm text-accent-500 mb-4">VISUAL HIERARCHY</h3>
              <h4 className="text-2xl font-bold text-brand-400 mb-1">Headline</h4>
              <h5 className="text-lg text-secondary-300 mb-1">Subheading</h5>
              <p className="text-base text-brand-200">Body text for content</p>
            </div>

            {/* Element 3: White Space */}
            <div className="bg-secondary-900 border border-secondary-700 p-6 rounded-lg">
              <h3 className="text-sm text-accent-500 mb-4">WHITE SPACE</h3>
              <div className="bg-secondary-800 p-4 rounded">
                <div className="bg-secondary-700 p-4 rounded text-center text-xs text-secondary-400">
                  Padding creates breathing room
                </div>
              </div>
            </div>

            {/* Element 4: Spacing Scale */}
            <div className="bg-secondary-900 border border-secondary-700 p-6 rounded-lg">
              <h3 className="text-sm text-accent-500 mb-4">SPACING SCALE</h3>
              <div className="flex flex-col gap-2">
                <div className="h-2 bg-accent-500 rounded" style={{ width: '20px' }} />
                <div className="h-2 bg-accent-500 rounded" style={{ width: '32px' }} />
                <div className="h-2 bg-accent-500 rounded" style={{ width: '48px' }} />
                <div className="h-2 bg-accent-500 rounded" style={{ width: '64px' }} />
              </div>
            </div>

            {/* Element 5: Typography Scale */}
            <div className="bg-secondary-900 border border-secondary-700 p-6 rounded-lg">
              <h3 className="text-sm text-accent-500 mb-4">TYPOGRAPHY SCALE</h3>
              <div className="flex flex-col gap-1">
                <span className="text-4xl font-bold text-brand-400">Display</span>
                <span className="text-2xl font-bold text-brand-400">Heading 1</span>
                <span className="text-xl font-semibold text-brand-400">Heading 2</span>
                <span className="text-base text-brand-200">Body text</span>
                <span className="text-xs text-secondary-400">Caption</span>
              </div>
            </div>

            {/* Element 6: Line Height */}
            <div className="bg-secondary-900 border border-secondary-700 p-6 rounded-lg">
              <h3 className="text-sm text-accent-500 mb-4">LINE HEIGHT</h3>
              <div className="flex flex-col gap-3">
                <p className="text-xs text-secondary-400" style={{ lineHeight: '1.2' }}>
                  Tight line height for headlines and compact UI elements
                </p>
                <p className="text-xs text-secondary-400" style={{ lineHeight: '1.6' }}>
                  Relaxed line height for body text and reading comfort
                </p>
              </div>
            </div>

            {/* Element 7: Border Radius */}
            <div className="bg-secondary-900 border border-secondary-700 p-6 rounded-lg">
              <h3 className="text-sm text-accent-500 mb-4">BORDER RADIUS</h3>
              <div className="flex gap-3">
                <div className="w-12 h-12 bg-secondary-700" />
                <div className="w-12 h-12 bg-secondary-700 rounded-sm" />
                <div className="w-12 h-12 bg-secondary-700 rounded-md" />
                <div className="w-12 h-12 bg-secondary-700 rounded-lg" />
              </div>
            </div>

            {/* Element 8: Shadows */}
            <div className="bg-secondary-900 border border-secondary-700 p-6 rounded-lg">
              <h3 className="text-sm text-accent-500 mb-4">SHADOWS & DEPTH</h3>
              <div className="flex gap-4">
                <div className="w-14 h-14 bg-secondary-800 rounded shadow-sm" />
                <div className="w-14 h-14 bg-secondary-800 rounded shadow-card" />
                <div className="w-14 h-14 bg-secondary-800 rounded shadow-lg" />
              </div>
            </div>

            {/* Element 9: Contrast & Accessibility */}
            <div className="bg-secondary-900 border border-secondary-700 p-6 rounded-lg">
              <h3 className="text-sm text-accent-500 mb-4">CONTRAST & A11Y</h3>
              <div className="flex flex-col gap-2">
                <span className="text-xs font-medium px-3 py-1 rounded bg-success-500/20 text-success-500">
                  AA Pass · 4.5:1+
                </span>
                <span className="text-xs font-medium px-3 py-1 rounded bg-success-500/20 text-success-500">
                  AAA Pass · 7:1+
                </span>
                <span className="text-xs font-medium px-3 py-1 rounded bg-error-500/20 text-error-500">
                  Fail · Below 3:1
                </span>
              </div>
            </div>

            {/* Element 10: Button States */}
            <div className="bg-secondary-900 border border-secondary-700 p-6 rounded-lg">
              <h3 className="text-sm text-accent-500 mb-4">BUTTON STATES</h3>
              <div className="flex flex-col gap-3">
                <button className="btn-primary w-full">Primary Action</button>
                <button className="btn-secondary w-full">Secondary Action</button>
                <button className="btn-primary w-full opacity-50 cursor-not-allowed" disabled>
                  Disabled
                </button>
              </div>
            </div>

            {/* Element 11: Checkout System */}
            <div className="bg-secondary-900 border border-secondary-700 p-6 rounded-lg col-span-1 md:col-span-2 sm:col-span-1">
              <h3 className="text-sm text-accent-500 mb-4">CHECKOUT SYSTEM</h3>

              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-semibold text-brand-300 mb-2">Product in Basket</h4>
                  <div className="bg-secondary-800 rounded-lg overflow-hidden">
                    <BasketItemDisplay />
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-brand-300 mb-2">Order Summary</h4>
                  <div className="origin-top-left" style={{ transform: 'scale(0.85)' }}>
                    <CheckoutSummary {...mockCheckoutData} />
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-brand-300 mb-2">Payment Methods</h4>
                  <PaymentMethodSelector />
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ───────────────────────────────────────── */}
        {/* SECTION 3: UNIFYING STATEMENT             */}
        {/* ───────────────────────────────────────── */}
        <section className="my-32 text-center border-t border-b border-secondary-700 py-12">
          <p className="text-2xl text-brand-400 font-medium leading-relaxed max-w-3xl mx-auto">
            Every design decision builds customer&apos;s sense of trust. Every element removes friction. One premium quality, sophisticated experience from discovery to conversion.
          </p>
        </section>

        {/* ───────────────────────────────────────── */}
        {/* SECTION 4: TAILWIND CONFIG                */}
        {/* ───────────────────────────────────────── */}
        <section className="my-32">
          <h2 className="text-3xl font-bold text-brand-400 mb-6">Tailwind Configuration</h2>
          <p className="text-secondary-300 mb-6">
            The complete design token system — colors, typography, spacing, shadows, and component classes.
          </p>
          <div className="bg-secondary-900 border border-secondary-700 rounded-lg p-4 max-h-[600px] overflow-y-auto">
            <pre className="font-mono text-xs text-brand-200 whitespace-pre-wrap break-words">
              {tailwindConfig}
            </pre>
          </div>
        </section>

        {/* ───────────────────────────────────────── */}
        {/* SECTION 5: CODE EXAMPLES WITH SPOTLIGHT   */}
        {/* ───────────────────────────────────────── */}
        <section className="my-32">
          <h2 className="text-3xl font-bold text-brand-400 mb-6">Component Implementation</h2>
          <p className="text-secondary-300 mb-6 text-sm">
            Real code with spotlight effect — dimmed structure, highlighted design tokens:
          </p>

          <div className="space-y-8">

            {/* Example 1: BasketItem */}
            <div>
              <h3 className="text-lg font-semibold text-accent-500 mb-3">
                BasketItem.tsx — Product Display
              </h3>
              <div className="bg-secondary-900 border border-secondary-700 rounded-lg p-4 overflow-x-auto">
                <pre className="font-mono text-xs text-brand-200 whitespace-pre-wrap">
{`  `}<Dim>{'<article'}{'\n'}</Dim>{`    `}<Spot>{'className="hidden lg-desktop:grid lg-touch:grid grid-cols-[minmax(0,1fr)_auto_auto] items-start px-6 py-5 gap-[2rem] border-b border-border-secondary/60 hover:bg-surface-elevated transition-colors"'}</Spot>{'\n'}
<Dim>{'  >'}{'\n'}</Dim>{`    `}<Dim>{'<div'}{'\n'}</Dim>{`      `}<Spot>{'className="flex flex-row items-start gap-4"'}</Spot>{'\n'}
<Dim>{'    >'}{'\n'}</Dim>{`      `}<Dim>{'<div'}{'\n'}</Dim>{`        `}<Spot>{'className="h-20 w-20 rounded-sm bg-surface-productImage border border-border-secondary"'}</Spot>{'\n'}
<Dim>{'      >'}{'\n'}</Dim>{`      `}<Dim>{'<div'}{'\n'}</Dim>{`        `}<Spot>{'className="flex flex-col gap-1"'}</Spot>{'\n'}
<Dim>{'      >'}{'\n'}</Dim>{`        `}<Dim>{'<h3'}{'\n'}</Dim>{`          `}<Spot>{'className="type-card-title line-clamp-4"'}</Spot>{'\n'}
<Dim>{'        >{name}</h3>'}{'\n'}</Dim>{`        `}<Dim>{'<span'}{'\n'}</Dim>{`          `}<Spot>{'className="type-metadata"'}</Spot>{'\n'}
<Dim>{'        >{variant}</span>'}{'\n'}</Dim>{`        `}<Dim>{'<span'}{'\n'}</Dim>{`          `}<Spot>{'className="type-caption text-error-700 font-medium"'}</Spot>{'\n'}
<Dim>{'        >Out of Stock</span>'}{'\n'}</Dim>{`        `}<Dim>{'<span'}{'\n'}</Dim>{`          `}<Spot>{'className="type-caption text-text-secondary tabular-nums"'}</Spot>{'\n'}
<Dim>{'        >{displayPrice}</span>'}{'\n'}</Dim>{`      `}<Dim>{'</div>'}{'\n'}</Dim>{`    `}<Dim>{'</div>'}{'\n'}</Dim>{`  `}<Dim>{'</article>'}</Dim>
                </pre>
              </div>
              <p className="text-xs text-secondary-500 mt-2">
                Spotlight tokens: grid layouts, responsive (lg-desktop, lg-touch), spacing (px, py, gap), border styles, surface colors, type classes, error color tokens
              </p>
            </div>

            {/* Example 2: AddressForm */}
            <div>
              <h3 className="text-lg font-semibold text-accent-500 mb-3">
                AddressForm.tsx — Form Validation
              </h3>
              <div className="bg-secondary-900 border border-secondary-700 rounded-lg p-4 overflow-x-auto">
                <pre className="font-mono text-xs text-brand-200 whitespace-pre-wrap">
{`  `}<Dim>{'<div'}{'\n'}</Dim>{`    `}<Spot>{'className="max-w-xl mx-auto w-full"'}</Spot>{'\n'}
<Dim>{'  >'}{'\n'}</Dim>{`    `}<Dim>{'<h1'}{'\n'}</Dim>{`      `}<Spot>{'className="type-section-hed text-center mb-10"'}</Spot>{'\n'}
<Dim>{'    >Shipping Address</h1>'}{'\n'}</Dim>{`    `}<Dim>{'<div'}{'\n'}</Dim>{`      `}<Spot>{'className="mb-4 rounded border border-error-500/30 bg-error-500/10 p-3"'}</Spot>{'\n'}
<Dim>{'    >'}{'\n'}</Dim>{`      `}<Dim>{'<p'}{'\n'}</Dim>{`        `}<Spot>{'className="text-sm text-error-500"'}</Spot>{'\n'}
<Dim>{'      >{error}</p>'}{'\n'}</Dim>{`    `}<Dim>{'</div>'}{'\n'}</Dim>{`    `}<Dim>{'<form'}{'\n'}</Dim>{`      `}<Spot>{'className="space-y-4"'}</Spot>{'\n'}
<Dim>{'    >'}{'\n'}</Dim>{`      `}<Dim>{'<p'}{'\n'}</Dim>{`        `}<Spot>{'className="section-header-anchor type-overline mb-6"'}</Spot>{'\n'}
<Dim>{'      >Contact Information</p>'}{'\n'}</Dim>{`      `}<Dim>{'<div'}{'\n'}</Dim>{`        `}<Spot>{'className="grid grid-cols-1 md:grid-cols-2 gap-4"'}</Spot>{'\n'}
<Dim>{'      >'}{'\n'}</Dim>{`        `}<Dim>{'<label'}{'\n'}</Dim>{`          `}<Spot>{'className="type-caption mb-1.5 block"'}</Spot>{'\n'}
<Dim>{'        >First Name</label>'}{'\n'}</Dim>{`        `}<Dim>{'<input'}{'\n'}</Dim>{`          `}<Spot>{'className="input-field"'}</Spot>{'\n'}
<Dim>{'        />'}{'\n'}</Dim>{`      `}<Dim>{'</div>'}{'\n'}</Dim>{`      `}<Dim>{'<button'}{'\n'}</Dim>{`        `}<Spot>{'className="btn-cart-large w-full mt-8"'}</Spot>{'\n'}
<Dim>{'      >Continue to Shipping</button>'}{'\n'}</Dim>{`    `}<Dim>{'</form>'}{'\n'}</Dim>{`  `}<Dim>{'</div>'}</Dim>
                </pre>
              </div>
              <p className="text-xs text-secondary-500 mt-2">
                Spotlight tokens: input-field, btn-cart-large, type-section-hed, type-overline, type-caption, error styling (border-error-500, bg-error-500), responsive grid (md:grid-cols-2), spacing (space-y-4, gap-4, mb-10)
              </p>
            </div>

            {/* Example 3: PaymentForm */}
            <div>
              <h3 className="text-lg font-semibold text-accent-500 mb-3">
                PaymentForm.tsx — Payment Selection
              </h3>
              <div className="bg-secondary-900 border border-secondary-700 rounded-lg p-4 overflow-x-auto">
                <pre className="font-mono text-xs text-brand-200 whitespace-pre-wrap">
{`  `}<Dim>{'<div'}{'\n'}</Dim>{`    `}<Spot>{'className="card-base space-y-6 pb-28 lg-touch:pb-6 lg-desktop:pb-6"'}</Spot>{'\n'}
<Dim>{'  >'}{'\n'}</Dim>{`    `}<Dim>{'<ExpressCheckoutElement />'}{'\n'}</Dim>{`    `}<Dim>{'<div'}{'\n'}</Dim>{`      `}<Spot>{'className="border-t border-border-secondary pt-4"'}</Spot>{'\n'}
<Dim>{'    >'}{'\n'}</Dim>{`      `}<Dim>{'<p'}{'\n'}</Dim>{`        `}<Spot>{'className="mb-3 text-center type-caption text-text-caption"'}</Spot>{'\n'}
<Dim>{'      >Or choose another payment method</p>'}{'\n'}</Dim>{`      `}<Dim>{'<PaymentElement />'}{'\n'}</Dim>{`    `}<Dim>{'</div>'}{'\n'}</Dim>{`    `}<Dim>{'<div'}{'\n'}</Dim>{`      `}<Spot>{'className="rounded border border-error-500/30 bg-error-500/10 px-3 py-2"'}</Spot>{'\n'}
<Dim>{'    >'}{'\n'}</Dim>{`      `}<Dim>{'<p'}{'\n'}</Dim>{`        `}<Spot>{'className="type-caption text-error-500"'}</Spot>{'\n'}
<Dim>{'      >{error}</p>'}{'\n'}</Dim>{`    `}<Dim>{'</div>'}{'\n'}</Dim>{`    `}<Dim>{'<div'}{'\n'}</Dim>{`      `}<Spot>{'className="flex items-center justify-center gap-1.5 type-caption text-text-caption"'}</Spot>{'\n'}
<Dim>{'    >'}{'\n'}</Dim>{`      `}<Dim>{'<svg'}{'\n'}</Dim>{`        `}<Spot>{'className="text-success-500"'}</Spot>{'\n'}
<Dim>{'      >'}{'\n'}</Dim>{`        `}<Dim>{'Secure payment encrypted by Stripe'}{'\n'}</Dim>{`      `}<Dim>{'</svg>'}{'\n'}</Dim>{`    `}<Dim>{'</div>'}{'\n'}</Dim>{`    `}<Dim>{'<button'}{'\n'}</Dim>{`      `}<Spot>{'className="btn-cart-large w-full justify-center py-4 hidden lg-touch:block lg-desktop:block"'}</Spot>{'\n'}
<Dim>{'    >'}{'\n'}</Dim>{`      `}<Dim>{'{payButtonLabel}'}{'\n'}</Dim>{`    `}<Dim>{'</button>'}{'\n'}</Dim>{`    `}<Dim>{'<div'}{'\n'}</Dim>{`      `}<Spot>{'className="flex items-center justify-center gap-2 type-caption text-text-secondary pt-2"'}</Spot>{'\n'}
<Dim>{'    >'}{'\n'}</Dim>{`      `}<Dim>{'<span className="font-medium">Visa</span>'}{'\n'}</Dim>{`      `}<Dim>{'<span>·</span>'}{'\n'}</Dim>{`      `}<Dim>{'<span className="font-medium">Mastercard</span>'}{'\n'}</Dim>{`      `}<Dim>{'<span>·</span>'}{'\n'}</Dim>{`      `}<Dim>{'<span className="font-medium">BLIK</span>'}{'\n'}</Dim>{`    `}<Dim>{'</div>'}{'\n'}</Dim>{`  `}<Dim>{'</div>'}</Dim>
                </pre>
              </div>
              <p className="text-xs text-secondary-500 mt-2">
                Spotlight tokens: card-base, border-border-secondary, type-caption, text-text-caption, text-error-500, text-success-500, btn-cart-large, responsive (lg-touch, lg-desktop), spacing (space-y-6, pt-4, py-4)
              </p>
            </div>

          </div>
        </section>

        {/* ───────────────────────────────────────── */}
        {/* SECTION 6: BIG SALES STATEMENT            */}
        {/* ───────────────────────────────────────── */}
        <section className="my-32 text-center py-20 border-t border-secondary-700">
          <h2
            className="text-brand-400"
            style={{
              fontSize: 'clamp(48px, 10vw, 64px)',
              fontWeight: 'bold',
              lineHeight: '1.2',
              letterSpacing: '-0.02em',
            }}
          >
            Design System<br />
            Globally Implemented<br />
            Across All Components
          </h2>
          <p className="text-secondary-300 text-lg mt-8 max-w-2xl mx-auto">
            One source of truth. Every color, every spacing unit, every shadow — defined once, applied everywhere.
          </p>
        </section>

      </div>
    </div>
  );
}
