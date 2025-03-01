import { useLocalStorage } from "@/hooks/useLocalStorage";
import { FC, useState } from "react";

interface NameForm {
  username: string;
  setUsername: (username: string) => void;
}

const NameForm: FC<NameForm> = ({ username, setUsername }) => {
  const [formUsername, setFormUsername] = useState(username);
  return (
    <form className="flex flex-col">
      <label className="text-stone-600 text-xs font-bold" htmlFor="username">
        Username
      </label>
      <div className="flex gap-2 py-2">
        <input
          type="text"
          value={formUsername}
          onChange={(e) => setFormUsername(e.currentTarget.value)}
          className="border border-black p-2 flex-grow"
          name="username"
          id="username"
        />
        <div className="w-20">
          <button
            className="bg-black rounded-sm p-2 inline-block shadow-sm text-xs text-stone-50 hover:cursor-pointer w-full h-full"
            onClick={(e) => {
              e.preventDefault();
              console.log({ formUsername });
              setUsername(formUsername);
            }}
          >
            Save
          </button>
        </div>
      </div>
    </form>
  );
};

export default NameForm;
