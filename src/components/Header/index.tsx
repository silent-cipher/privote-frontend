"use client";
import Link from "next/link";
import styles from "./index.module.css";
import { UserIcon, HouseIcon } from "./components";
import { usePathname } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { MdOutlinePoll } from "react-icons/md";

export default function Header() {
  const pathname = usePathname();
  return (
    <div className={styles["header-wrapper"]}>
      <header className={styles.header}>
        <Link href="/">
          <p className={styles["header-logo"]}>
            PRI<span className={styles.highlight}>VOTE</span>
          </p>
        </Link>
        <div className={styles.middle}>
          <Link
            href="/"
            className={`${styles.row} ${pathname === "/" ? styles.active : ""}`}
          >
            <HouseIcon isActive={pathname === "/"} />
            Home
          </Link>
          <Link
            href="/polls"
            className={`${styles.row} ${
              pathname === "/polls" ? styles.active : ""
            }`}
          >
            <MdOutlinePoll
              fill={pathname === "/polls" ? "#C45EC6" : "#dadada"}
              size={21}
            />
            Polls
          </Link>
          <Link
            href="/admin"
            className={`${styles.row} ${
              pathname === "/admin" ? styles.active : ""
            }`}
          >
            <UserIcon isActive={pathname === "/admin"} />
            Admin
          </Link>
        </div>
        <div>
          <ConnectButton />
        </div>
      </header>
    </div>
  );
}
