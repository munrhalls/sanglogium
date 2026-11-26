[Back: Checkout](README.md)
# Checkout proof book
Scope: what can go wrong with money, goods and failures, from the basket to a paid order. Looks, wording and emails are outside it.

## The one command
`npm run proof:checkout`
- It ends in `PASS` when every line below says yes. `N NO` means N lines said no, and each NO line says what happened instead. `proof broken` means the proof itself cannot be trusted, and nothing it printed counts. Exit codes 0, 1 and 2.
- It runs on every pull request and every push to main (GitHub check "Checkout proof").
- It calls the shop's real code. The bank (Stripe) and the warehouse (Sanity) are stand-ins on this machine. Nothing waits, rolls dice or leaves the machine, so the same run twice prints the same lines.

## Why a PASS can be trusted
- Before the shop is asked anything, the stand-in bank and warehouse must show they keep the real rules: the same request twice is one payment, and a write based on an old stock reading writes nothing. If not, the run stops as broken.
- Every amount is a number written into the situation. The shop is never asked what the right answer is.
- Every refusal except the stock one is tried on a full shelf, so it can only be refused for its own reason.
- Each line has a second check that it still runs every situation, still calls the shop, and that its reading calls wrong paperwork a NO. The "Cannot lie" sentence under each line says what that check holds.
- This book has to list every printed line, each with why it cannot lie, and nothing else. A missing or extra line stops the run as broken.

## 1. The charge
Is the customer charged the right amount, for real goods, at a shipping price the shop offered?

- **Every legal basket is charged the shelf price, not the price the customer typed**
  Cannot lie: the browser sends a total of 1 and fake goods, prices, shipping and address, the totals are written numbers, and a charge of 1 grosz, in dollars or for other goods is read as NO.
- **Charging a legal basket does not sell the goods**
  Cannot lie: one written order or one unit gone from the shelf is read as NO.
- **Changing to any other legal basket leaves exactly one charge for the new basket**
  Cannot lie: all 56 changes between legal baskets are tried, and no charge, two open charges or the old amount is read as NO.
- **A basket asking for exactly what the shelf holds is charged**
  Cannot lie: every legal basket is tried on a shelf holding exactly its units, so a shop that refuses the last unit is read as NO.
- **An empty basket is not charged**
  Cannot lie: the list must hold an empty basket, and any payment or order is read as NO.
- **A missing shipping price is not charged**
  Cannot lie: the list must hold a missing shipping price on one item and on two, and any payment or order is read as NO.
- **An unknown product is not charged**
  Cannot lie: the list must hold a product the shelf does not have, and any payment or order is read as NO.
- **A product with no price is not charged**
  Cannot lie: the list must hold a missing price, a price of 0 and a negative price, and any payment or order is read as NO.
- **A quantity of zero is not charged**
  Cannot lie: the list must hold a 0 with shipping and a 0 beside a real line, and any payment or order is read as NO.
- **A negative quantity is not charged**
  Cannot lie: the list must hold a negative quantity beside a real line, with shipping, and any payment or order is read as NO.
- **A fractional quantity is not charged**
  Cannot lie: the list must hold a fraction with shipping and without it, and any payment or order is read as NO.
- **A total that is not a whole number of grosze is not charged**
  Cannot lie: the list must hold half a grosz of shipping and a price that is not whole grosze, and any payment or order is read as NO.
- **A price the computer cannot store exactly is not charged**
  Cannot lie: every situation is checked on paper to be too big to store exactly, and any payment or order is read as NO.
- **A product id that cannot be written down whole is not charged**
  Cannot lie: the list must hold an id with a comma and an id with a colon, and any payment or order is read as NO.
- **A basket that does not fit in the payment record is not charged**
  Cannot lie: every situation is checked on paper to be longer than the 500 characters the record holds, and any payment or order is read as NO.
- **An address that does not fit in the payment record is not charged**
  Cannot lie: the address is checked on paper to be longer than the 500 characters the record holds, and any payment or order is read as NO.
- **A basket asking for more than the shelf holds is not charged**
  Cannot lie: the list must hold more than the shelf has, a shelf of 0, a missing count, and one product split across two lines, and any payment or order is read as NO.

### The shipping price
- **An empty basket does not save a shipping price**
  Cannot lie: before any line, the ruler shows a refusal is never read as a saved price, and the old price is never read as cleared.
- **No address does not save a shipping price**
  Cannot lie: the same ruler, and the old written price must still be there.
- **No session does not save a shipping price**
  Cannot lie: the same ruler, and the old written price must still be there.
- **A zero shipping price is not saved**
  Cannot lie: the ruler shows 0 is never called a price on paper.
- **A negative shipping price is not saved**
  Cannot lie: the ruler shows -1 is never called a price on paper.
- **A fractional shipping price is not saved**
  Cannot lie: the ruler shows 1.5 grosze is never called a price on paper.
- **A blank shipping price is not saved**
  Cannot lie: the ruler shows a blank is never called a price on paper.
- **One grosz of shipping is saved**
  Cannot lie: the saved price must be exactly the written 1, saved once.
- **The chosen shipping price is saved**
  Cannot lie: the saved price and service must be exactly the written ones, saved once.
- **The shipping page remembers the offered prices**
  Cannot lie: the remembered offers must be exactly the written 1550 and 900 grosze.
- **A price that was not offered is not saved**
  Cannot lie: the ruler shows a refusal is never read as saved, and the old written price must still be there.
- **Another rate's price is not saved**
  Cannot lie: the price belongs to the other offered rate, so only a shop that checks the rate and the price together passes.
- **No offered rate means nothing is saved**
  Cannot lie: the same ruler, and the old written price must still be there.
- **An empty rate list means nothing is saved**
  Cannot lie: the same ruler, and the old written price must still be there.
- **The other offered price is saved**
  Cannot lie: the saved price must be exactly the written 900, so a shop that refuses everything fails here.
- **The same offered rate keeps the saved price**
  Cannot lie: before any line, the ruler shows a changed price, another rate, 0 or an empty list is never read as the saved rate.
- **The page shows every option the carrier returned**
  Cannot lie: the shown options must be exactly the written ones.
- **A new price for that rate drops the saved price**
  Cannot lie: the ruler shows a changed price is never read as the saved rate.
- **A missing rate drops the saved price**
  Cannot lie: the ruler shows an absent rate is never read as the saved rate.
- **Another rate at the same grosze drops the saved price**
  Cannot lie: the ruler shows another rate is never read as the saved rate, even at the same grosze.
- **A price of 0 is dropped**
  Cannot lie: the ruler shows 0 is never an offered rate.
- **No saved price stays unsaved**
  Cannot lie: every shipping field must still be empty.
- **No address keeps the saved price**
  Cannot lie: the page must leave for the address step before asking any carrier.
- **An empty basket keeps the saved price**
  Cannot lie: the page must leave for the basket before asking any carrier.
- **The same goods keep the price**
  Cannot lie: before any line, the ruler shows the same goods are never called different, and different goods never the same.
- **The same goods in another order keep the price**
  Cannot lie: the same ruler, on goods listed in another order.
- **The same goods split across lines keep the price**
  Cannot lie: the same ruler, on one product split across two lines.
- **A different quantity drops the price**
  Cannot lie: the same ruler, and the old shipping price must be gone.
- **A different product drops the price**
  Cannot lie: the same ruler, and the old shipping price must be gone.
- **An added product drops the price**
  Cannot lie: the same ruler, and the old shipping price must be gone.
- **A removed product drops the price**
  Cannot lie: the same ruler, and the old shipping price must be gone.
- **No goods drop the price**
  Cannot lie: the same ruler, and the old shipping price must be gone.

### The address the goods go to
- **An empty basket does not save an address**
  Cannot lie: before any line, the ruler shows a wrong step is never read as a pass.
- **A missing basket does not save an address**
  Cannot lie: the same ruler, and nothing may be saved.
- **A rejected address stays on the address step**
  Cannot lie: the same ruler, and the old shipping choice must still be there.
- **An unconfirmed address stays on the address step**
  Cannot lie: the same ruler, and the old shipping choice must still be there.
- **An accepted address is stored and the old shipping choice is cleared**
  Cannot lie: the ruler shows the old price is never read as cleared, so a price for the old address cannot survive.

## 2. From payment to order
Does every payment become exactly one order, for the amount, goods, delivery service and address that were paid for?

- **Every payment the shop creates becomes one order for that same payment**
  Cannot lie: the payment is the one the shop itself created, and a missing or second order, a wrong price, currency, shipping, service or address, or unmoved stock is read as NO.
- **A payment the shop creates for the longest address it accepts becomes one order to that address**
  Cannot lie: the address on the payment must be exactly 500 characters, and the order must carry that long street, not the usual one.
- **One bank notice creates one order for every legal basket**
  Cannot lie: every legal basket goes through the real signed bank notice, and a missing, extra or wrong order is read as NO.
- **The same bank notice twice still creates one order for every legal basket**
  Cannot lie: the notice must be the same notice twice, and a second order or stock moved twice is read as NO.
- **The customer returning once creates one order for every legal basket**
  Cannot lie: every legal basket goes through the real return from the bank, and a missing, extra or wrong order is read as NO.
- **The customer returning twice still creates one order for every legal basket**
  Cannot lie: the return must be the same return twice, and a second order or stock moved twice is read as NO.
- **The customer returns, then the bank notice arrives: still one order for every legal basket**
  Cannot lie: the return must come before the notice, and a second order or stock moved twice is read as NO.
- **The bank notice arrives, then the customer returns: still one order for every legal basket**
  Cannot lie: the notice must come before the return, and a second order or stock moved twice is read as NO.
- **The bank notice and the customer's return at the same moment still create one order for every legal basket**
  Cannot lie: both writes are held until both have read the shelf, so they truly collide, and a second order or stock moved twice is read as NO.
- **A later shelf price does not change the order when the customer returns first**
  Cannot lie: the shelf price becomes 9000 before the sale, so a shop that read it would write 9000 and be read as NO.
- **A later shelf price does not change the order when the bank notice arrives first**
  Cannot lie: the shelf price becomes 9000 before the sale, so a shop that read it would write 9000 and be read as NO.
- **A later basket does not change the order when the customer returns first**
  Cannot lie: the cookie's basket is changed to other goods before the sale, so a shop that read it would be read as NO.
- **A later basket does not change the order when the bank notice arrives first**
  Cannot lie: the cookie's basket is changed to other goods before the sale, so a shop that read it would be read as NO.
- **A later shipping choice does not change the order when the customer returns first**
  Cannot lie: the cookie's shipping becomes another service at a price no legal basket pays, so a shop that read it would be read as NO.
- **A later address does not change the order when the customer returns first**
  Cannot lie: every field of the cookie's address is changed before the customer returns, so a shop that read it would be read as NO.
- **A payment that is still processing sells nothing, and success afterwards sells once**
  Cannot lie: nothing may be sold before the payment succeeds, the basket must still be there, and exactly one order must follow.
- **Returning while the bank still wants a payment method sells nothing**
  Cannot lie: one written order or one unit gone is read as NO, and the basket must still be there.
- **Returning after the bank canceled sells nothing**
  Cannot lie: one written order or one unit gone is read as NO, and the basket must still be there.
- **A failed bank notice sells nothing**
  Cannot lie: the notice is really signed, so only the failed status stops the sale, and one order or one unit gone is read as NO.
- **A canceled bank notice sells nothing**
  Cannot lie: the notice is really signed, so only the canceled status stops the sale, and one order or one unit gone is read as NO.
- **A forged bank notice sells nothing**
  Cannot lie: every legal basket is tried with three different forged signatures, and one order or one unit gone is read as NO.
- **A bank notice with no signature sells nothing**
  Cannot lie: both no signature and an empty one are tried, and one order or one unit gone is read as NO.
- **Returning with someone else's payment sells nothing**
  Cannot lie: the other payment exists and has succeeded, so only the check that it belongs to this checkout stops the sale.

## 3. Stock
Do the orders and the stock, read together, explain every unit? An order short of units is marked "Short of stock", and the Studio order list shows every order's mark.

- **Every pair of payments the shelf can fill takes exactly the units they paid for, and neither is marked short of stock**
  Cannot lie: the shelf counts and marks are written, and stock that moved more or less than the orders record, stock below 0, or a wrong mark is read as NO.
- **Every payment for units the shelf does not have is marked short of stock, and its lines record the missing units**
  Cannot lie: the two sales are held until both have read the same shelf, the second notice is delivered again, and an order without its mark or without its missing units is read as NO.
- **A payment for a product removed from the shop is still written, marked short of stock**
  Cannot lie: the product is never put on the shelf, and a missing order, a unit recorded as taken, or a missing mark is read as NO.

## 4. When something fails
Is anyone left charged with no order?

- The order write is refused because another sale changed the same shelf first: the bank is told to try again, and its next notice writes the order. Answered by "Every payment for units the shelf does not have leaves a record of those units", which delivers the refused notice again.
- The checkout cookie runs out before the customer comes back from the bank: answered by "One bank notice creates one order for every legal basket", because the bank notice needs no cookie.
- Two customers pay for the last unit at the same moment: both saw it on the shelf, so both are charged; the second order is written and marked short of stock. Answered by "Every payment for units the shelf does not have is marked short of stock, and its lines record the missing units".
- A basket or address so long that the order cannot be written after the charge: answered by the longest basket in every legal list and by the longest address line, each written right up to what the payment record holds.

## Open
These are known holes. Each is closed by a coming change, and its line moves up.
- If the bank notice and the customer's return both fail to write the order, and the bank stops retrying, nothing writes it later.

## Cannot happen
- The customer is charged twice for one payment: cannot happen, because the bank lets one payment succeed only once, and the shop leaves only one payment open per checkout ("Changing to any other legal basket leaves exactly one charge for the new basket").
- An order is written without its stock change, or the reverse: cannot happen, because both go in one all-or-nothing write, and the stand-in warehouse is checked to keep that rule before anything runs.
- The customer edits the checkout cookie: cannot happen, because the cookie is sealed with the shop's secret, so a changed one is not accepted.

## Out of scope
- The real Stripe and Sanity: out of scope, because the proof runs offline; the stand-ins copy the published rules and are checked first.
- Refunds and disputes: out of scope, because the shop has no refund feature; the owner refunds in Stripe, and stock is not put back.
- The confirmation email: out of scope, because it is neither money nor goods; the order is written before the email is tried.
- The card number: out of scope, because the bank's own form takes it, so the shop never sees it.
- The tax line on the order: out of scope, because it is information inside the price and changes no amount charged.
- What the owner does with an order marked short of stock (a part refund, a restock): out of scope, because the shop has no refund feature; the mark shows which order needs it.
