# Theme 10: Drawer State Management (nuqs)

## SangLogium Context
Drawers (cart, menu, filters) use URL state instead of React state. This gives instant responsiveness PLUS perfect history navigation. The solution is faster than Next.js parallel routes and simpler than state management. Decoupled architecture: Drawer Shell manages visibility, Content manages its own logic.

**Critical Files:**
- `app/components/layout/drawers/` — Drawer shell components
- `app/components/ui/drawers/` — Drawer content components
- `app/(store)/products/[...category]/ProductsFilterSortDrawersWrapper.tsx` — Drawer integration
- Uses `nuqs` library for URL state management

---

## Layer 1: Foundations Examination

### Diagnostic Assessment (20 minutes)

Answer these without looking at code. Binary pass/fail.

#### URL State Fundamentals
- [ ] What is URL state vs React state?
- [ ] Why would you use URL state for UI state?
- [ ] What are the tradeoffs of URL state?
- [ ] What is nuqs and what does it do?
- [ ] How does URL state work with browser history?

#### Drawer Architecture
- [ ] What is the "Drawer Shell" pattern?
- [ ] What is the difference between "Shell" and "Content"?
- [ ] Why decouple drawer visibility from drawer content?
- [ ] How do you open/close a drawer?
- [ ] What happens when user presses browser back button?

#### Nested Navigation
- [ ] How do you implement nested drawers (Account → Orders → Order Detail)?
- [ ] How does URL state handle nested navigation?
- [ ] What is the difference between `push` and `replace` in URL state?
- [ ] How do you preserve drawer state across page navigation?

#### Comparison
- [ ] Why not use Next.js parallel routes for drawers?
- [ ] Why not use React Context for drawer state?
- [ ] Why not use Zustand/Redux for drawer state?
- [ ] When would you NOT use URL state?

---

## Layer 1: Comprehensive Curriculum

### Module 1: URL State vs React State

**React State Approach:**
```tsx
// Traditional approach
const [isCartOpen, setIsCartOpen] = useState(false);

// Problems:
// - Back button doesn't close drawer
// - Can't link directly to open drawer
// - State lost on refresh
// - Complex prop drilling or context needed
```

**URL State Approach:**
```tsx
// URL state approach with nuqs
import { useQueryState } from 'nuqs';

function useCartDrawer() {
  const [drawer, setDrawer] = useQueryState('drawer');
  
  return {
    isOpen: drawer === 'cart',
    open: () => setDrawer('cart'),
    close: () => setDrawer(null),
  };
}

// URL: /products?drawer=cart
// Back button closes drawer automatically
// Can link directly: <a href="/products?drawer=cart">
// State persists across refresh
```

**Why URL State Wins for Drawers:**
1. **History Integration:** Back button works naturally
2. **Deep Linking:** Share URLs with specific drawer open
3. **Refresh Safety:** Drawer state survives page reload
4. **Simple Architecture:** No context providers needed
5. **Performance:** No re-render cascade from state changes

---

### Module 2: Drawer Shell Architecture

**Decoupled Components:**

```tsx
// 1. Drawer Shell (manages visibility)
// components/layout/drawers/DrawerShell.tsx
'use client';

import { useQueryState } from 'nuqs';
import { Drawer as VaulDrawer } from 'vaul'; // or custom

interface DrawerShellProps {
  param: string; // URL param name, e.g., 'drawer'
  value: string; // Value that opens this drawer, e.g., 'cart'
  children: React.ReactNode;
}

export function DrawerShell({ param, value, children }: DrawerShellProps) {
  const [currentValue, setValue] = useQueryState(param);
  const isOpen = currentValue === value;

  return (
    <VaulDrawer.Root open={isOpen} onOpenChange={(open) => {
      setValue(open ? value : null);
    }}>
      <VaulDrawer.Portal>
        <VaulDrawer.Overlay />
        <VaulDrawer.Content>
          {children}
        </VaulDrawer.Content>
      </VaulDrawer.Portal>
    </VaulDrawer.Root>
  );
}
```

```tsx
// 2. Drawer Content (manages its own logic)
// components/ui/drawers/CartDrawerContent.tsx
'use client';

import { useCart } from '@/store/store';

export function CartDrawerContent() {
  const { items, removeItem, updateQuantity } = useCart();
  
  return (
    <div className="p-4">
      <h2 className="type-section-hed">Your Cart</h2>
      {items.map(item => (
        <CartItem 
          key={item.id} 
          item={item}
          onRemove={() => removeItem(item.id)}
          onUpdateQty={(qty) => updateQuantity(item.id, qty)}
        />
      ))}
      <CartSummary items={items} />
    </div>
  );
}
```

```tsx
// 3. Usage: Combine shell + content
// app/(store)/layout.tsx
import { DrawerShell } from '@/components/layout/drawers/DrawerShell';
import { CartDrawerContent } from '@/components/ui/drawers/CartDrawerContent';

export default function StoreLayout({ children }) {
  return (
    <>
      {children}
      
      {/* Cart Drawer */}
      <DrawerShell param="drawer" value="cart">
        <CartDrawerContent />
      </DrawerShell>
    </>
  );
}
```

**Benefits of Decoupling:**
- Shell can be reused for different content types
- Content doesn't know it's in a drawer (testable in isolation)
- Easy to change drawer library without touching content
- Multiple drawers can share the same shell logic

---

### Module 3: Nested Navigation Pattern

**The Challenge:**
Account drawer has tabs: Orders, Settings, Addresses
Orders tab has list → click order → order detail

**URL State Solution:**
```
/drawer=account          → Account overview (default tab)
/drawer=account&tab=orders → Orders list
/drawer=account&tab=orders&orderId=123 → Order detail
```

**Implementation:**
```tsx
// components/ui/drawers/AccountDrawerContent.tsx
'use client';

import { useQueryState } from 'nuqs';

export function AccountDrawerContent() {
  const [tab, setTab] = useQueryState('tab', { defaultValue: 'overview' });
  const [orderId, setOrderId] = useQueryState('orderId');

  return (
    <div>
      <TabBar activeTab={tab} onTabChange={setTab} />
      
      {tab === 'overview' && <AccountOverview />}
      
      {tab === 'orders' && !orderId && (
        <OrdersList onOrderClick={(id) => setOrderId(id)} />
      )}
      
      {tab === 'orders' && orderId && (
        <OrderDetail 
          orderId={orderId} 
          onBack={() => setOrderId(null)} 
        />
      )}
      
      {tab === 'settings' && <SettingsPanel />}
      {tab === 'addresses' && <AddressesPanel />}
    </div>
  );
}
```

**Navigation Behavior:**
- Click "Account" → `drawer=account` (push to history)
- Click "Orders" tab → `tab=orders` (replace, don't add history)
- Click order → `orderId=123` (push to history)
- Press Back → removes `orderId`, shows orders list
- Press Back again → closes drawer (drawer param removed)

---

### Module 4: nuqs Deep Dive

**Basic Usage:**
```tsx
import { useQueryState } from 'nuqs';

// String param
const [search, setSearch] = useQueryState('q');

// With default value
const [sort, setSort] = useQueryState('sort', { defaultValue: 'relevance' });

// Number param
const [page, setPage] = useQueryState('page', {
  parse: (v) => parseInt(v) || 1,
  serialize: (v) => v.toString(),
});

// Array param (for filters)
const [brands, setBrands] = useQueryState('brands', {
  parse: (v) => v ? v.split(',') : [],
  serialize: (v) => v.join(','),
});
```

**Options:**
```tsx
const [value, setValue] = useQueryState('key', {
  // Shallow: don't trigger server fetch
  shallow: false, // default: true
  
  // History: push vs replace
  history: 'push', // 'push' | 'replace'
  
  // Scroll behavior
  scroll: false, // don't scroll to top
  
  // Throttling
  throttleMs: 100, // delay before URL update
});
```

**Why nuqs vs useSearchParams:**
- Type-safe with parsers/serializers
- Handles edge cases (arrays, numbers)
- Better performance (throttling, batching)
- Cleaner API

---

## Layer 2: Integration Examination

### Integration Challenge 1: Multi-Drawer System

**Scenario:** Build a store layout with 3 drawers

**Requirements:**
1. Cart drawer (`?drawer=cart`)
2. Mobile menu (`?drawer=menu`)
3. Filters drawer (`?drawer=filters`)
4. Only one open at a time (new drawer closes existing)
5. Each has independent content component

**Implementation:**
```tsx
// app/(store)/layout.tsx
export default function StoreLayout({ children }) {
  return (
    <>
      {children}
      
      <DrawerShell param="drawer" value="cart">
        <CartDrawerContent />
      </DrawerShell>
      
      <DrawerShell param="drawer" value="menu">
        <MobileMenuContent />
      </DrawerShell>
      
      <DrawerShell param="drawer" value="filters">
        <FiltersDrawerContent />
      </DrawerShell>
    </>
  );
}
```

**Test Cases:**
- Open cart → URL has `?drawer=cart`
- Open filters → `?drawer=filters` (cart closes)
- Press back → drawer closes (param removed)
- Refresh page → same drawer still open

---

### Integration Challenge 2: Drawer + Filters Integration

**Scenario:** Product filters in drawer that sync with URL

**Requirements:**
1. Filter drawer opens with `?drawer=filters`
2. Filter selections sync to URL (`?brands=sennheiser,audio-technica&price=100-500`)
3. Apply filters → drawer closes → products update
4. Clear filters → removes params
5. Direct URL with filters opens drawer and applies filters

**URL Structure:**
```
/products/headphones?drawer=filters&brands=sennheiser&price=100-500
```

**Success Criteria:**
- [ ] Filters in drawer reflect URL params
- [ ] Changing filters updates URL (shallow, no server fetch)
- [ ] Apply button closes drawer
- [ ] Clear button removes all filter params
- [ ] Direct navigation to URL works correctly

---

## Layer 3: Systems Examination

### Systems Challenge: Drawer vs Modal vs Page

**Scenario:** Design navigation for "Product Quick View"

**Options:**

**Option 1: Drawer**
- URL: `?drawer=quick-view&product=123`
- Pros: Fast, keeps context, mobile-friendly
- Cons: Limited space, not shareable

**Option 2: Modal (Dialog)**
- URL: `?modal=product&product=123`
- Similar to drawer, centered overlay

**Option 3: Intercepted Route**
- URL: `/products/123` (but shown as modal when navigated from list)
- Next.js pattern with `(.)` segments
- Pros: Shareable URL, SSR support
- Cons: Complex, can have performance issues

**Option 4: Full Page**
- URL: `/products/123`
- Pros: Maximum space, SEO-friendly
- Cons: Slower, loses list context

**Design Decision:**
1. Choose approach with justification
2. Define URL structure
3. Handle mobile vs desktop differences
4. Plan for accessibility (focus management, escape key)

---

## Stress Test Scenarios

### Scenario 1: Drawer State Sync Bug

**Given:**
```tsx
function ProductFilters() {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState({});
  
  return (
    <>
      <button onClick={() => setIsOpen(true)}>Filters</button>
      <Drawer open={isOpen} onClose={() => setIsOpen(false)}>
        <FilterForm onApply={(f) => {
          setFilters(f);
          setIsOpen(false);
        }} />
      </Drawer>
    </>
  );
}
```

**Problems:**
1. State lost on refresh
2. Back button doesn't close drawer
3. Can't link to filtered view
4. Multiple filter components don't sync

**Fix with URL State:**
```tsx
function ProductFilters() {
  const [drawer, setDrawer] = useQueryState('drawer');
  const [brands, setBrands] = useQueryState('brands');
  // ... other filters
  
  const isOpen = drawer === 'filters';
  
  return (
    <>
      <button onClick={() => setDrawer('filters')}>Filters</button>
      <Drawer open={isOpen} onClose={() => setDrawer(null)}>
        <FilterForm 
          brands={brands}
          onBrandsChange={setBrands}
          onApply={() => setDrawer(null)}
        />
      </Drawer>
    </>
  );
}
```

---

### Scenario 2: Drawer Performance Issue

**Symptom:** Opening drawer causes jank (dropped frames)

**Investigation:**
1. Drawer content renders all at once (heavy component tree)
2. Large lists inside drawer
3. Images loading synchronously
4. Animations not GPU-accelerated

**Fix:**
1. Lazy load drawer content (only render when opening)
2. Virtualize long lists
3. Lazy load images
4. Use `transform` and `opacity` for animations
5. Add `will-change: transform` on drawer

---

## Quick Reference: URL State Patterns

| Use Case | URL Pattern | State Type |
|----------|-------------|------------|
| Open drawer | `?drawer=cart` | String |
| Tab selection | `?tab=orders` | String with default |
| Pagination | `?page=2` | Number |
| Filters | `?brands=a,b,c` | Array (comma-separated) |
| Range | `?price=100-500` | Custom parser |
| Boolean | `?expanded=true` | Boolean |
| Nested view | `?drawer=account&orderId=123` | Multiple params |

---

## Completion Checklist

- [ ] Can explain URL state vs React state tradeoffs
- [ ] Can implement Drawer Shell + Content pattern
- [ ] Can handle nested navigation with URL params
- [ ] Can use nuqs for type-safe URL state
- [ ] Can debug drawer state sync issues
- [ ] Can optimize drawer performance
- [ ] Can decide when to use drawer vs modal vs page

---

*Next: Theme 11 — AI-Assisted Development*
