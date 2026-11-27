[Back: Admin](README.md)
# Admin proof book
Scope: who can open the admin area, what news reaches the owner, and that the admin area cannot hurt the shop. Looks and wording are outside it.

## The one command
`node --experimental-strip-types --import ./tools/alias-loader.mjs --import ./tests/admin/load.mjs tests/admin/admin.test.ts`
- It ends in `PASS` when every line answered the way its question says it must. `NO: N of M questions` means N lines did not, and each NO line says what happened instead. `proof broken` means the proof itself cannot be trusted, and nothing it printed counts. Exit codes 0, 1 and 2.
- It runs on every pull request and every push to main, twice, and fails if the two runs differ (GitHub check "Admin proof").
- It calls the shop's real code. Sign-in, Stripe, Sanity and Resend are stand-ins on this machine that write down every call. Made-up people live at `.invalid` addresses, which cannot exist. Nothing leaves the machine.
- Add `entry`, `config`, `list`, `notices` or `ci` at the end to run one group.

## Why a PASS can be trusted
- Before the shop is asked anything, the stand-ins must keep their own rules: Resend sends one email per key and refuses the same key with a different email, Stripe lists newest first and 100 to a page, and Stripe and Sanity write down and refuse every write. If not, the run stops as broken.
- The two file checks (every admin page checks the owner first; no admin or owner-email file writes to the logs) are first shown bad samples and must call them NO.
- For anyone but the owner, only "page not found" counts as a refusal. A sign-in page, a redirect or a crash is a NO, because each tells a stranger the page exists.
- The stand-ins never decide right and wrong. Each line compares what the shop did with what the stand-ins wrote down.
- Two things are taken on the services' word, because the proof never calls them: Resend keeps a key for 24 hours, and Stripe emails the account about disputes and failing webhooks.

## What the owner sets
- `OWNER_EMAILS`: the owner emails, separated by commas. The same list decides who may open `/manager` and who gets the owner emails. If it is not set, nobody gets in, and every paid order's webhook answers "not done", so Stripe keeps retrying and warns the account.

## Scope decisions
Built, because a person must act or see it and no tool the owner already has shows it:
- **The owner check on admin pages.** The admin pages were public, and no tool guards the shop's own pages.
- **An email for each paid order, naming any missing units.** A parcel must go out. Studio lists the order only when someone opens it, and Stripe's payment email cannot say whether the order was made or is short.
- **An email for each payment that could not become an order.** Money was taken and there is no parcel. Before, this was only a log line. It comes again once a day while the daily sweep still cannot place the order (up to 7 days).
- **The admin page: paid payments with no order.** The emails say what happened. Only this list shows which payments still have no order right now, which the owner must know before refunding. Neither Stripe nor Studio shows the gap.

Not built:
- **The performance baseline page:** removed. Nobody has to act on it, Vercel Speed Insights already shows real speed, and its data file was never produced.
- **Order list or order detail:** Studio shows orders.
- **Refunds, payment detail, revenue:** the Stripe dashboard does them safely, and money cannot be taken back once moved.
- **Stock or product editing:** Studio does it, and products and checkout stock exclude each other by revision (ADR-002, ADR-003).
- **Email delivery log:** the Resend dashboard shows it.
- **Errors and uptime:** Sentry and Vercel show them.
- **Customer account list:** no owner action needs it.
- **Reminders for unpacked orders:** each order already reached the owner by email, and Studio lists open orders.

## 1. Who can open the admin area
Only the owner, and never by a hint, a sign-in page or a stale copy.

- **Can a signed-out visitor open the admin page?** `entry-signed-out`
  Cannot lie: We ask as nobody; the proof says NO unless the shop answers 'page not found' and asked Stripe and Sanity nothing.
- **Can a signed-in customer open the admin page?** `entry-customer`
  Cannot lie: We made a customer with every safety on except being on the owner list; the proof says NO unless the shop answers 'page not found'.
- **Can the owner open the admin page?** `entry-owner`
  Cannot lie: The same check that turns away the customer and the stranger must let this one account through, so a gate that refuses everyone fails too.
- **Can an account on the owner list open it without two-factor turned on?** `entry-no-2fa`
  Cannot lie: We made the owner's account with two-factor off and everything else right; only that one difference decides.
- **Can an account on the owner list open it before its email is confirmed?** `entry-unverified`
  Cannot lie: We made the owner's account with the email unconfirmed and everything else right; only that one difference decides.
- **Can the owner open it when the sign-in was more than an hour ago?** `entry-stale`
  Cannot lie: We set the sign-in 61 minutes back and 59 minutes back; the proof says NO unless only the 59 opens.
- **Can an account on the owner list open it after a Google sign-in, which skips the two-factor code?** `entry-google`
  Cannot lie: Better Auth asks for the code only on email sign-in (two-factor/index.mjs line 192); we gave the owner's account a Google sign-in and the proof says NO unless the shop refuses it.
- **Can an email that only looks like an owner email get in?** `entry-lookalike`
  Cannot lie: We tried the owner address with letters added before, after and inside the domain, and the real address in capitals with spaces; the proof says NO unless only the real one opens.
- **Can anyone get in when the owner list is empty or not set?** `entry-no-list`
  Cannot lie: We ask as the owner with the list unset, empty and only commas; the proof says NO unless all three are refused.
- **Does a session the owner signed out of keep opening the admin page from the 5-minute cookie copy?** `entry-revoked`
  Cannot lie: Our stand-in sign-in keeps a stale cookie copy the way Better Auth does; the proof says NO unless the shop asks for the fresh record and is refused.
- **Does every admin page check the owner on the server first, with no admin route, server action, browser-only page or address-bar input?** `entry-every-page`
  Cannot lie: The proof reads every file under app/(admin); it is first shown a page without the check and must call it NO.
- **Does every admin data reader refuse a stranger before it asks Stripe or Sanity anything?** `entry-every-reader`
  Cannot lie: The proof calls every reader the admin area exports as a stranger and counts calls to the stand-in Stripe and Sanity; one call is a NO.
- **Can someone make up a sign-in cookie and pass as the owner?** `entry-forged`
  Cannot happen, because the owner check reads the session fresh from the sign-in database (entry-revoked) and a made-up cookie matches no session there.
- **Can a customer change their email to the owner's and get in?** `entry-email-change`
  Cannot happen, because Better Auth sends the change link to the new inbox, which is the owner's (update-user.mjs lines 426-470), and an unconfirmed email is refused anyway (entry-unverified).
- **Can the owner skip the two-factor code on a trusted device?** `entry-trusted-device`
  Out of scope, because that device passed two-factor within the last 30 days and holds Better Auth's signed trust cookie, so it counts as the second factor.
- **Can a non-owner use the shop's /studio page to see orders?** `entry-studio`
  Out of scope, because Studio signs in with Sanity's own accounts and reads data only with that person's Sanity rights; it is not the admin area.

## 2. Caches, logs and links
Private data stays where it is.

- **Can a shared cache keep an admin page and hand it to someone else?** `cache-admin`
  Cannot lie: The proof runs Next's own path matcher over the real next.config.ts rules, in Next's order, for every admin address; anything but private, no-store is a NO.
- **Does any admin or owner-email code write to the logs?** `leak-log`
  Cannot lie: The proof reads every admin and owner-email file for a log call; it is first shown one with a log call and must call it NO.
- **Can private data leak through an admin address or an owner email link?** `leak-url`
  Cannot happen, because admin pages read nothing from the address bar (entry-every-page) and owner emails link only by order number and payment number (leak-email).
- **Can an admin error message show private data to the browser?** `leak-error`
  Out of scope, because Next.js shows the browser only an error code in production, and the admin area writes no error text of its own.

## 3. Money with no order
A payment that has no order reaches the owner, and the admin page shows which are still open.

- **When a payment goes through but its order cannot be made, does the owner get an email?** `pay-no-order-email`
  Cannot lie: We make the stand-in order book refuse the order; the proof says NO unless one email naming that payment reaches the owner list and Stripe is told 'not done'.
- **When Stripe retries that same payment five times, does the owner get one email, not five?** `pay-no-order-once`
  Cannot lie: Our stand-in Resend sends each key once, as Resend does for 24 hours; we count the emails that really went out.
- **Does the admin list show exactly the paid payments that have no order, including ones past Stripe's first page?** `pay-list`
  Cannot lie: We planted one missing order among 150 payments, past the first 100, beside failed, cancelled and still-processing ones; the proof says NO unless the list shows that one and nothing else.
- **After the owner refunds a payment that had no order, does the admin list stop showing it?** `pay-list-refunded`
  Cannot lie: We gave one paid payment with no order a full refund in the stand-in Stripe, which keeps its status succeeded the way Stripe does; the proof says NO if the list still shows it.
- **After the owner refunds a payment that had no order, do the daily emails about it stop?** `pay-no-order-after-refund`
  Blocked, because the daily sweep (checkout, sweepPaidPayments.ts) retries every payment whose status is succeeded, and a refunded payment keeps that status; the fix is for the sweep to skip refunded payments, logged in sanglogium-todo.md under checkout.
- **Does the admin list carry a customer's name, email, address or phone?** `leak-list`
  Cannot lie: We planted made-up customer details in every stand-in payment; the proof searches the whole list for each of them.
- **Does the admin area ever ask Stripe or Sanity to change anything?** `write-admin`
  Cannot lie: Our stand-in Stripe and Sanity record every call; the proof lists any call that is not a read.
- **Can an order exist without a payment, or for a different amount?** `pay-order-without-payment`
  Cannot happen, because an order is made only from a payment Stripe confirms (signed webhook, or the shop asks Stripe directly) and its total is copied from that payment (createOrderFromPayment.ts).
- **Can a refunded or disputed payment leave its order looking open?** `pay-refund-dispute`
  Out of scope, because the owner makes refunds in Stripe themselves and Stripe emails the account about every dispute.

## 4. Orders to pack, and orders short of stock
Every paid order reaches the owner once, with any missing units named.

- **When a paid order is placed, does the owner get an email to pack it in that same moment?** `pack-email`
  Cannot lie: The proof counts emails sent during the very call that places the order; none, or one only later, is a NO.
- **When a paid order is short of stock, does the owner's email say which product and how many are missing?** `stock-short`
  Cannot lie: One order is two units short and one is whole; the proof says NO unless only the short one says missing, with the right product and count, and the order read asks Sanity for the units taken.
- **When the customer's return and Stripe's webhook both handle one payment, does the owner get one email, not two?** `pack-once`
  Cannot lie: We run both paths for one payment and count the emails that really went out.
- **When the owner email fails to send, is it sent on Stripe's next try?** `pack-retry`
  Cannot lie: Our stand-in Resend refuses the first send; the proof says NO unless the webhook answers 'not done' and the next delivery sends it.
- **With no owner address set, does the shop tell Stripe the payment is not fully handled?** `pack-no-owner`
  Cannot lie: We unset the list; the proof says NO unless the webhook answers 'not done' while the order still exists.
- **When the daily sweep passes an order placed two days ago, does the owner get no second email, while an order the sweep places now gets one?** `pack-sweep-repeat`
  Cannot lie: We put an order placed 48 hours ago in the book and run the shop's real daily sweep over it and over a payment with no order yet; the proof says NO unless only the new one sends an email.
- **Does an owner email carry a customer's name, email, address or phone?** `leak-email`
  Cannot lie: We planted made-up customer details in the orders and payments; the proof searches every email that went out for each of them.
- **Does an owner email change any product, order or payment?** `write-notice`
  Cannot lie: Our stand-in order book and Stripe record every call; apart from checkout's own one order write, any write is a NO.
- **Can a paid order wait unpacked for days after the email?** `pack-ignored`
  Out of scope, because packing is a person's job once they are told, and Studio lists every open order.
- **Can owner email stop silently because the email service key is missing?** `pack-no-email-key`
  Cannot happen unnoticed, because without the key no account can confirm its email, the owner's included, so nobody can even sign in.

## 5. It stays that way
A change that breaks any line above is caught.

- **Does every change to the shop run all of these proofs automatically?** `auto-run`
  Cannot lie: The proof reads the GitHub workflow and says NO unless it runs this exact command on every pull request and every push to main.
This book matches the run's situation list item for item: 40 situations, 29 answered by a proof line (the proof prints exactly these 29) and 11 answered in words. A NO, a new situation or a changed question must change both.
