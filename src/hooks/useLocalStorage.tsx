import { useState, useEffect, Dispatch, SetStateAction } from "react";

export const useLocalStorage = (
  key: string,
  initialValue: string
): [string, Dispatch<SetStateAction<string>>] => {
  const [storedValue, setStoredValue] = useState<string>(initialValue);
  const [isHydrated, setIsHydrated] = useState(false);

  // Read from localStorage after mount to avoid hydration mismatch
  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.error("Error reading localStorage", error);
    }
    setIsHydrated(true);
  }, [key]);

  // Write to localStorage when value changes (after hydration)
  useEffect(() => {
    if (!isHydrated) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error("Error setting localStorage", error);
    }
  }, [key, storedValue, isHydrated]);

  return [storedValue, setStoredValue];
};
