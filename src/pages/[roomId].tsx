import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { v4 as uuid } from 'uuid';

import Game from '@/components/Game';
import Layout from '@/components/Layout';
import RoomCode from '@/components/RoomCode';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { getRandomUsername } from '@/lobby';

export default function Home() {
  const router = useRouter();
  const [id] = useLocalStorage('id', uuid());
  const [username, setUsername] = useLocalStorage(
    'username',
    getRandomUsername()
  );

  useEffect(() => {
    if (username === '') setUsername(getRandomUsername());
  }, [setUsername, username]);

  if (!router.isReady || typeof router.query.roomId !== 'string') {
    return (
      <Layout>
        <div className="text-center">Loading...</div>
      </Layout>
    );
  }

  const roomId = router.query.roomId;

  return (
    <Layout topRight={<RoomCode code={roomId} />}>
      <Game {...{ username, setUsername, id, roomId }} />
    </Layout>
  );
}
