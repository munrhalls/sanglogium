Adhere with strict discipline: keep everything robust, coherent, simplest possible. If anything complicates or is vague, stop immediately.

Template: HTML structure 
Goal: capture HTML structure in minimalest possible way but clear
Criteria: 0 unnecessary verbiage, 0 unnecessary characters

# HTML Structure: [Feature Name]
<!-- element="..." is pure documentation, not actual HTML -->
## When [condition]
<div element="[page]">
  <button element="[class]">[label]</button>
</div>

## When [condition]
<div element="[page]">
  <div element="[container]">
    [element]
  </div>
</div>

## ...

## Guidance - making it clear and readable
- Use descriptive section headers (e.g., "Basket Controls on any products page" instead of just "Basket Controls")
- Add HTML separator divs between major sections: `<div style="border-bottom: 5px solid #ccc; margin-top: 3rem; margin-bottom: 3rem;"></div>`
- Include state-specific examples (e.g., "decrement disabled when quantity === 1")

## Example 
(this is only for reference, to understand how proper template execution looks like) 

```
# Non-Local Basket

# Basket Controls on any products page
## When viewing any products page and given product is not in basket
<div element="product-page">
  <button element="add-to-basket">Add</button>
</div>

## When viewing any products page, a given product is in basket
<div element="product-page">
  <button element="decrement">-</button>
    <span element="quantity">1</span>
  <button element="increment">+</button>
</div>

## When viewing any products page, a given product is in basket - after increment click
<div element="product-page">
    <button element="decrement">-</button>
    <span element="quantity">2</span>
    <button element="increment">+</button>
</div>

<div style="border-bottom: 5px solid #ccc; margin-top: 3rem; margin-bottom: 3rem;">
<!-- separator -->
</div>

# Basket Controls on /basket page
<div element="product-page">
    <button element="decrement">-</button>
    <span element="quantity">8</span>
    <button element="increment">+</button>
    <button element="remove">X</button>
</div>

## When viewing /basket page - decrement disabled when quantity === 1
<div element="product-page">
    <button element="decrement" style="opacity: 0.5; cursor: not-allowed;">-</button>
    <span element="quantity">1</span>
    <button element="increment">+</button>
    <button element="remove">X</button>
</div>

<div style="border-bottom: 5px solid #ccc; margin-top: 3rem; margin-bottom: 3rem;">
<!-- separator -->
</div>

# Header Basket Button 

## When no items in basket
<div element="header">
  <button element="basket-button">
    <span element="badge" style="display: inline-block; width: 20px; height: 20px; background: white;"></span>
  </button>
</div>

## When items in basket
<div element="header">
  <button element="basket-button">
    <span element="badge" style="display: inline-block; width: 20px; height: 20px; background: white;">&nbsp; 3</span>
  </button>
</div>
```
