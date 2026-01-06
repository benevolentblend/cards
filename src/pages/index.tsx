import Game from "@/components/Game";
import Layout from "@/components/Layout";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { v4 as uuid } from "uuid";
import CreateRoomButton from "@/components/CreateRoomButton";
import NameForm from "@/components/NameForm";

interface GameSetup {
  username: string | null;
  roomId: string | null;
  showGame: boolean;
}

export default function Home() {
  const [id] = useLocalStorage("id", uuid());
  const [username, setUsername] = useLocalStorage("username", "");

  return (
    <Layout>
      <h1 className="text-2xl pb-5">Cards</h1>

      <NameForm {...{ username, setUsername }} />
      <div className="flex-col pt-2">
        <CreateRoomButton disabled={username === ""} />
      </div>
    </Layout>
  );
}
