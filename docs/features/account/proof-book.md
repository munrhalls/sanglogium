[Back: User accounts](README.md)
# Account proof book
Scope: who can sign in as whom, who sees and changes what, and what happens when something fails, from sign-up to account deletion. Looks and wording are outside it.

## The one command
`npm run proof:account`
- It prints one line per question below, then one last line. `PASS` means every line gave the safe answer. `N NO` means N lines did not; each NO line says what happened instead. `BLOCKED` lines wait on the owner and say why. `proof broken` means a proof itself cannot be trusted, and nothing it printed counts. Exit codes 0, 1 and 2.
- It runs on every pull request and every push to main (GitHub check "Account proof"), twice, and the two outputs must be identical.
- It calls the shop's own sign-in and account code. Only the sign-in database, Sanity, the email service, Google and the browser are stand-ins on this machine. Nothing leaves the machine, and the clock moves only when a proof moves it.

## Why a PASS can be trusted
- Before the shop is asked anything, the stand-in Sanity must show it keeps Sanity's rules: filters pick the right document, patches land where they aim, and a write of several changes lands whole or not at all. If not, the run stops as broken.
- People are made the way a person does it: sign up, open the link the shop emailed, sign in. Nothing writes accounts straight into a store.
- Each question has a control: the allowed version of the same act works in the same run. So a refusal can only come from the rule being tested, and a broken control stops the run as broken instead of passing.
- Any reach for the real network stops the run as broken.
- This book has to list every printed question with its proof file, and nothing else. A missing or extra one stops the run as broken.

## 1. Getting in
Can a person make an account, prove the email is theirs and sign in, while nobody else can do it as them?

- **Can Anna create an account, open the link in her own inbox, sign in with her password, and is a wrong password refused?** Safe answer: Yes.
  Cannot lie: the proof takes the link from the stand-in inbox addressed to Anna, signs in with the password she chose, and tries one wrong letter in the same run.
  Proof: `tests/account/signup-verify-signin.test.ts`
- **If someone signs up with Anna's email, are they refused at sign-in, even with the right password, until the link sent to Anna's inbox is opened?** Safe answer: Yes.
  Cannot lie: the sign-up and password are real; after the proof opens the inbox link the same password gets in, so the refusal came from the missing link.
  Proof: `tests/account/unverified-refused.test.ts`
- **If Anna forgets her password, can she set a new one from the link in her inbox, sign in with it, and is the old one refused?** Safe answer: Yes.
  Cannot lie: the proof uses only the link the stand-in inbox received and tries both passwords afterwards.
  Proof: `tests/account/reset-works.test.ts`
- **If two sign-ups for Anna's email arrive at the same moment, is only one account made?** Safe answer: Yes.
  Cannot lie: both sign-ups are sent before either answer is read, and the proof counts accounts in the stand-in database.
  Proof: `tests/account/same-email-twice.test.ts`
- **If Anna turned two-factor on, is her password alone refused, while her password plus her code gets in?** Safe answer: Yes.
  Cannot lie: the proof makes the code from the same key Anna's phone would hold, and the same password gets in once the code is added.
  Proof: `tests/account/two-factor-required.test.ts`
- **Does the sign-in database keep Anna's password or her two-factor key anywhere in readable form?** Safe answer: No.
  Cannot lie: the proof searches every row of the stand-in database for the exact password and key it just used, and finds Anna's email there as a control.
  Proof: `tests/account/secrets-unreadable.test.ts`
- **Is Anna's session cookie hidden from page scripts, sent only over https, and kept from other sites' requests?** Safe answer: Yes.
  Cannot lie: the proof reads the Set-Cookie line the shop really sends at sign-in on its https address.
  Proof: `tests/account/cookie-safe.test.ts`
- **Can another website make Anna's signed-in browser change her email or delete her account?** Safe answer: No.
  Cannot lie: the proof sends Anna's real cookie with a foreign Origin; the same request from the shop's own origin is accepted, so a refusal comes from the origin.
  Proof: `tests/account/cross-site.test.ts`

## 2. Links and codes sent by email
Email is slow, doubled, lost or read by the wrong person. Does every emailed link still behave?

- **Can someone make a working verification link for Anna's email without the shop's secret?** Safe answer: No.
  Cannot lie: the forged link is built exactly like the shop's but signed with another secret; the shop's own link works in the same run.
  Proof: `tests/account/verify-link-forged.test.ts`
- **Does Anna's verification link stop working after the hour her email promises?** Safe answer: Yes.
  Cannot lie: at 59 minutes a second link of the same kind still works; at 61 minutes the first is refused.
  Proof: `tests/account/verify-link-late.test.ts`
- **If Anna gets her verification email twice and opens both links, does she end up with one working account?** Safe answer: Yes.
  Cannot lie: both links come from the stand-in inbox; the proof counts accounts and signs in afterwards.
  Proof: `tests/account/verify-email-twice.test.ts`
- **If the email service is down when Anna signs up, can she later get a new link and finish?** Safe answer: Yes.
  Cannot lie: the stand-in email service fails the first send for real, and the proof finishes using only what the sign-in screen offers.
  Proof: `tests/account/verify-email-never.test.ts`
- **Can a password-reset link be used a second time?** Safe answer: No.
  Cannot lie: the first use works and changes the password; the second try uses the identical link.
  Proof: `tests/account/reset-link-once.test.ts`
- **Does a password-reset link stop working after the hour the email promises?** Safe answer: Yes.
  Cannot lie: at 59 minutes a second link works; at 61 minutes the first is refused.
  Proof: `tests/account/reset-link-late.test.ts`
- **After Anna sets a new password with one reset link, does every other reset link she was sent stop working?** Safe answer: Yes.
  Cannot lie: both links are real and unexpired; the proof checks the older one still worked before the reset.
  Proof: `tests/account/reset-older-links.test.ts`
- **From one place, can someone make the shop send Anna more than 3 password-reset emails in an hour?** Safe answer: No.
  Cannot lie: the proof asks five times from one address, one minute apart, and counts the reset emails in Anna's stand-in inbox.
  Proof: `tests/account/reset-mail-limit.test.ts`
- **From one place, can someone make the shop send one inbox more than 3 verification emails in an hour, by asking for a new link or by changing an email to that address?** Safe answer: No.
  Cannot lie: the proof asks five times, one minute apart, from one address for each way, and counts the emails in the stand-in inbox.
  Proof: `tests/account/verify-mail-limit.test.ts`
- **Can someone make the shop email Anna a link that leads to another website?** Safe answer: No.
  Cannot lie: the proof asks for every kind of email with a foreign Host header and foreign return addresses, then reads every link in the stand-in inbox.
  Proof: `tests/account/links-point-home.test.ts`
- **If Anna mistypes her new email, can the stranger who owns that address get into her account by opening the link?** Safe answer: No.
  Cannot lie: sam opens the real link from his own inbox in his own browser; Anna opening it in hers still changes her email.
  Proof: `tests/account/email-typo.test.ts`
- **Can a link to the shop send Anna to another website after she signs in, verifies or deletes?** Safe answer: No.
  Cannot lie: the proof runs the real sign-in form in a stand-in browser and records where it goes; a normal shop return address is followed in the same run.
  Proof: `tests/account/no-foreign-redirect.test.ts`

## 3. Whether an account exists
Can a stranger learn that an email has an account here?

- **Do sign-up, sign-in, forgot-password, resend-link and change-email give the same answer whether or not the email has an account?** Safe answer: Yes.
  Cannot lie: each pair of requests differs only in the email, and the proof compares the full status and body.
  Proof: `tests/account/same-answer.test.ts`
- **Do those same screens take about the same time whether or not the email has an account?** Safe answer: Yes.
  Cannot lie: the stand-in email service, Sanity and sign-in database answer as slowly as real ones (300 ms, 150 ms and 20 ms a statement), and the proof compares the middle of five timings with a wide margin.
  Proof: `tests/account/same-time.test.ts`

## 4. Guessing
Can someone keep guessing a password or a code?

- **From one place, is the sixth password try in 15 minutes and the fourth two-factor try in 10 seconds refused, even when it is right?** Safe answer: Yes.
  Cannot lie: the last try uses the right password or code, so a refusal can only come from the limit.
  Proof: `tests/account/guess-one-copy.test.ts`
- **Is the number of guesses at Anna's password limited across all copies of the shop's server, not just one?** Safe answer: Yes.
  Cannot lie: a count kept in one server copy's memory cannot be seen by another copy; the proof reads which kind of count the shop's own sign-in code keeps.
  Proof: `tests/account/guess-all-copies.test.ts`
  Blocked, waiting on the owner: guesses are counted in each server copy's own memory; one shared count needs a shared store, such as a new table in the real sign-in database, which only the owner may add.
- **Can one of Anna's two-factor backup codes be used twice?** Safe answer: No.
  Cannot lie: the first use gets in; the second try uses the identical code.
  Proof: `tests/account/backup-code-once.test.ts`

## 5. Sessions and a recent sign-in
Does a session end when it should, and do risky actions need a sign-in from the last 5 minutes?

- **After Anna signs out, does a copy of her old session cookie stop opening her account at once?** Safe answer: Yes.
  Cannot lie: tom's copy opens Anna's account before she signs out, so a refusal afterwards comes from the sign-out.
  Proof: `tests/account/signout-ends.test.ts`
- **After Anna resets her password or signs out everywhere, does Tom's copy of her session stop opening her account at once?** Safe answer: Yes.
  Cannot lie: tom's copy opens Anna's orders a moment before; the proof asks again right after, with no clock change.
  Proof: `tests/account/revoked-sessions.test.ts`
- **After Anna changes her password on the account page, does Tom's copy of her session stop opening her account at once?** Safe answer: Yes.
  Cannot lie: tom's copy opens her account a moment before; the change is made through the real account page in a stand-in browser.
  Proof: `tests/account/password-change-ends-others.test.ts`
- **After a week with no visits, does Anna's session stop opening her account?** Safe answer: Yes.
  Cannot lie: the proof clock moves 7 days and 1 minute; at 6 days and 23 hours the same session still works.
  Proof: `tests/account/session-expires.test.ts`
- **Does a 'recent sign-in' count from when Anna typed her password, not from her last page visit?** Safe answer: Yes.
  Cannot lie: anna keeps browsing for 6 minutes, which renews the session; one minute after a sign-in the same action is accepted.
  Proof: `tests/account/fresh-from-signin.test.ts`
- **Can a session that signed in more than 5 minutes ago change Anna's email?** Safe answer: No.
  Cannot lie: at 4 minutes the same request is accepted, so a refusal at 6 comes from age.
  Proof: `tests/account/stale-change-email.test.ts`
- **Can a session that signed in more than 5 minutes ago change Anna's password, even with her current password?** Safe answer: No.
  Cannot lie: at 4 minutes the same request is accepted, so a refusal at 6 comes from age.
  Proof: `tests/account/stale-change-password.test.ts`
- **Can a session that signed in more than 5 minutes ago turn Anna's two-factor on or off?** Safe answer: No.
  Cannot lie: at 4 minutes the same request is accepted, so a refusal at 6 comes from age.
  Proof: `tests/account/stale-two-factor.test.ts`
- **Can a session that signed in more than 5 minutes ago start or finish deleting Anna's account?** Safe answer: No.
  Cannot lie: at 4 minutes the same request is accepted, so a refusal at 6 comes from age.
  Proof: `tests/account/stale-delete.test.ts`
- **Right after signing in, can Anna change her password, change her email, turn two-factor on and delete her account from the account page?** Safe answer: Yes.
  Cannot lie: the proof runs the real account page sections in a stand-in browser and clicks their buttons; it checks each change landed in the stand-in database.
  Proof: `tests/account/risky-page-works.test.ts`

## 6. Only your own data
Does a signed-in person see and change only what is theirs?

- **If Anna is signed in, can she open Ben's order by typing its number?** Safe answer: No.
  Cannot lie: ben's order really exists in the test, and the proof says NO to Anna and YES to Ben.
  Proof: `tests/account/order-by-number.test.ts`
- **Does Anna's order list show all of her orders and none of Ben's?** Safe answer: Yes.
  Cannot lie: both have real orders in the stand-in Sanity; the proof compares order numbers both ways.
  Proof: `tests/account/order-list.test.ts`
- **Can Anna change or remove Ben's saved address?** Safe answer: No.
  Cannot lie: the proof uses Ben's real address key; Ben removing it himself works in the same run.
  Proof: `tests/account/address-others.test.ts`
- **Can Anna change Ben's name, marketing choice or wishlist?** Safe answer: No.
  Cannot lie: anna's own changes land in her profile in the same run, and Ben's profile is compared before and after.
  Proof: `tests/account/profile-others.test.ts`
- **Without signing in, can anyone get an export, an order, an address list, a wishlist or change any of them?** Safe answer: No.
  Cannot lie: the same calls with Anna's session return her data, so a refusal comes from the missing sign-in.
  Proof: `tests/account/signed-out-nothing.test.ts`
- **Can Anna pull Ben's guest orders into her account without opening Ben's inbox?** Safe answer: No.
  Cannot lie: ben's guest order really exists under his email; Ben verifying that email pulls it into his account in the same run.
  Proof: `tests/account/guest-orders-claim.test.ts`
- **Does Anna's data export hold her profile and her orders, and nothing of Ben's?** Safe answer: Yes.
  Cannot lie: ben has a profile and orders in the same stand-in Sanity; the proof searches the export for each of his values.
  Proof: `tests/account/export-only-theirs.test.ts`
- **Does Anna's export also hold what the sign-in database keeps about her (her account, sign-in methods and devices), without any secret?** Safe answer: Yes.
  Cannot lie: the proof reads Anna's rows from the stand-in sign-in database and looks for each in the export, and looks for every secret too.
  Proof: `tests/account/export-complete.test.ts`

## 7. Two stores that must agree
The sign-in database and Sanity are written one after the other. Do they still agree when one write fails?

- **If Sanity is down when Anna signs up, does she have exactly one profile once she opens her account after Sanity is back?** Safe answer: Yes.
  Cannot lie: the stand-in Sanity refuses the real write during sign-up, and the proof counts profiles afterwards.
  Proof: `tests/account/signup-sanity-down.test.ts`
- **If Anna opens two account pages at the same moment while her profile is missing, does she end up with exactly one profile?** Safe answer: Yes.
  Cannot lie: both page loads start before either finishes, and the proof counts profiles with Anna's account number.
  Proof: `tests/account/parallel-heal.test.ts`
- **If Sanity is down when Anna's new email is confirmed, does Sanity catch up with her new email once it is back?** Safe answer: Yes.
  Cannot lie: the stand-in Sanity refuses the real write, and the proof compares both stores after Anna's next visit.
  Proof: `tests/account/email-change-sanity-down.test.ts`

## 8. Deleting an account
Deletion cannot be undone. Is it confirmed, complete, and kind to orders still on their way?

- **Does deleting Anna's account wait for a link opened from her own inbox, and does that email say it cannot be undone?** Safe answer: Yes.
  Cannot lie: the account still exists after the request; it is gone only after the proof opens the inbox link.
  Proof: `tests/account/delete-confirm-inbox.test.ts`
- **Does the delete link stop working after the hour the email promises?** Safe answer: Yes.
  Cannot lie: the proof reads the promise from the real email text; at 59 minutes a second link still works.
  Proof: `tests/account/delete-link-lifetime.test.ts`
- **Can anyone other than signed-in Anna use her delete link?** Safe answer: No.
  Cannot lie: the link is real and unexpired; Anna using it afterwards does delete her account.
  Proof: `tests/account/delete-link-other.test.ts`
- **If Anna has an order still being fulfilled, is her deletion refused and her account left whole?** Safe answer: Yes.
  Cannot lie: each open status is tried; with only delivered orders the same deletion goes through.
  Proof: `tests/account/delete-open-order.test.ts`
- **After Anna's account is deleted, does every order she placed still exist in the shop, with nothing pointing to her old account?** Safe answer: Yes.
  Cannot lie: the proof records every order before the deletion and finds each one afterwards.
  Proof: `tests/account/delete-keeps-orders.test.ts`
- **After Anna's account is deleted, is anything of hers left in either store, apart from her orders?** Safe answer: No.
  Cannot lie: the proof searches every row and document for Anna's account number, email and name; Ben's remain as a control.
  Proof: `tests/account/delete-nothing-left.test.ts`
- **After Anna's account is deleted, can her old password, session or two-factor code still get in?** Safe answer: No.
  Cannot lie: each worked a moment before the deletion.
  Proof: `tests/account/delete-no-way-in.test.ts`
- **If Sanity fails while Anna's account is being deleted, can she finish the deletion and leave nothing of hers in either store?** Safe answer: Yes.
  Cannot lie: the stand-in Sanity refuses the real write mid-deletion, and the proof finishes using only what Anna can do herself.
  Proof: `tests/account/delete-sanity-down.test.ts`
- **If the sign-in database fails while Anna's account is being deleted, can she finish the deletion by trying again?** Safe answer: Yes.
  Cannot lie: the stand-in database refuses the real delete once, and the proof checks both stores after the retry.
  Proof: `tests/account/delete-db-down.test.ts`

## 9. Google sign-in
Can a Google account be used to get into someone else's account?

- **If Sam signs up with Anna's email and never verifies, is Sam still kept out after Anna signs in with Google?** Safe answer: Yes.
  Cannot lie: sam's password is real, and the proof tries it after Anna's Google sign-in through a stand-in Google.
  Proof: `tests/account/google-squatter.test.ts`
- **After Sam signed up with Anna's email first, can Anna still get into an account under her email that Sam cannot enter?** Safe answer: Yes.
  Cannot lie: sam's sign-up is real; the proof uses only Anna's inbox and then tries Sam's password.
  Proof: `tests/account/google-squatter-recover.test.ts`
- **Can Tom, holding a copy of Anna's session, add his own Google account to hers so he can sign in to it later?** Safe answer: No.
  Cannot lie: tom's Google sign-in really happens through the stand-in Google; Anna adding her own Google account in the same run works.
  Proof: `tests/account/google-add-other.test.ts`

## 10. It stays that way
Is a change that breaks any of this caught automatically?

- **Does GitHub run every account proof on every change and mark the change failed on any NO?** Safe answer: Yes.
  Cannot lie: the proof reads the workflow file GitHub runs and finds the exact command the proof book names.
  Proof: `tests/account/runs-on-every-change.test.ts`

## Situations answered without a proof
- Someone plants a session cookie in Anna's browser before she signs in. Cannot happen, because signing in always makes a new session key and sets it in her browser.
- Tom copies the cookie that lets Anna's browser skip the two-factor code, and later learns her new password. Out of scope, because it needs both a copy of her browser's cookies and her current password, and two-factor is there to stop a password alone.
- A reset link sent to Anna is used on Ben's account. Cannot happen, because the link holds only a random code and the shop looks up whose code it is, so there is no account in the link to swap.
- Someone guesses a reset, delete, session or verification code. Cannot happen, because each is 24 or more random letters and digits or signed with the shop's secret, and guessing one would take longer than the age of the universe at any speed.
- An order of Anna's is paid at the same moment her account is deleted. Cannot lose the order, because deletion never removes an order document; it only removes the account number, so a new order is kept either way.
- Anna edits and removes the same address from two tabs at once. Cannot harm anyone, because each change is one write to Anna's own profile and the later one wins.
- Anna's order is filed under someone else's account. Cannot happen, because checkout takes the account number from the server's session, never from the page.
- Another website makes Anna's browser run one of the shop's account actions. Cannot happen, because Next.js refuses an action whose Origin header is not the shop's own host (node_modules/next/dist/server/app-render/action-handler.js).
- Tom sees Anna's two-factor code over her shoulder and uses it in the same 30 seconds. Out of scope, because it needs Anna's password as well, and the code dies within 30 seconds.
- Someone copies the whole sign-in database. Out of scope, because that is the database host's security; passwords and two-factor keys in it stay unreadable (proof secrets-unreadable).
- Sam signs up with Anna's email and Anna herself opens the link she never asked for. Out of scope, because once Anna confirms from her own inbox the shop cannot tell her apart from the person who asked.
- Someone takes over Anna's inbox or her Google account. Out of scope, because for the shop whoever holds Anna's inbox or Google account is Anna.
- Someone with Sanity Studio or host access reads customer data. Out of scope, because those are the owner's own tools and logins.
