"use client";
import Link from "next/link";
import styles from "./index.module.css";
import Image from "next/image";
import { UserIcon, HouseIcon } from "./components";
import { usePathname } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { RainbowKitCustomConnectButton } from "../scaffold-eth/RainbowKitCustomConnectButton";

export default function Header() {
  const pathname = usePathname();
  return (
    <div className={styles["header-wrapper"]}>
      <header className={styles.header}>
        <div>
          <p className={styles["header-logo"]}>
            PRI<span className={styles.highlight}>VOTE</span>
          </p>
        </div>
        <div className={styles.middle}>
          <Link
            href="/"
            className={`${styles.row} ${pathname === "/" ? styles.active : ""}`}
          >
            <HouseIcon isActive={pathname === "/"} />
            Home
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
          {/* <RainbowKitCustomConnectButton /> */}
        </div>
      </header>
    </div>
  );
}
