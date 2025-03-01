import { PartySocket } from "partysocket";
import { z } from "zod";

const randomCharacters = (len: number, characters: string) => {
  let random = "";
  for (let i = len; i > 0; i--) {
    random += characters[Math.floor(Math.random() * characters.length)];
  }
  return random;
};

const responsePayloadValidator = z.object({
  count: z.number(),
});

export const getAvailableRoomId = async () => {
  let roomCode = "";

  while (roomCode == "") {
    roomCode = randomCharacters(6, "ABCDEF0123456789");
    const response = await PartySocket.fetch(
      {
        host: process.env.NEXT_PUBLIC_PARTYKIT_HOST || "127.0.0.1:1999",
        room: roomCode,
      },
      {
        method: "POST",
        body: JSON.stringify({ message: "count" }),
      }
    );

    const responsePayload = responsePayloadValidator.parse(
      await response.json()
    );
    roomCode = responsePayload.count > 0 ? "" : roomCode;
  }

  return roomCode;
};

export const getRandomUsername = () =>
  `Guest ${randomCharacters(3, "1234567890")}`;
