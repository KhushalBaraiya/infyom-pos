import { useState, useEffect } from "react";

const useResponsiveLimit = () => {
  const getLimits = (width) => {
    if (width < 576) {
      return { limit: 3, lessThanLimit: 2 };
    } else if (width < 768) {
      return { limit: 5, lessThanLimit: 4 };
    } else if (width < 1400) {
      return { limit: 4, lessThanLimit: 3 };
    } else if (width < 1600) {
      return { limit: 5, lessThanLimit: 4 };
    } else {
      return { limit: 5, lessThanLimit: 4 };
    }
  };

  const [limits, setLimits] = useState(() => getLimits(window.innerWidth));

  useEffect(() => {
    let timeoutId;

    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const newLimits = getLimits(window.innerWidth);
        setLimits(newLimits);
      }, 200); // debounce to avoid spam updates
    };

    window.addEventListener("resize", handleResize);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return limits;
};

export { useResponsiveLimit };
