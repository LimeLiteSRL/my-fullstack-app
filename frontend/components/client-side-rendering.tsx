"use client";

import { useState } from "react";
import useIsomorphicLayoutEffect from "@/libs/hooks/use-isomorphic-layout-effect";

export default function ClientSideRendering({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSSR, setIsSSR] = useState(true);

  useIsomorphicLayoutEffect(() => {
    setIsSSR(false);
  }, []);

  return isSSR ? null : children;
}
