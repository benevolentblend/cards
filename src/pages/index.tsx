import Game from "@/components/Game";
import Layout from "@/components/Layout";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { v4 as uuid } from "uuid";
import CreateRoomButton from "@/components/CreateRoomButton";

interface GameSetup {
  username: string | null;
  roomId: string | null;
  showGame: boolean;
}

export default function Home() {
  const [id] = useLocalStorage("id", uuid());
  const [username, setName] = useLocalStorage("username", "");

  return (
    <Layout>
      <h1 className="text-2xl pb-5">Cards</h1>
      <div>
        <form className="flex flex-col gap-4">
          <label
            className="text-stone-600 text-xs font-bold"
            htmlFor="username"
          >
            Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setName(e.currentTarget.value)}
            className="border border-black p-2"
            name="username"
            id="username"
          />

          <CreateRoomButton disabled={username === ""} />
        </form>
      </div>
    </Layout>
  );
}
