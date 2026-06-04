Intelligence Gathering & Verification
Assessment: The current Sign In view is completely detached from the design system. It utilizes generic, default web components that break the premium, dark-mode luxury aesthetic established on the homepage.

Identified UX/UI Gaps (Red Flags):

Harsh White Inputs: The stark #FFFFFF background on the email/password fields violates the dark mode spatial depth. It causes extreme eye strain against the brand[700] page background and ignores the .input-field component in the design system.

Off-Brand Primary Button: The bright blue CTA (#2563EB or similar) is a critical violation. The brand palette relies on earthy/gold tones (brand[400], accent[500]).

Lack of Spatial Containment: The form elements float aimlessly in the center of the viewport without an anchoring container, making it feel like a wireframe rather than a finished luxury product.

Typographic Disconnect: The labels and headers do not appear to utilize the designated typography plugins (e.g., .type-section-hed, .type-caption).

3. Execution: Visual UX Specifications (Auth Flow)
To achieve a professional, premium standard, the Auth flow must rigidly adopt the tokens established in tailwind.config.ts.

File Type: .md
Scope: Mobile & Desktop UX/UI Visual Specs (Sign In / Sign Up)

A. Layout Architecture & Containment
Global Alignment: Centered vertically and horizontally in the viewport.

The Auth Card (Container): Do not let inputs float in the void. Wrap the entire form in a constrained container utilizing the .card-base or .card-product-dark styling.

Desktop: Max-width restricted to a highly readable, narrow column (e.g., 400px or 440px).

Mobile: 100% width with standard horizontal padding (e.g., 16px or 24px on the left/right), allowing the card to breathe within the viewport.

Background: surface.card (secondary.900) to create subtle separation from the surface.page (brand.700) background.

Border: 1px solid border.secondary.

B. Typography
Page/Card Header ("Sign In" / "Create Account"): * Must use .type-section-hed or .type-hero-sub.

Color: text.headline (brand.400).

Alignment: Center or Left-aligned (Left-aligned often feels more editorial and precise).

Input Labels ("Email", "Password"):

Must use .type-caption or .type-overline.

Color: text.caption (secondary.500) to recede and let the user's input be the focal point.

Placement: Immediately above the input fields, maintaining tight proximity (e.g., 4px or 8px gap).

Helper Text ("Don't have an account?"):

Text: .type-body (text.body).

Action Link ("Sign up"): Must use .btn-ghost styling (underlined, brand.400 color, uppercase) or simply text.accent to stand out without competing with primary buttons.

C. Form Fields (Inputs)
Strict Adherence: All text inputs must use the predefined .input-field component.

Background: surface.elevated (secondary.800 / #2E2E2D).

Text Color: text.body (brand.200).

Border: 1px solid border.primary (secondary.300), transitioning to brand.400 on focus.

Padding/Height: Must be substantial and comfortable for touch targets on mobile (min 44px height).

D. Actions (Buttons)
Primary CTA ("Sign In" / "Create Account"):

Strict Adherence: Must use the .btn-primary or .btn-cart-large component.

Background: brand.400 (#F6E3D5).

Text: brand.700 (#151B1B), .fontWeight.bold.

Width: 100% of the container width to provide a massive, easy-to-hit touch target on mobile and a dominant visual anchor on desktop.

Divider ("or"):

Text: .type-caption (secondary.500).

Flanking Lines: 1px solid border.secondary (secondary.700), spanning the remaining width.

OAuth Buttons (Google / GitHub):

Strict Adherence: Must use the .btn-secondary component.

Background: Transparent.

Border: 1px solid brand.200.

Text: brand.100.

Layout: Full width, stacked vertically below the divider. Include the respective brand icons left-aligned or centered next to the text.

4. Post-Execution Scan
Gaps: The specification covers the visual translation of the generic UI into the strict design system language for both mobile and desktop constraints.

Red Flags: None. The reliance on the pre-existing tailwind.config.ts plugins (.input-field, .btn-primary, .card-product-dark) ensures 100% alignment without requiring new CSS logic.

Over-complications: Avoided. Did not introduce split-screen layouts or complex imagery for the Auth flow. A simple, luxurious, centered card is the most robust and minimal solution.