import { useEffect } from "react";
import useLocalStorage from "./useLocalStorage";

function useDarkMode() {
  const [modoOscuro, setModoOscuro] = useLocalStorage("modoOscuro", false);

  useEffect(() => {
    if (modoOscuro) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [modoOscuro]);

  function alternarModoOscuro() {
    setModoOscuro(!modoOscuro);
  }

  return [modoOscuro, alternarModoOscuro];
}

export default useDarkMode;