import { getAvailableRoomId } from "@/lobby";
import { useRouter } from "next/router";
import { FC, useEffect, useState } from "react";

interface CreateRoomButtonProps {
  disabled?: boolean;
}

const CreateRoomButton: FC<CreateRoomButtonProps> = ({ disabled = false }) => {
  const [code, setCode] = useState("");
  const router = useRouter();
  useEffect(() => {
    async function getRoomCode() {
      const roomId = await getAvailableRoomId();
      setCode(roomId);
    }

    getRoomCode();
  }, []);

  const onClick = () => {
    if (code) router.push(`/${code}`);
  };

  return (
    <button
      disabled={disabled || code === ""}
      onClick={onClick}
      className="w-full disabled:opacity-50 rounded-sm border p-5 bg-yellow-400 group text-black shadow-sm enabled:hover:shadow-lg enabled:hover:cursor-pointer transition-all duration-200"
    >
      Create Room
    </button>
  );
};

export default CreateRoomButton;
