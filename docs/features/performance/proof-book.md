# Performance proof book

Scope: how fast the home page, the product lists and a product page load on a phone and on a computer. Checkout, account, search and filters are out.

## The one command

`node tests/performance/proof.mjs`

It asks every question below and prints YES, NO or BLOCKED for each, with the numbers it saw.

- `--exact` asks only the counting questions (fast, no PageSpeed).
- `--local` builds this checkout once, serves it on this computer, and asks the counting questions of that copy. Use it for code that is not on the live shop yet.
- `--only <id,id>` asks only the named questions.

The questions live in [questions.json](../../../tests/performance/questions.json).

## Green means Google's lines

- PageSpeed score 90 or more.
- Main picture shown (LCP) within 2.5 s.
- Busy time while loading (TBT) 200 ms or less. This is the lab's stand-in for how fast a tap is answered.
- Layout jumps (CLS) 0.1 or less.

Phone and computer are judged apart, never averaged.

## How it measures: one clock

- **Timing comes only from Google PageSpeed** on the live shop, the same tool Google shows the public.
  - Phone means PageSpeed's phone: a mid-range phone (moto g power) on slow 4G (150 ms per round trip, 1.6 Mbps), with a CPU 4 times slower than a desktop's.
  - Computer means PageSpeed's desktop.
- **One run proves nothing.** Two full sets of 5 runs of the same build disagreed on 6 of the 32 timing lines.
  - Each call makes 5 runs per page and device, at least 5 minutes apart.
  - A repeat with the same timestamp is PageSpeed's cache, so it is thrown away.
  - Every run of one deployed build is kept, in `~/.cache/sanglogium-performance/`.
  - A line is YES only if every kept run passes. "On the line" means the middle run passes but at least one run fails, so it is a NO.
  - The printout shows each line as lowest / middle / highest.
- **Counting questions read the page exactly as the shop sends it to a phone** and count things in it. The same page gives the same count every time.
- **This laptop is not a phone.** With the same settings it read 2.8 s where PageSpeed read 6.1 s. `--local` prints a laptop band only to compare before and after on this one machine. It is never a verdict.

## The pages

| Name | Address |
|---|---|
| home | `/` |
| all products | `/products` |
| headphones list | `/products/headphones` |
| product page | `/product/audioquest-dragontail-carbon-usb-a-to-c-adapter` |

## The story: what makes a page slow, and which question answers it

A phone on slow 4G has one thin line, and every file shares it. A page is fast when it sends few bytes, makes few round trips, gives the line to the main picture first, and keeps the phone's slow CPU free. Each question below covers one way that can go wrong.

### 1. Bytes on the wire

| Question | Why it cannot lie |
|---|---|
| **no-editing-tools**: Does each page load without Sanity's content-editing tools and data client (57 KB) that visitors never use? | It downloads exactly the scripts the page lists and searches them for code that only the editing tools contain. |
| **no-basket-validator**: Does each page load without the zod checking library (46 KB) that only checks the saved basket? | It downloads exactly the scripts the page lists and searches them for code that only zod contains. |
| **home-ring-picture**: Does the home page load without first downloading the 180 KB decorative ring picture that sits below the top picture? | It reads the markup the page sends and counts the sections that paint the ring. |
| **pictures-right-format**: Are product pictures offered in several sizes and in modern formats (AVIF/WebP)? | It reads every picture tag the page sends. A picture without a list of sizes, or a Sanity address without `auto=format`, makes it say NO. |

### 2. Round trips

| Question | Why it cannot lie |
|---|---|
| **no-redirect**: Does a visitor who opens sanglogium.com (the address the shop gives Google) get the page without first being sent to www.sanglogium.com? | It asks the bare address and reads the reply status. Anything but the page itself (200) makes it say NO. |
| **pages-cache**: Are the home page and both list pages served from Vercel's cache? | It asks the live shop twice and reads the cache answer that Vercel itself writes on the reply. |
| **product-page-cache**: Is the product page served from Vercel's cache instead of being built again for every visitor? | It asks the live shop twice and reads the cache answer that Vercel itself writes on the reply. |
| **returning-visitor-ring**: Does a returning visitor reuse the ring picture from the browser cache instead of downloading it again after 5 minutes? | It asks for the picture again with the tag a browser keeps. Vercel's "304 Not Modified" means no bytes are sent again; anything else makes it say NO. |

### 3. One shared line: the main picture goes first

| Question | Why it cannot lie |
|---|---|
| **home-pictures-first**: Does the home page ask only for the big top picture while it loads, and leave the pictures further down until the visitor scrolls? | It reads the page as sent and counts the pictures preloaded or loaded at once. |
| **main-picture-priority**: Does the product page ask for its main photo at high priority, ahead of scripts? | It reads the page as sent and checks the main photo's priority mark. |
| **list-picture-priority**: Do the list pages ask for their first row of product pictures at high priority? | It reads both list pages as sent and checks the priority mark on the first 4 pictures. |

### 4. Work before the first paint

| Question | Why it cannot lie |
|---|---|
| **nothing-blocks-paint**: Can each page paint without waiting for any separate stylesheet or script file? | It reads the page head as sent. A stylesheet link or a plain (not async) script file there makes it say NO. |
| **main-picture-not-hidden**: Does each page send its main picture ready to show, instead of inside a hidden block that a script reveals later? | It reads each page as sent and finds whether the main picture sits inside a hidden block (`<div hidden id="S:…">`) that a later script call shows. |
| **text-before-font**: Does the text show at once in a fallback font, without waiting for the shop's font file? | It reads the font rules in the stylesheet the page sends. A rule that downloads a font file without `font-display: swap` makes it say NO. |
| **helpers-after-paint**: Do Vercel Speed Insights and the shop's own speed reporter start only after the page has shown? | It reads the page as sent and the reporter's code. Either one in the page head, or the reporter starting before the page is on screen, makes it say NO. |

### 5. Third-party scripts

| Question | Why it cannot lie |
|---|---|
| **google-analytics-timing**: Does Google Analytics (179 KB) wait until the page has shown before it downloads? | It reads the page head and scripts as sent. The analytics script there makes it say NO. |
| **error-monitor-timing**: Does the Sentry error monitor (121 KB) load without competing with the page's first paint? | It downloads exactly the scripts the page lists and searches them for Sentry's code. |

### 6. Work on every tap: out of scope

**taps**: Does the page answer every tap within 200 ms on a real phone? This is out of scope, because the owner made busy time while loading (TBT, below) the lab's line for taps. Real taps show only in real visitors' data.

### 7. Real visitors: cannot be measured here

**real-user-data**: Do real visitors' phones report green Core Web Vitals? This cannot be measured here. The Chrome UX Report API is turned off for the key's project, and Vercel Speed Insights data sits in the Vercel dashboard, which this lab cannot read. No field result is claimed.

### 8. The result: 32 timing lines

Each page and each device gets the same four questions. The id is `<page>-<device>-<line>`:
- page: `home`, `all` (all products), `category` (headphones list), `product`;
- device: `phone` ("on a mid-range phone on slow 4G") or `computer` ("on a desktop computer on a fast line");
- line: one of the four below.

| Line | Question (for the home page on a phone) |
|---|---|
| score | Does the home page score 90 or more on PageSpeed on a mid-range phone on slow 4G? |
| lcp | Does the home page show its main picture within 2.5 s on a mid-range phone on slow 4G? |
| tbt | Is the home page too busy to answer a tap for 200 ms or less in total while it loads on a mid-range phone on slow 4G? |
| cls | Does the home page jump under the reader by 0.1 or less (Google's layout-shift score) on a mid-range phone on slow 4G? |

Why they cannot lie: Google's own PageSpeed servers load the live page, cached repeats are thrown away, and one failing run among all the runs of a build makes the line NO. One lucky run cannot pass it.
