import React, { useContext, useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import Select, { MultiValue } from 'react-select';
import { AppContext, newErrorAlert, newSuccessAlert } from '../App';
import api from '../api';
import { UserContext } from '../pages/Users';
import { ApiMessage } from '../types/api';
import { Role } from '../types/user';
import DeleteOrRestoreUserModal from './DeleteUserModal';

interface RoleOption {
  label: string;
  value: string;
}

const DisplayUser = (): React.ReactElement => {
  const ctx: AppContext = useOutletContext();
  const { user, setUser } = useContext(UserContext);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [roleOptions, setRoleOptions] = useState<RoleOption[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<RoleOption[]>([]);
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const archived = user?.deletedAt !== null;

  useEffect(() => {
    api.auth
      .getRoles()
      .then(({ roles }) => {
        setRoles(roles);
        setRoleOptions(roles.map((role) => ({ label: role.name, value: role.id })));
      })
      .catch((err: ApiMessage) => {
        ctx.setAlert(newErrorAlert(err.message));
      });
  }, []);

  useEffect(() => {
    if (user) {
      setEmail(user.email);
      setFirstName(user.firstName);
      setLastName(user.lastName);
      if (user.roles) {
        setSelectedRoles(roleOptions.filter((o) => user?.roles.find((r) => r.id === o.value)));
      }
    }
  }, [user]);

  const selectChange = (selected: MultiValue<RoleOption>) => {
    if (!selected) {
      return;
    }
    setSelectedRoles(selected.map((o) => o));
  };

  const openModal = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setShowModal(true);
  };

  const closeModal = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setShowModal(false);
  };

  const deleteUser = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (!user) {
      return;
    }

    setShowModal(false);

    api.user
      .deleteUser(user.id)
      .then(() => {
        setUser(Object.assign({}, user, { deletedAt: new Date() }));
      })
      .catch((err: ApiMessage) => {
        ctx.setAlert(newErrorAlert(err.message));
      })
      .finally(() => {
        setShowModal(false);
      });
  };

  const restoreUser = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (!user) {
      return;
    }

    api.user
      .restoreUser(user.id)
      .then(({ user }) => {
        setUser(user);
      })
      .catch((err: ApiMessage) => {
        ctx.setAlert(newErrorAlert(err.message));
      })
      .finally(() => {
        setShowModal(false);
      });
  };

  const emailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const firstNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFirstName(e.target.value);
  };

  const lastNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLastName(e.target.value);
  };

  const submit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (!user) {
      throw 'No user available';
    }

    const formUser = {
      id: user.id,
      email: email,
      firstName: firstName,
      lastName: lastName,
      roles: roles.filter((r) => selectedRoles.find((o) => r.id === o.value)),
    };

    if (user.id === '') {
      api.user
        .createUser(formUser)
        .then((res) => {
          setUser(res.user);
          ctx.setAlert(newSuccessAlert('User invited!'));
        })
        .catch((err: ApiMessage) => {
          ctx.setAlert(err);
        });
    } else {
      api.user
        .updateUser(formUser)
        .then((res) => {
          setUser(res.user);
          ctx.setAlert(newSuccessAlert('User updated!'));
        })
        .catch((err: ApiMessage) => {
          ctx.setAlert(err);
        });
    }
  };

  const newUser = user !== null && user.id === '';

  return (
    <>
      {!user ? (
        <div className="text-center">
          <h3>No User</h3>
          <h5>Select a User above.</h5>
        </div>
      ) : (
        <>
          <DeleteOrRestoreUserModal
            show={showModal}
            isArchived={archived}
            onCancel={closeModal}
            onOk={archived ? restoreUser : deleteUser}
          />
          <div className="row">
            <div className="col">
              <h3>{newUser ? 'New User' : user.name}</h3>
            </div>
          </div>
          {newUser ? (
            <></>
          ) : (
            <div className="row mb-2">
              <div className="col d-flex justify-content-end">
                <button
                  className={'btn btn-' + (archived ? 'success' : 'danger')}
                  onClick={(e) => {
                    openModal(e);
                  }}
                >
                  {archived ? 'Restore' : 'Archive'}
                </button>
              </div>
            </div>
          )}
          <form className="form form-control">
            {newUser || user.verifiedAt === null ? (
              <></>
            ) : (
              <div className="mb-3">
                <label htmlFor="email" className="form-label">
                  Roles
                </label>

                <Select
                  isMulti={true}
                  value={selectedRoles || []}
                  onChange={selectChange}
                  options={roleOptions}
                  className="bldr-limit-select"
                />
              </div>
            )}
            <div className="mb-3">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input type="email" id="email" className="form-control" value={email || ''} onChange={emailChange} />
            </div>
            <div className="mb-3">
              <label htmlFor="firstName" className="form-label">
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                className="form-control"
                value={firstName || ''}
                onChange={firstNameChange}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="lastName" className="form-label">
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                className="form-control"
                value={lastName || ''}
                onChange={lastNameChange}
              />
            </div>
            <div className="d-flex justify-content-end">
              <button className="btn btn-primary" onClick={submit}>
                {newUser ? 'Invite' : 'Update'}
              </button>
            </div>
          </form>
        </>
      )}
    </>
  );
};

export default DisplayUser;
