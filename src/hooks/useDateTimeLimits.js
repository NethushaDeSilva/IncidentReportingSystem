import { useEffect, useMemo, useState } from "react";
import { getCurrentDateTimeInputValue, getTodayInputValue } from "../utils/dateTimeLimits";

export function useDateTimeLimits(refreshMs = 1000) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const intervalId = setInterval(() => {
      setNow(new Date());
    }, refreshMs);

    return () => clearInterval(intervalId);
  }, [refreshMs]);

  return useMemo(
    () => ({
      now,
      today: getTodayInputValue(now),
      currentDateTime: getCurrentDateTimeInputValue(now),
    }),
    [now]
  );
}
