import styles from "./index.module.css";
import Image from "next/image";
import Link from "next/link";
import Logo from "../../../public/logo.svg";
import github from "../../../public/github.svg";
import telegram from "../../../public/telegram.svg";
import x from "../../../public/x.svg";
import mail from "../../../public/mail.svg";

const socialMedia = [
  {
    icon: github,
    link: "https://github.com/PriVote-Project",
  },
  {
    icon: telegram,
    link: "https://t.me/privote",
  },
  {
    icon: x,
    link: "https://x.com/privoteweb3",
  },
  {
    icon: mail,
    link: "mailto:privote.live@gmail.com",
  },
];

const Footer = () => {
  return (
    <div className={styles.container}>
      <footer className={styles.footer}>
        <div className={styles["logo"]}>
          <Image src={Logo} alt="logo" width={30} height={30} />
          <p>
            PRI<span className={styles.highlight}>VOTE</span>
          </p>
        </div>
        <div className={styles["social-media"]}>
          {socialMedia.map((social, index) => (
            <Link
              href={social.link}
              className={styles["img-container"]}
              key={index}
            >
              <Image src={social.icon} alt="social" width={20} height={20} />
            </Link>
          ))}
        </div>
      </footer>
    </div>
  );
};

export default Footer;
