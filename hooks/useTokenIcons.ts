import { useEffect, useState } from "react";
import { AVAILABLE_TOKENS } from "@/constants/tokens";
import { fetchTokenIcons } from "@/services/jupiter";

/** Mint address -> icon URL. Empty until fetched. */
export function useTokenIcons(): Record<string, string> {
  const [icons, setIcons] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    fetchTokenIcons(AVAILABLE_TOKENS).then((map) => {
      if (!cancelled) setIcons(map);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return icons;
}
