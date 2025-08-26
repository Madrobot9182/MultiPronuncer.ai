import { useTheme } from "next-themes";
import multipronuncerlogo from "@/../public/multipronuncerai.svg";
import Image from "next/image";

export default function MultiPronuncerLogo() {
  const { theme } = useTheme();

  return (
    <Image
      src={multipronuncerlogo}
      alt="Logo"
      height="150"
      className={theme == "dark" ? "invert" : ""}
    />
  );
}
