"use client";
import styles from "~~/styles/admin.module.css";
import Button from "~~/components/ui/Button";
import { useState } from "react";
import { CreatePollForm } from "~~/components/admin";

export default function Admin() {
  const [showCreatePoll, setShowCreatePoll] = useState(false);
  return (
    <div className={styles.wrapper}>
      <div className={styles["admin-page"]}>
        <div className={styles.header}>
          {!showCreatePoll && (
            <Button
              className={styles.btn}
              action={() => setShowCreatePoll(true)}
            >
              Create Poll
            </Button>
          )}
        </div>
        {showCreatePoll && (
          <CreatePollForm
            onClose={() => {
              setShowCreatePoll(false);
            }}
          />
        )}
      </div>
    </div>
  );
}
