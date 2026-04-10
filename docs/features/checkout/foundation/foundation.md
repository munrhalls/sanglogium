SCOPE:
- map invariant relationships between events and documents, organize to determine invariants given the circular e -> FSM -> ui update + function calls (api etc.) -> e core mechanism, consideration for the need Next 15 context, consideration for nuqs potential use (for url forward/back)
- only for guest checkout (authenticated later)

OUT OF SCOPE:
- authenticated user checkout
- any coding
- any tests
- anything other than purely mapping invariant relationships mentally/in simplest possible .md doc

LAY OF THE LAND

bounds:
left: basket page checkout click
right: return page: successful payment, order created
top: user infinite n times re-checkout, back/forward, button clicks
bottom: documents handling

rules:
- user events cannot be ignored or unhandled (unless explicitly disabled based on status) and must result in matching documents update
- user infinite n times re-checkout, back/forward, button clicks tab closes cannot cause data incorruptibility failure


ux slices:
- basket page slice
- address slice
- shipping slice
- stripe embedded payment slice
- return page slice

documents:
- client basket
- product backend documents
- order document
- guest cookie data
- guest jwt cookie token (guest authentication)
- backend line items (validated stripe price + stock)
- client address
- validated backend address
- client shipping
- validated backend shipping
- stripe client secret line items and transaction

events:
- @basket page: click checkout
- @basket page: click forward button if available
- @basket page: click back button
- @basket page: close tab
- @basket page: click approve (updated basket)
- @basket page: click update (updated basket)
- @basket page: click retry (connection fail, refreshes page)

- @address page: click submit
- @address page: click back
- @address page: click forward
- @address page: close tab

- @shipping page: click delivery choice
- @shipping page: click back
- @shipping page: click forward
- @shipping page: close tab

- @embedded stripe payment page: click submit
- @embedded stripe payment page: click back
- @embedded stripe payment page: click forward
- @embedded stripe payment page: close tab

- @return page: click back
- @return page: click forward
- @return page: close tab

- important: any of this can potentially happen n infinite times over if not handled, e.g. address form re-submission

data incorruptibility:
- products reserved count
- products stock count
- prices
- address
- shipping

data flexibility:
- products reserved count
- products stock count
- address
- shipping

corrupting if not handled events:
- user infinite n times re-checkout, back/forward, button clicks

possible corruptions:
- honest customer - mismatch vs events of infinite amount of reserved products - unhandled blocks all products purchase
- cancelled payment - reservations not reverted or stock modified from original value
- guest cookie - jwt authentication falsely lost or falsely given or modified
- guest cookie - a data mismatch vs client vs backend vs reserved stock, stock, prices, address, shipping from events stream user infinite n times re-checkout, back/forward, button clicks tab closes

ux slices vs event stream:
- basket page slice vs user infinite n times re-checkout, back/forward, button clicks tab closes
- address slice vs user infinite n times re-checkout, back/forward, button clicks tab closes
- shipping slice vs user infinite n times re-checkout, back/forward, button clicks tab closes
- payment slice vs user infinite n times re-checkout, back/forward, button clicks tab closes
- return page vs user infinite n times re-checkout, back/forward, button clicks tab closes

document changes:
- products: reserve stock count from checkout click
- products: stock count - decrement, from stripe payment confirmed event
- order: created from stripe payment confirmed event
- address: backend address saved from form submission/re-submission
- shipping: backend shipping choice saved from form submission/re-submission
