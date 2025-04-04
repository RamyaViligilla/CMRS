import { useEffect, useState } from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Avatar,
  Button,
} from '@nextui-org/react';
import { FcFullTrash } from 'react-icons/fc';

import { deleteUser, getAllUsers } from '@/helpers/axiosCalls';
import DefaultLayout from '@/layouts/default';

const UserProfileCard = ({ user, onDelete }: any) => {
  const emailFirstLetter = user.email.charAt(0).toUpperCase();

  return (
    <Card className="max-w-[340px]">
      <CardHeader className="justify-between">
        <div className="flex gap-5">
          <Avatar
            isBordered
            showFallback
            color="primary"
            name={emailFirstLetter}
            radius="full"
            size="md"
          />
          <div className="flex flex-col gap-1 items-start justify-center">
            <h4 className="text-small font-semibold leading-none text-default-600">
              {user.name}
            </h4>
            <h5 className="text-small tracking-tight text-default-400">
              {user.email}
            </h5>
          </div>
        </div>
        <Button
          className={
            user.adminApproval
              ? 'bg-success-50 text-success'
              : 'bg-danger-50 text-danger'
          }
          radius="full"
          size="sm"
          variant="flat"
        >
          {user.adminApproval ? 'Approved' : 'Not Approved'}
        </Button>
      </CardHeader>
      <CardBody className="px-3 py-0 text-small text-default-400">
        <p>User Type: {user.userType}</p>
        <p>Email Verified: {user.email_verified ? 'Yes' : 'No'}</p>
        <p>Profile Status: {user.profileStatus ? 'Complete' : 'Incomplete'}</p>
      </CardBody>
      <CardFooter className="gap-3 justify-between">
        <div className="flex gap-1">
          <p className="font-semibold text-default-400 text-small">Created:</p>
          <p className="text-default-400 text-small">
            {new Date(user.createdAt).toLocaleDateString()}
          </p>
        </div>
        <Button
          color="danger"
          size="sm"
          variant="flat"
          onClick={() => onDelete(user._id)}
        >
          <FcFullTrash size={25} />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default function AdminDashboard() {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await getAllUsers();
      const fetchedUsers = Array.isArray(res.data) ? res.data : [];
      setUsers(fetchedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteUser(userId);
      setUsers(users.filter((user) => user._id !== userId));
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  return (
    <DefaultLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user) => (
            <UserProfileCard
              key={user._id}
              user={user}
              onDelete={handleDeleteUser}
            />
          ))}
        </div>
      </div>
    </DefaultLayout>
  );
}
