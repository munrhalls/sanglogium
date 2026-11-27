// next/link, stood in: a plain anchor. Where a link points is what matters here, not prefetching.
import { createElement } from 'react'

export default function Link({ href, children, prefetch, replace, scroll, shallow, passHref, legacyBehavior, ...rest }) {
  return createElement('a', { href: typeof href === 'string' ? href : href?.pathname ?? '', ...rest }, children)
}
