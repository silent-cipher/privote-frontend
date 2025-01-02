import { useEffect } from "react";
import { redirect } from "next/navigation";
import { usePollContext } from "~~/contexts/PollContext";

export function useAuthUserOnly({ inverted }: { inverted?: boolean }) {
  const { isRegistered } = usePollContext();

  useEffect(() => {
    if (inverted && isRegistered) {
      redirect("/polls");
    }

    if (!inverted && !isRegistered) {
      redirect("/");
    }
  }, [isRegistered, inverted]);

  return;
}
