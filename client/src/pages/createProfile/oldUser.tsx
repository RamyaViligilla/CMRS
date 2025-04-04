import { useEffect, useState } from 'react';

import { title } from '@/components/primitives';
import { getUserUpdatedDetailsById } from '@/helpers/axiosCalls';
import { UserData } from '@/types';

interface NewUserProps {
  userId: string;
  userType: string;
}

export default function OldUser({ userId, userType }: NewUserProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [userDataInfo, setUserDataInfo] = useState<UserData | null>(null);

  useEffect(() => {
    const currentUser = async () => {
      try {
        if (userId) {
          setIsLoading(true);
          const res = await getUserUpdatedDetailsById(userId, userType);
          setUserDataInfo(res.data);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    };
    currentUser();
  }, [userId, userType]);

  const userData = userDataInfo || {};

  return (
    <section className="flex flex-col items-center justify-center gap-4 py-4 px-4 md:py-8 md:px-6 lg:px-8">
      <div className="inline-block max-w-lg text-center justify-center">
        <h1
          className={`${title()} text-2xl sm:text-3xl md:text-4xl font-bold mb-4 md:mb-6`}
        >
          Profile Information
        </h1>
      </div>
      {isLoading ? (
        <div className="text-center p-4 md:p-8">
          <p className="text-lg md:text-xl text-gray-600">Loading...</p>
        </div>
      ) : (
        <div className="w-full max-w-2xl p-4 sm:p-6 md:p-8 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg shadow-md">
          {userType === 'patient' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <UserInfoItem
                label="User Type"
                value={userData.userType || 'N/A'}
              />
              <UserInfoItem
                label="Age"
                value={userData.age?.toString() || 'N/A'}
              />
              <UserInfoItem
                label="Date of Birth"
                value={
                  userData.dateOfBirth
                    ? new Date(userData.dateOfBirth).toLocaleDateString()
                    : 'Date not available'
                }
              />
              <UserInfoItem
                label="Country Code"
                value={userData.countryCode || 'N/A'}
              />
              <UserInfoItem label="Gender" value={userData.gender || 'N/A'} />
              <UserInfoItem
                label="Medical History"
                value={userData.medicalHistory || 'N/A'}
              />
            </div>
          )}
          {userType === 'researcher' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <UserInfoItem
                label="User Type"
                value={userData.userType || 'N/A'}
              />
              <UserInfoItem
                label="Age"
                value={userData.age?.toString() || 'N/A'}
              />
              <UserInfoItem
                label="Date of Birth"
                value={
                  userData.dateOfBirth
                    ? new Date(userData.dateOfBirth).toLocaleDateString()
                    : 'Date not available'
                }
              />
              <UserInfoItem
                label="Contact Number"
                value={userData.contactNumber || 'N/A'}
              />
              <UserInfoItem label="Gender" value={userData.gender || 'N/A'} />
              <UserInfoItem
                label="Medical License Number"
                value={userData.medicalLicenseNumber || 'N/A'}
              />
              <UserInfoItem
                label="Specialization"
                value={userData.specialization || 'N/A'}
              />
              <UserInfoItem
                label="Experience"
                value={userData.experience?.toString() || 'N/A'}
              />
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function UserInfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300">
      <h2 className="text-base sm:text-lg font-semibold text-gray-700">
        {label}
      </h2>
      <p className="text-sm sm:text-md text-gray-600">{value}</p>
    </div>
  );
}
