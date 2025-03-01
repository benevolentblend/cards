import Game from "@/components/Game";
import Layout from "@/components/Layout";
import { v4 as uuid } from "uuid";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useRouter } from "next/router";
import { getRandomUsername } from "@/lobby";
import { useEffect } from "react";
import RoomCode from "@/components/RoomCode";

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
  if (!router.isReady || typeof router.query.roomId !== "string") {
    return (
      <Layout>
        <div className="text-center">Loading...</div>
      </Layout>
    );
  }

  const roomId = router.query.roomId;

  return (
    <Layout>
      <RoomCode code={roomId} />
      <Game {...{ roomId, username, setUsername, id }} />
    </Layout>
  );
}
