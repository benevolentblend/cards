import { v4 as uuid } from 'uuid';

import CreateRoomButton from '@/components/CreateRoomButton';
import Layout from '@/components/Layout';
import NameForm from '@/components/NameForm';
import { useLocalStorage } from '@/hooks/useLocalStorage';

export default function Home() {
  // Pre-generate user ID so it's available when joining a game room
  const [_id] = useLocalStorage('id', uuid());
  const [username, setUsername] = useLocalStorage('username', '');

  return (
    <Layout>
      <h1 className="pb-5 text-2xl">Cards</h1>

      <NameForm {...{ username, setUsername }} />
      <div className="flex-col pt-2">
        <CreateRoomButton disabled={username === ''} />
      </div>
    </Layout>
  );
}
