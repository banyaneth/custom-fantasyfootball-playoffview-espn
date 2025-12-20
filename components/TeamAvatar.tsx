import { useMemo, useState } from "react";

type Props = {
  name: string;
  logoUrl?: string;
  className?: string;
};

export function TeamAvatar({ name, logoUrl, className = "" }: Props) {
  const [errored, setErrored] = useState(false);

  const initials = useMemo(() => {
    const trimmed = (name ?? "").trim();
    if (!trimmed) return "?";
    // Use first letter of up to first 2 words for nicer fallback.
    const parts = trimmed.split(/\s+/).filter(Boolean);
    const letters = parts.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "");
    return letters.join("").slice(0, 2) || trimmed[0]!.toUpperCase();
  }, [name]);

  const showImage = Boolean(logoUrl && !errored);

  return (
    <div
      className={[
        "grid shrink-0 place-items-center overflow-hidden rounded-full",
        "bg-white/10 text-white/90 ring-1 ring-white/15 shadow-sm",
        className,
      ].join(" ")}
      aria-label={`${name} logo`}
      title={name}
    >
      {showImage ? (
        // Using <img> instead of next/image avoids needing to manage remote image allowlists.
        <img
          src={logoUrl}
          alt={`${name} logo`}
          className="h-full w-full object-cover"
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => setErrored(true)}
        />
      ) : (
        <span className="select-none text-[11px] font-black leading-none tracking-wide sm:text-xs">
          {initials}
        </span>
      )}
    </div>
  );
}



