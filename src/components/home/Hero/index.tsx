import styles from "./index.module.css";

interface HeroProps {
  title?: string;
  description?: string;
  status?: string;
}

export const Hero = ({
  title = "Revolutionizing the Future of Voting",
  description = "Create polls, participate in elections, and make your voice heard in the decision-making process.",
  status = "Privote: the all new way to create polls",
}: HeroProps) => {
  return (
    <div className={styles.hero}>
      <div className={styles.status}>{status}</div>
      <h1 className={styles.heading}>{title}</h1>
      <p className={styles.description}>{description}</p>
    </div>
  );
};

export default Hero;
