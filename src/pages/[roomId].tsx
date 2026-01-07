import { useRouter } from 'next/router';
import { v4 as uuid } from 'uuid';

import Game from '@/components/Game';
import Layout from '@/components/Layout';
import NameForm from '@/components/NameForm';
import RoomCode from '@/components/RoomCode';
import { useLocalStorage } from '@/hooks/useLocalStorage';

export default function Home() {
  const router = useRouter();
  const [id] = useLocalStorage('id', uuid());
  const [username, setUsername] = useLocalStorage('username', '');

  if (!router.isReady || typeof router.query.roomId !== 'string') {
    return (
      <Layout>
        <div className="text-center">Loading...</div>
      </Layout>
    );
  }

  if (username === '') {
    return (
      <Layout>
        <div>
          <h1 className="pb-5 text-2xl">Cards</h1>
          <NameForm {...{ username, setUsername }} />
        </div>
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
