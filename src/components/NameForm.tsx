import { useState, useEffect } from 'react';

import type { FC } from 'react';

interface NameFormProps {
  username: string;
  setUsername: (username: string) => void;
}

const NameForm: FC<NameFormProps> = ({ username, setUsername }) => {
  const [formUsername, setFormUsername] = useState(username);

  // Sync form state when username prop changes (e.g., after localStorage hydration)
  useEffect(() => {
    setFormUsername(username);
  }, [username]);
  const hasChanges = formUsername !== username;

  return (
    <form className="space-y-2">
      <label
        className="flex items-center gap-2 text-sm font-medium text-stone-600"
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
          className="flex-grow rounded-lg border-2 border-stone-200 px-3 py-2 transition-colors placeholder:text-stone-400 focus:border-emerald-400 focus:outline-none"
          placeholder="Enter your name..."
          name="username"
          id="username"
        />
        <button
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
            hasChanges
              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md hover:scale-105 hover:shadow-lg active:scale-95'
              : 'cursor-not-allowed bg-stone-200 text-stone-400'
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
