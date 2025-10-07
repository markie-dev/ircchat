import { useEffect } from "react";

export function useAutoScrollToEnd(
  ref: React.RefObject<HTMLElement | null>,
  deps: Array<unknown>
) {
  useEffect(() => {
    if (ref.current) {
      ref.current.scrollIntoView();
    }
  }, deps);
}
