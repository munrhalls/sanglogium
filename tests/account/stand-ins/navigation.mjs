// Next's navigation entry, stood in. On the server, redirect() and notFound()
// stop the page the way Next does: by throwing. The proof reads what was thrown.
// In the stand-in browser, the hooks read the page the browser is on.

export function redirect(url) {
  const error = new Error(`NEXT_REDIRECT ${url}`)
  error.redirectTo = url
  throw error
}

export function permanentRedirect(url) {
  redirect(url)
}

export function notFound() {
  const error = new Error('NEXT_NOT_FOUND')
  error.notFound = true
  throw error
}

let page = null

// The browser stand-in sets the page before it renders a screen.
export function setPage(next) {
  page = next
}

function current() {
  if (!page) {
    const error = new Error('a screen asked for the page before the proof opened one')
    error.proofBroken = true
    throw error
  }
  return page
}

export function useRouter() {
  return current().router
}

export function useSearchParams() {
  return current().searchParams
}

export function usePathname() {
  return current().pathname
}
