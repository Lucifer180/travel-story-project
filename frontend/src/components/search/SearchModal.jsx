import { MagnifyingGlass, Plus, X } from "@phosphor-icons/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "../../lib/utils";

/**
 * Search Modal
 *
 * A minimalist command-palette panel: a search bar, the keywords being
 * searched for as removable chips, clickable keyword suggestions, result rows
 * with matched keywords highlighted and per-row actions, and a quick-actions
 * list.
 *
 * Ported from the "CodeGrid Modern Minimalist Search Modal". The query is
 * controlled by the parent, which also decides what the results are (they
 * usually come from the server), so this component only renders.
 *
 * Shapes:
 *   keywords:     string[]                       chips under "I'm looking for..."
 *   suggestions:  { label, icon? }[]              chips that add a keyword
 *   results:      { id, name, meta?, snippet?, avatar?, actions?: { icon, label, onClick }[] }[]
 *   quickActions: { label, icon?, onClick }[]
 */

const IS_MAC = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Wraps every occurrence of any keyword in <mark>.
export function Highlight({ text, keywords }) {
  if (!text || !keywords?.length) return text ?? null;
  const pattern = new RegExp(`(${keywords.map(escapeRegex).join("|")})`, "gi");
  return text.split(pattern).map((part, i) =>
    i % 2 === 1 ? (
      <mark key={i} className="rounded bg-cyan-100 px-0.5 text-cyan-800">
        {part}
      </mark>
    ) : (
      part
    ),
  );
}

export function SearchModal({
  placeholder = "Search by keyword, place or title",
  query = "",
  onQueryChange,
  keywords = [],
  onRemoveKeyword,
  suggestions = [],
  suggestionsTitle = "Suggestions",
  onSelectSuggestion,
  results = [],
  resultsTitle = "Results",
  loading = false,
  emptyMessage = "No matches",
  onSelectResult,
  onSubmit,
  quickActions = [],
  className,
  open,
  onOpenChange,
  hotkey = "k",
  closeOnEscape = true,
  overlayClassName,
}) {
  const inputRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(-1);

  const setOpen = useCallback((value) => onOpenChange?.(value), [onOpenChange]);

  // Keep the latest open state / setter reachable from the one-time listener.
  const openRef = useRef(open);
  const setOpenRef = useRef(setOpen);
  useEffect(() => {
    openRef.current = open;
    setOpenRef.current = setOpen;
  });

  // ⌘K / Ctrl+K to toggle, Escape to close.
  useEffect(() => {
    const onKeyDown = (e) => {
      if (hotkey && e.key.toLowerCase() === hotkey.toLowerCase() && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpenRef.current(!openRef.current);
      } else if (closeOnEscape && e.key === "Escape" && openRef.current) {
        setOpenRef.current(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [hotkey, closeOnEscape]);

  // Focus the input when the modal opens.
  useEffect(() => {
    if (open) {
      const id = requestAnimationFrame(() => inputRef.current?.focus());
      return () => cancelAnimationFrame(id);
    }
  }, [open]);

  useEffect(() => setActiveIndex(-1), [results]);

  // Arrow keys move through results, Enter opens the highlighted one or
  // submits the whole query.
  const onInputKeyDown = (e) => {
    if (e.key === "ArrowDown" && results.length) {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % results.length);
    } else if (e.key === "ArrowUp" && results.length) {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? results.length - 1 : i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && results[activeIndex]) onSelectResult?.(results[activeIndex], activeIndex);
      else onSubmit?.(query);
    } else if (e.key === "Backspace" && !query && keywords.length) {
      onRemoveKeyword?.(keywords.length - 1);
    }
  };

  const sectionLabel = "text-[13px] text-neutral-400";

  const panel = (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Search stories"
      className={cn(
        "mx-auto w-full max-w-xl overflow-hidden rounded-2xl border backdrop-blur-xl",
        "border-black/[0.07] bg-white/90 text-neutral-900 shadow-[0_10px_40px_-14px_rgba(0,0,0,0.22)]",
        className,
      )}
    >
      {/* Search bar */}
      <div className="flex items-center gap-1 border-b border-black/[0.06] px-4 py-3.5">
        <MagnifyingGlass className="h-[18px] w-[18px] text-neutral-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => onQueryChange?.(e.target.value)}
          onKeyDown={onInputKeyDown}
          placeholder={placeholder}
          aria-label="Search"
          className="min-w-0 flex-1 bg-transparent px-3 text-sm text-current outline-none placeholder:text-neutral-400"
        />
        <div className="flex shrink-0 items-center gap-2.5">
          {query ? (
            <button
              type="button"
              aria-label="Clear search text"
              onClick={() => {
                onQueryChange?.("");
                inputRef.current?.focus();
              }}
              className="text-neutral-400 transition-colors hover:text-neutral-700"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
          <kbd className="flex items-center gap-0.5 rounded-md border border-black/[0.06] bg-black/[0.03] px-1.5 py-0.5 font-sans text-[11px] font-medium text-neutral-400">
            {IS_MAC ? <span className="text-[13px] leading-none">⌘</span> : "Ctrl+"}
            {hotkey ? hotkey.toUpperCase() : ""}
          </kbd>
        </div>
      </div>

      {/* Keywords being searched for, then suggestions to add */}
      {keywords.length > 0 || suggestions.length > 0 ? (
        <div className="border-b border-black/[0.06] px-4 py-3.5">
          {keywords.length > 0 ? (
            <>
              <span className={sectionLabel}>I&apos;m looking for...</span>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {keywords.map((keyword, i) => (
                  <span
                    key={`${keyword}-${i}`}
                    className="flex items-center gap-1.5 rounded-full bg-cyan-50 py-1 pl-2.5 pr-2 text-[13px] text-cyan-800 ring-1 ring-inset ring-cyan-100"
                  >
                    <span>{keyword}</span>
                    <button
                      type="button"
                      onClick={() => onRemoveKeyword?.(i)}
                      aria-label={`Remove ${keyword}`}
                      className="text-cyan-600/70 transition-colors hover:text-cyan-900"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            </>
          ) : null}
          {suggestions.length > 0 ? (
            <div className={keywords.length > 0 ? "mt-3.5" : undefined}>
              <span className={sectionLabel}>{suggestionsTitle}</span>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {suggestions.map((s, i) => (
                  <button
                    type="button"
                    key={`${s.label}-${i}`}
                    onClick={() => {
                      onSelectSuggestion?.(s);
                      inputRef.current?.focus();
                    }}
                    className="flex items-center gap-1.5 rounded-full bg-black/[0.04] py-1 pl-2 pr-2.5 text-[13px] ring-1 ring-inset ring-black/[0.04] transition-colors hover:bg-black/[0.07]"
                  >
                    {s.icon ?? <Plus className="h-3.5 w-3.5 text-neutral-400" />}
                    <span>{s.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {/* Results */}
      <div className="border-b border-black/[0.06]">
        <p className={cn(sectionLabel, "px-4 pb-2 pt-3.5")}>
          {resultsTitle}&nbsp;&nbsp;
          <span className="text-neutral-600">{loading ? "…" : results.length}</span>
        </p>
        {results.length > 0 ? (
          <ul className="max-h-[42vh] overflow-y-auto px-1.5 pb-1.5">
            {results.map((result, i) => (
              <li key={result.id ?? `${result.name}-${i}`}>
                <div
                  role="button"
                  tabIndex={-1}
                  onClick={() => onSelectResult?.(result, i)}
                  onMouseEnter={() => setActiveIndex(i)}
                  className={cn(
                    "group relative flex cursor-pointer items-start rounded-lg px-2.5 py-2 transition-colors",
                    i === activeIndex ? "bg-black/[0.04]" : "hover:bg-black/[0.03]",
                  )}
                >
                  {result.avatar ? (
                    <img
                      src={result.avatar}
                      alt=""
                      className="mt-0.5 h-8 w-8 shrink-0 rounded-lg object-cover ring-1 ring-black/5"
                    />
                  ) : (
                    <span
                      className="mt-0.5 h-8 w-8 shrink-0 rounded-lg ring-1 ring-black/5"
                      style={{ background: result.color ?? "#d4d4d4" }}
                    />
                  )}
                  <span className="ml-2.5 min-w-0 flex-1">
                    <span className="block truncate text-sm">
                      <Highlight text={result.name} keywords={keywords} />
                    </span>
                    {result.meta ? (
                      <span className="block truncate text-xs text-neutral-400">
                        <Highlight text={result.meta} keywords={keywords} />
                      </span>
                    ) : null}
                    {result.snippet ? (
                      <span className="mt-0.5 block truncate text-xs text-neutral-500">
                        <Highlight text={result.snippet} keywords={keywords} />
                      </span>
                    ) : null}
                  </span>
                  {result.actions && result.actions.length > 0 ? (
                    <span className="ml-auto flex items-center gap-2.5 self-center pl-3 text-neutral-400 opacity-70 transition-opacity group-hover:opacity-100">
                      {result.actions.map((action, ai) => (
                        <button
                          key={ai}
                          type="button"
                          aria-label={action.label}
                          title={action.label}
                          onClick={(e) => {
                            e.stopPropagation();
                            action.onClick?.();
                          }}
                          className="transition-colors hover:text-neutral-700"
                        >
                          {action.icon}
                        </button>
                      ))}
                    </span>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-4 pb-4 text-sm text-neutral-400">{loading ? "Searching…" : emptyMessage}</p>
        )}
      </div>

      {/* Quick actions */}
      {quickActions.length > 0 ? (
        <div className="px-1.5 py-1.5">
          <p className={cn(sectionLabel, "px-2.5 pb-1 pt-2")}>Quick actions</p>
          {quickActions.map((action, i) => (
            <button
              key={`${action.label}-${i}`}
              type="button"
              onClick={action.onClick}
              className="relative flex w-full items-center rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-black/[0.03]"
            >
              <span className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-lg bg-black/[0.04] text-neutral-500">
                {action.icon ?? <Plus className="h-[15px] w-[15px]" />}
              </span>
              <span className="pl-3 text-sm">{action.label}</span>
              {action.hint ? (
                <kbd className="ml-auto rounded-md bg-black/[0.04] px-1.5 py-0.5 font-sans text-[12px] text-neutral-500 ring-1 ring-inset ring-black/[0.04]">
                  {action.hint}
                </kbd>
              ) : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );

  return (
    <div
      onClick={() => setOpen(false)}
      aria-hidden={!open}
      className={cn(
        "fixed inset-0 z-[1000] flex items-start justify-center p-4 pt-[12vh] transition-opacity duration-200",
        open ? "opacity-100" : "pointer-events-none opacity-0",
        overlayClassName,
      )}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "relative z-10 w-full max-w-xl transition-all duration-200 ease-out",
          open ? "translate-y-0 scale-100 opacity-100" : "-translate-y-2 scale-[0.98] opacity-0",
        )}
      >
        {panel}
      </div>
    </div>
  );
}

export default SearchModal;
