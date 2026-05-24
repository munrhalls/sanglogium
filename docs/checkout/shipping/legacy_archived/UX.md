# Shipping Page End User Experience Requirements

## Address Entry
- User enters shipping address (street, city, postal code, country)
- System validates address format in real-time
- Address auto-complete suggestions available for major cities

## Carrier Options Display

### Visual Elements
- **Carrier icons/logos**: Each carrier displayed with recognizable brand icon (DHL, FedEx, UPS, InPost, DPD)
- **Service level badges**: Visual indicators for service tiers (Express = red/orange badge, Standard = blue badge, Economy = green badge)
- **Card-based layout**: Each shipping option presented as a selectable card with carrier branding
- **Price prominence**: Price displayed prominently in large font, currency symbol (PLN) visible
- **Delivery date**: Estimated delivery date shown in calendar icon or clock icon format
- **Speed indicators**: Visual cues for delivery speed (lightning bolt for express, truck for standard, parcel locker icon for economy)

### Layout
- 4-6 carrier options displayed side-by-side in a horizontal scroll or grid layout
- Each option shows: carrier icon, carrier name, service level badge, price (PLN), estimated delivery date
- Options sorted by price (cheapest first) or delivery speed (fastest first) with visual sorting indicator
- Carriers include: DHL Express, FedEx Express, UPS Standard, InPost Parcel Locker, DPD Classic

### Interactive States
- **Unselected state**: Neutral background, subtle border, carrier icon in grayscale
- **Selected state**: Highlighted background (accent color), bold border, carrier icon in full color, checkmark indicator
- **Hover state**: Slight elevation/shadow, border color change, carrier icon brightness increase
- **Disabled state**: Grayed out, reduced opacity, not selectable

## Rate Calculation
- Rates calculated based on parcel weight and dimensions
- Distance-based delivery times (1-3 days depending on geographic location)
- Prices vary by carrier service tier (express vs standard vs economy)
- Price breakdown visible on hover or click (base rate + weight surcharge)

## Selection & Checkout
- User selects preferred shipping method by clicking carrier option card
- Selected option visually highlighted with accent color and checkmark
- "Continue to Payment" button becomes active after selection
- Selected shipping method persists and displays in order summary
- User proceeds to payment with selected shipping method and transparent total pricing
