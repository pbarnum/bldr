import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { AppContext } from '../App';
import AvailableUsers from '../components/AvailableUsers';
import DisplayUser from '../components/DisplayUser';
import Unauthorized from '../components/Unauthorized';
import UsersHeader from '../components/UsersHeader';
import storage from '../storage';
import { User } from '../types/user';

interface uc {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

export const UserContext = React.createContext<uc>({
  user: null,
  setUser: () => {
    // empty
  },
});

const Users = (): React.ReactElement => {
  const ctx: AppContext = useOutletContext();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    document.title = 'Users - Bldr';
  }, []);

  if (!ctx.user || !storage.isAdmin) {
    return <Unauthorized title="Unauthorized" message="You cannot view Users without being logged in!" />;
  }

  return (
    <>
      <UserContext.Provider value={{ user: selectedUser, setUser: setSelectedUser }}>
        <UsersHeader />
        <AvailableUsers />
        <hr className="my-4" />
        <DisplayUser />
      </UserContext.Provider>
    </>
  );
};

export default Users;
