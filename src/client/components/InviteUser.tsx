import React, { useContext } from 'react';
import { UserContext } from '../pages/Users';
import { User } from '../types/user';

export interface InviteUserProps {
  selectedCallback?: (user: User | null) => void;
}

const InviteUser = (): React.ReactElement => {
  const { setUser } = useContext(UserContext);

  const onClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    setUser({
      email: 'email@example.com',
      firstName: 'Jane',
      lastName: 'Smith',
      id: '',
      name: '',
      templateCount: 0,
      outputCount: 0,
      roles: [],
      resetToken: '',
      verifyToken: '',
      verifiedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    });
  };

  return (
    <>
      <button className="btn btn-primary" onClick={onClick}>
        New User
      </button>
    </>
  );
};

export default InviteUser;
