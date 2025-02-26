"use client";
import Link from "next/link";
import { useState } from "react";
import Image from "next/image";
import styles from "./index.module.css";
import { UserIcon, HouseIcon } from "./components";
import { usePathname } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { MdOutlinePoll, MdClose } from "react-icons/md";
import { CiMenuFries } from "react-icons/ci";
import Logo from "../../../public/logo.svg";
import FaucetModal from "../ui/FaucetModal";
import { useBalanceCheck } from "~~/hooks/useBalanceCheck";

export default function Header() {
  const pathname = usePathname();
  const [isChecked, setIsChecked] = useState(false);
  const { showFaucetModal, onCloseFaucetModal } = useBalanceCheck();
  return (
    <>
      <div className={styles["header-wrapper"]}>
        <header className={styles.header}>
          <div className={styles["content-header"]}>
            <Link href="/">
              <div className={styles["header-logo"]}>
                <Image src={Logo} alt="logo" width={30} height={30} />
                <p>
                  PRI<span className={styles.highlight}>VOTE</span>
                </p>
              </div>
            </Link>
            <button
              className={styles.hamburger}
              onClick={() => {
                setIsChecked(!isChecked);
              }}
            >
              {isChecked ? <MdClose size={24} /> : <CiMenuFries size={24} />}
            </button>
          </div>
          <div
            className={`${styles.content} ${isChecked ? styles.checked : ""}`}
          >
            <nav className={styles.nav}>
              <ul className={styles["nav-list"]}>
                <Link
                  href="/"
                  className={`${styles.row} ${
                    pathname === "/" ? styles.active : ""
                  }`}
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
              </ul>
            </nav>
            <div className={styles.actions}>
              <ConnectButton />
            </div>
          </div>
        </header>
      </div>
      <FaucetModal isOpen={showFaucetModal} onClose={onCloseFaucetModal} />
    </>
  );
}
