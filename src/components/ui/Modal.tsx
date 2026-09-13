import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  /** Extra element rendered at the start of the header, before the title (e.g. a back button). */
  leading?: ReactNode;
  children: ReactNode;
  /** Disallow closing via backdrop click / Escape / the X button while true (e.g. mid-submit). */
  preventClose?: boolean;
  size?: "sm" | "md" | "lg";
  /** Tint the header accent — useful for destructive confirmations. */
  tone?: "default" | "danger";
}

const sizeClasses: Record<NonNullable<ModalProps["size"]>, string> = {
  sm: "sm:max-w-sm",
  md: "sm:max-w-md",
  lg: "sm:max-w-lg",
};

/**
 * A single, consistent "pop mode" for the whole app: rounded corners,
 * backdrop blur, slide/scale-in animation, Escape-to-close, backdrop-click
 * to close, and a focus-visible close button — instead of every page
 * hand-rolling its own `fixed inset-0 bg-black/40 ...` wrapper.
 */
export default function Modal({
  open,
  onClose,
  title,
  leading,
  children,
  preventClose = false,
  size = "md",
  tone = "default",
}: ModalProps) {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !preventClose) onClose();
    };
    document.addEventListener("keydown", handleKeyDown);

    // Lock background scroll while a modal is open.
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose, preventClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ledger-backdrop/60 p-0 backdrop-blur-sm animate-in fade-in duration-150 sm:items-center sm:p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !preventClose) onClose();
      }}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        className={`flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl border border-ledger-border bg-ledger-paper shadow-2xl ring-1 ring-black/5 animate-in slide-in-from-bottom-6 zoom-in-95 duration-200 sm:rounded-2xl sm:slide-in-from-bottom-2 ${sizeClasses[size]}`}
      >
        {/* Thin accent rule across the top — brass by default, ledger red for destructive confirmations */}
        <div
          className={`h-1 w-full shrink-0 ${
            tone === "danger" ? "bg-ledger-red" : "bg-ledger-brass"
          }`}
        />

        {(title || !preventClose) && (
          <div
            className={`relative flex shrink-0 items-center justify-center gap-2 border-b px-5 py-4 ${
              tone === "danger"
                ? "border-ledger-red-border bg-gradient-to-r from-ledger-red-wash-soft to-ledger-paper"
                : "border-ledger-border-soft bg-ledger-paper"
            }`}
          >
            {leading && <div className="absolute left-4">{leading}</div>}
            {title && (
              <h2
                className={`text-center font-serif text-base font-semibold sm:text-lg ${
                  tone === "danger" ? "text-ledger-red" : "text-ledger-ink"
                }`}
              >
                {title}
              </h2>
            )}
            {!preventClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="absolute right-3 flex h-8 w-8 items-center justify-center rounded-full text-ledger-faint transition-colors hover:bg-ledger-hover hover:text-ledger-ink active:scale-95"
              >
                <X size={18} />
              </button>
            )}
          </div>
        )}

        <div className="min-h-0 flex-1 overflow-y-auto bg-ledger-paper">
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
}
