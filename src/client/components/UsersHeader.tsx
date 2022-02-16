import React from 'react';
import InviteUser from './InviteUser';
import PageHeader from './PageHeader';

const UsersHeader = (): React.ReactElement => (
  <>
    <PageHeader title="Users" message="Users who have registered and verified." />
    <div className="d-flex justify-content-end">
      <InviteUser />
    </div>
  </>
);

export default UsersHeader;
