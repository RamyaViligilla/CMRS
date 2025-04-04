import React, { useState, useEffect } from 'react';
import { User } from '@nextui-org/react';

import { getUserProfile } from '@/helpers/axiosCalls';

interface UserAvatarProps {
  email: string | undefined;
  size?: 'sm' | 'md' | 'lg';
  description: string | undefined;
}

const UserAvatar: React.FC<UserAvatarProps> = ({
  email,
  size = 'md',
  description,
}) => {
  const [userPicture, setUserPicture] = useState<string | null>(null);
  console.log('userPicture', userPicture);

  useEffect(() => {
    const fetchUserPicture = async () => {
      if (!email) {
        setUserPicture(null);

        return;
      }

      try {
        const response = await getUserProfile(email);

        if (response.data && response.data.picture) {
          setUserPicture(response.data.picture);
        } else {
          setUserPicture(null);
        }
      } catch (error) {
        console.error('Error fetching user picture:', error);
        setUserPicture(null);
      }
    };

    fetchUserPicture();
  }, [email]);

  const getInitial = (email: string | undefined) => {
    return email ? email.charAt(0).toUpperCase() : '?';
  };

  const getRandomColor = (email: string | undefined) => {
    if (!email) return 'hsl(0, 0%, 50%)';

    let hash = 0;
    for (let i = 0; i < email.length; i++) {
      hash = email.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = hash % 360;
    return `hsl(${hue}, 70%, 60%)`;
  };

  return (
    <User
      avatarProps={{
        src: userPicture || undefined,
        name: getInitial(email),
        color: 'primary',
        size: size,
        style: !userPicture
          ? { backgroundColor: getRandomColor(email) }
          : undefined,
      }}
      description={description}
      name={email || 'Unknown User'}
    />
  );
};

export default UserAvatar;
