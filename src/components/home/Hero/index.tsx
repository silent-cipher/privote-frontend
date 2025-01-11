import Link from "next/link";
import styles from "./index.module.css";

interface HeroProps {
  title?: string;
  description?: string;
  status?: string;
}

export const Hero = ({
  title = "Revolutionizing the Future of Voting",
  description = "Create polls, participate in elections, and make your voice heard in a Private and Decentralized way.",
  status = "Privote: The all new way of voting through MACI",
}: HeroProps) => {
  return (
    <div className={styles.hero}>
      <div className={styles.status}>
        Privote: The all new way of voting through{" "}
        <Link
          href={"https://maci.pse.dev/"}
          target="_blank"
          rel="noopener noreferrer"
        >
          MACI
        </Link>
      </div>
      <h1 className={styles.heading}>{title}</h1>
      <p className={styles.description}>{description}</p>
      <div className={styles.actions}>
        <Link className={styles["create-poll"]} href="/admin/?action=create">
          Create Poll
        </Link>
      </div>
    </div>
  );
};

export default Hero;
