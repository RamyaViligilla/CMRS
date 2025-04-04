import { useEffect, useState } from 'react';
import { Accordion, AccordionItem, Spinner } from '@nextui-org/react';
import { Image } from '@nextui-org/react';

import OldUser from './oldUser';
import NewUser from './newUser';

import { getUserById } from '@/helpers/axiosCalls';
import DefaultLayout from '@/layouts/default';
import { getUserFromLocalStorage } from '@/helpers/commonLogic';
import { createSVGAvatar } from '@/components/icons';

interface UserData {
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  email: string;
  email_verified: boolean;
  createdAt: Date;
  userType: string;
  profileStatus: boolean;
  _id: string;
}

export default function CreateProfile() {
  const [userDataInfo, setUserDataInfo] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const user = getUserFromLocalStorage();
  const userId = user ? user._id : null;

  useEffect(() => {
    const currentUser = async () => {
      try {
        if (userId) {
          setIsLoading(true);
          const res = await getUserById(userId);
          setUserDataInfo(res.data);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    };
    currentUser();
  }, [userId]);
  const userData = userDataInfo[0] || {};
  const getUserInitials = (firstName: string, lastName: string) => {
    const firstInitial = firstName ? firstName[0].toUpperCase() : '';
    const lastInitial = lastName ? lastName[0].toUpperCase() : '';
    return `${firstInitial}${lastInitial}`;
  };

  const userInitials = getUserInitials(
    userData.given_name,
    userData.family_name
  );

  const userImage =
    userDataInfo[0]?.picture === 'No Image'
      ? createSVGAvatar(userInitials)
      : userDataInfo[0]?.picture;

  console.log('Here', userDataInfo[0]?.picture);

  const userProfileStatus = userDataInfo[0]?.profileStatus;

  return (
    <DefaultLayout>
      {isLoading ? (
        <Spinner color="warning" label="Loading..." />
      ) : (
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:space-x-8">
            <div className="w-full md:w-1/3 mb-8 md:mb-0">
              <div className="flex justify-center mb-4">
                <Image
                  isBlurred
                  isZoomed
                  alt={`${userData.name || 'User'}'s profile picture`}
                  className="rounded-full"
                  crossOrigin="anonymous"
                  height={250}
                  src={userImage}
                  width={250}
                />
              </div>

              <Accordion variant="shadow">
                <AccordionItem
                  key="1"
                  aria-label="Basic Information"
                  subtitle="Name, email, and join date"
                  title="Basic Information"
                >
                  <h4 className="text-lg font-semibold">
                    {userData.given_name || 'User'} {userData.family_name || ''}
                  </h4>
                  <p>{userData.email || 'Email not available'}</p>
                  <p>
                    Joined:{' '}
                    {userData.createdAt
                      ? new Date(userData.createdAt).toLocaleDateString()
                      : 'Date not available'}
                  </p>
                </AccordionItem>
                <AccordionItem
                  key="2"
                  aria-label="Additional Information"
                  subtitle="User type and profile status"
                  title="Additional Information"
                >
                  <p>User Type: {userData.userType || 'Not specified'}</p>
                  <p>
                    Profile Status:{' '}
                    {userData.profileStatus ? 'Complete' : 'Incomplete'}
                  </p>
                </AccordionItem>
                <AccordionItem
                  key="3"
                  aria-label="Account Details"
                  subtitle="Email verification and ID"
                  title="Account Details"
                >
                  <p>
                    Email Verified: {userData.email_verified ? 'Yes' : 'No'}
                  </p>
                  <p>User ID: {userData._id || 'Not available'}</p>
                </AccordionItem>
              </Accordion>
            </div>
            <div className="w-full md:w-2/3">
              {userProfileStatus === true ? (
                <OldUser userId={userData._id} userType={userData.userType} />
              ) : (
                <NewUser userEmailId={userData.email} userId={userData._id} />
              )}
            </div>
          </div>
        </div>
      )}
    </DefaultLayout>
  );
}
