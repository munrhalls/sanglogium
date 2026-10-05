"use client";

import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";
import { cn } from "@/platform/utils/tailwind";

interface SearchInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "role"> {
  /** Is the suggestion popup visible? */
  expanded: boolean;
  /** Id of the rendered listbox. Pass it only while the listbox exists in the DOM. */
  listboxId?: string;
  /** Id of the highlighted option (aria-activedescendant). */
  activeOptionId?: string;
}

/**
 * The one search <input>, used by both the desktop field and the mobile sheet so
 * the combobox semantics and the mobile-keyboard attributes cannot drift apart:
 * a "search" key on the keyboard, no autocorrect / auto-capitalisation (model
 * names like "HD800S" must not be "fixed"), no native clear button (we draw ours).
 */
export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  function SearchInput(
    { expanded, listboxId, activeOptionId, className, ...rest },
    ref
  ) {
    return (
      <input
        ref={ref}
        type="search"
        role="combobox"
        name="q"
        aria-label="Search products"
        aria-autocomplete="list"
        aria-haspopup="listbox"
        aria-expanded={expanded}
        aria-controls={listboxId}
        aria-activedescendant={activeOptionId}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        enterKeyHint="search"
        inputMode="search"
        maxLength={500}
        className={cn(
          // h-full: the whole 44px row is the tap target, not just the text line.
          "h-full w-full min-w-0 appearance-none border-none bg-transparent outline-none",
          "text-body text-brand-700 transition-colors duration-300",
          "selection:bg-brand-700 selection:text-brand-400",
          "placeholder:text-secondary-700",
          "[&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none",
          className
        )}
        {...rest}
      />
    );
  }
);
