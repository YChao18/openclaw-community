"use client";

import { useEffect, useState } from "react";

export function useCountdown(initialValue = 0) {
  const [countdown, setCountdown] = useState(initialValue);

  useEffect(() => {
    if (countdown <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setCountdown((current) => (current > 0 ? current - 1 : 0));
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [countdown]);

  return {
    countdown,
    setCountdown,
  };
}
