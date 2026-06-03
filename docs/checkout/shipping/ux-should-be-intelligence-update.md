# CONTEXT
2. & 3. Intelligence Gathering & Verification
Failure Analysis: The mobile text overlap occurs because four distinct data points (Carrier Name, Sub-text, Price, Delivery Time) are forced into a single-row flex layout alongside an input, without wrapping or strict spatial constraints.

UX Intelligence: Shipping methods are mutually exclusive. The current UI incorrectly uses square checkboxes. Professional best practice dictates circular radio inputs for exclusive choices.

Aesthetic Context: Sanglogium represents high-end audio gear. The UI must reflect this through generous padding, precise alignment, and the existing dark-mode design system (surface-card, brand-400 accents).

4. & 5. Plan Formulation & Gap Scanning
Plan: Define a responsive structural blueprint for a "Delivery Method Card". Mobile will utilize a stacked text structure to guarantee zero horizontal collision. Desktop will utilize a linear, spaced layout.

Gap identified: The current design lacks a clear visual hierarchy between the carrier name and the price.

Fix applied: Strictly map existing typography tokens (.type-card-title, .type-price, .type-caption) to specific data points.

Gap identified: Unclear visual distinction for the "Selected" state.

Fix applied: Specify border color shifts (colors.brand.400) and slight elevation for the active state to provide immediate visual feedback.

Scan complete. Zero gaps/red flags remaining. Plan is safe, robust, and purely visual. Executing.

# UX Visual Specifications
# Visual UX Specifications: Delivery Method Page

## 1. Page-Level Structure
* **Background:** Maintain standard page background (`colors.surface.page` / `#151B1B`).
* **Header:** "Wybierz metodę dostawy" using `.type-section-hed`. Centered on desktop, left-aligned or centered on mobile (matching homepage hero sub-headers).
* **Spacing:** Use `spacing.6` (24px) or `spacing.8` (32px) below the header before the list of options begins.

## 2. The Delivery Option Component (The Card)

### A. General Card Styling (All Viewports)
* **Base Class:** Utilize `.card-base` (Background: `colors.surface.card`, Border: `colors.border.secondary`, Radius: `borderRadius.lg`).
* **Padding:** Ensure consistent internal padding (`spacing.4` to `spacing.6`).
* **Input Control:** Replace square checkboxes with **circular radio buttons**. 
    * *Unselected:* Border `colors.border.primary`, transparent center.
    * *Selected:* Border `colors.brand.400`, filled inner circle `colors.brand.400`.
* **Active/Selected Card State:** When a method is selected, transition the card border from `colors.border.secondary` to `colors.brand.400` to clearly frame the user's choice.

### B. Typography Mapping
* **Carrier Name** (e.g., "InPost Paczkomaty"): Use `.type-card-title` (`fontWeight.semibold`, `colors.text.body`).
* **Carrier Subtitle** (e.g., "Inpost Paczkomaty 24/7"): Use `.type-caption` (`colors.text.caption`).
* **Price** (e.g., "17,27 zł"): Use `.type-price` (`fontWeight.semibold`, `colors.text.priceTag`).
* **Delivery Time** (e.g., "1 dzień roboczy"): Use `.type-caption` or `.type-metadata` (`colors.text.secondary`).

---

## 3. Responsive Layout Rules

### A. Mobile Layout (Strict Collision Prevention)
To solve the text overlap issue, the card must abandon the single-row approach on small screens.

* **Structure:** 2-Column Grid/Flex.
    * **Left Column (Fixed width):** The radio button (vertically centered to the whole card, or aligned to the top text baseline).
    * **Right Column (Fluid, takes remaining width):** The text content block.
* **Text Content Block (Internal Structure):** Stack the information vertically.
    * **Row 1 (Top):** Carrier Name (Left) + Price (Right). Use `justify-between` so Price hugs the right edge.
    * **Row 2 (Bottom):** Carrier Subtitle (Left) + Delivery Time (Right). Use `justify-between`. 
    * *Note:* If viewport is extremely narrow (e.g., < 350px), Row 2 can safely wrap or stack Subtitle on top of Delivery Time without breaking the layout.

### B. Desktop Layout (Expanded View)
With abundant horizontal space, the layout can stretch for faster scannability.

* **Structure:** Single-Row Flexbox (`align-items: center`).
* **Left Group:** Radio Button + Carrier Name + Carrier Subtitle (Stacked vertically or placed side-by-side with a separator).
* **Right Group:** Delivery Time + Price. 
* **Alignment:** Push the Left Group to the start, and the Right Group to the end (`justify-between`). Ensure Price and Delivery time are right-aligned to create a clean, uniform vertical edge down the right side of the page.

---

## 4. CTA (Call to Action)
* **Button:** "Przejdź do płatności" must use the `.btn-cart-large` or `.btn-primary` class to match the "Continue to Shipping" button from the address page.
* **Placement:** Fixed at the bottom of the container or directly below the last shipping option with `spacing.8` top margin. Full width on mobile, max-width or aligned right on desktop.
