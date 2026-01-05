import { FC, useState } from "react";

interface NameFormProps {
  username: string;
  setUsername: (username: string) => void;
}

const NameForm: FC<NameFormProps> = ({ username, setUsername }) => {
  const [formUsername, setFormUsername] = useState(username);
  const hasChanges = formUsername !== username;

  return (
    <form className="space-y-2">
      <label
        className="text-stone-600 text-sm font-medium flex items-center gap-2"
        htmlFor="username"
      >
        <span>✏️</span>
        <span>Your Name</span>
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          value={formUsername}
          onChange={(e) => setFormUsername(e.currentTarget.value)}
          className="border-2 border-stone-200 rounded-lg px-3 py-2 flex-grow
            focus:border-emerald-400 focus:outline-none transition-colors
            placeholder:text-stone-400"
          placeholder="Enter your name..."
          name="username"
          id="username"
        />
        <button
          className={`rounded-lg px-4 py-2 font-medium text-sm transition-all duration-200
            ${
              hasChanges
                ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
                : "bg-stone-200 text-stone-400 cursor-not-allowed"
            }`}
          disabled={!hasChanges}
          onClick={(e) => {
            e.preventDefault();
            if (hasChanges) {
              setUsername(formUsername);
            }
          }}
        >
          Save
        </button>
      </div>
    </form>
  );
};

export default NameForm;
