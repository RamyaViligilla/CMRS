import { useCallback } from 'react';
import { toast } from 'react-toastify';

import { deleteStudyCases } from '@/helpers/axiosCalls';

export const useDeleteCase = (
  setCurrentUserCases: React.Dispatch<React.SetStateAction<any[]>>
) => {
  const deleteCase = useCallback(
    async (id: string) => {
      try {
        await deleteStudyCases(id);
        setCurrentUserCases((prevCases) =>
          prevCases.filter((studyCase) => studyCase._id !== id)
        );
      } catch (error) {
        toast.error('Error deleting study case');
      }
    },
    [setCurrentUserCases]
  );

  return deleteCase;
};
