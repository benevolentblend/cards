import Game from "@/components/Game";
import Layout from "@/components/Layout";
import { v4 as uuid } from "uuid";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useRouter } from "next/router";
import { getRandomUsername } from "@/lobby";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();
  const [id] = useLocalStorage("id", uuid());
  const [username, setUsername] = useLocalStorage(
    "username",
    getRandomUsername()
  );

  useEffect(() => {
    if (username === "") setUsername(getRandomUsername());
  }, [setUsername, username]);

  console.log({ roomId: router.query.roomId });

  return (
    <Layout>
      {router.isReady && (
        <Game
          roomId={router.query.roomId as string}
          username={username}
          id={id}
        />
      )}
    </Layout>
  );
}
