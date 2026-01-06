import Game from "@/components/Game";
import Layout from "@/components/Layout";
import { v4 as uuid } from "uuid";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useRouter } from "next/router";
import { getRandomUsername } from "@/lobby";
import { useEffect } from "react";
import RoomCode from "@/components/RoomCode";
import { useGameRoom } from "@/hooks/useGameRoom";

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

  const roomId =
    typeof router.query.roomId === "string" ? router.query.roomId : "";
  const { clientState, serverDispatch, clientDispatch } = useGameRoom(
    username,
    id,
    roomId
  );

  if (!router.isReady || typeof router.query.roomId !== "string") {
    return (
      <Layout>
        <div className="text-center">Loading...</div>
      </Layout>
    );
  }

  const gameLogs = clientState.gameState?.log ?? [];

  return (
    <Layout topRight={<RoomCode code={roomId} />} gameLogs={gameLogs}>
      <Game
        {...{
          username,
          setUsername,
          id,
          clientState,
          serverDispatch,
          clientDispatch,
        }}
      />
    </Layout>
  );
}
