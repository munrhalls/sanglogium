"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

/* The blurred state ships in the server HTML (`spoc-reveal`), so the real
   bitmap is already blurred the first frame the browser paints it — nothing
   added after load could create a fade, the frame has painted. onLoad only
   ends the effect. One path for every tile: next/image fires onLoad for
   cached images too, so there is no cache-vs-fresh branch. */
export function RevealImage(props: ImageProps) {
  const [done, setDone] = useState(false);

  const className = [props.className, "spoc-reveal", done && "spoc-reveal-done"]
    .filter(Boolean)
    .join(" ");

  return (
    <Image
      {...props}
      onLoad={() => setDone(true)}
      className={className}
      alt={props.alt}
    />
  );
}
