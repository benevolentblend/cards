import { getAvailableRoomId } from "@/lobby";
import { useRouter } from "next/router";
import { FC, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

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
    <Button
      disabled={disabled || code === ""}
      onClick={onClick}
      size="lg"
      className="w-full bg-gradient-to-r from-amber-400 to-orange-500 text-stone-900 font-semibold
        shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200
        disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-lg"
    >
      Create Room
    </Button>
  );
};

export default CreateRoomButton;
