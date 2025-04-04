import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Chip,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tooltip,
} from '@nextui-org/react';
import { FcFullTrash } from 'react-icons/fc';

import Stages from '../Stages/ViewStages';

import { useDeleteCase } from './DeleteStudyCase';
import UpdateStudyDesignModal from './UpdateStudyCase';

import { getAllStudyCases } from '@/helpers/axiosCalls';
import { StudyData } from '@/types';
import { getUserFromLocalStorage } from '@/helpers/commonLogic';
import UserAvatar from '@/components/UserProfileImage';

interface StudyCase extends StudyData {
  _id: string;
  researcherEmailId: string;
  currentPatients: any[];
}

interface GetStudyCaseProps {
  filter: 'getLast2' | 'all' | 'allSplit' | string;
  studyAdded?: boolean;
}

const columns = [
  { name: 'STUDY NAME', uid: 'consentName' },
  { name: 'RESEARCHER', uid: 'researcherEmailId' },
  { name: 'STAGES', uid: 'numberOfStages' },
  // { name: 'ACTIONS', uid: 'actions' },
];

export default function GetStudyCase({
  filter,
  studyAdded,
}: GetStudyCaseProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [studyCases, setStudyCases] = useState<StudyCase[]>([]);
  const [currentUserCases, setCurrentUserCases] = useState<StudyCase[]>([]);
  const [otherCases, setOtherCases] = useState<StudyCase[]>([]);
  const [updateTrigger, setUpdateTrigger] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const user = getUserFromLocalStorage();
  const userEmail = user?.email;
  const deleteCase = useDeleteCase(setCurrentUserCases);
  const handleStudyUpdate = useCallback(() => {
    setUpdateTrigger((prev) => prev + 1);
  }, []);

  useEffect(() => {
    const getStudyData = async () => {
      try {
        setIsLoading(true);
        const res = await getAllStudyCases();
        let data: StudyCase[];
        if (Array.isArray(res.data.studyCases)) {
          data = res.data.studyCases;
        } else if (Array.isArray(res.data)) {
          data = res.data;
        } else {
          throw new Error('Unexpected data format');
        }

        let filteredData: StudyCase[];
        if (filter === 'getLast2') {
          filteredData = data.slice(-2);
        } else if (filter === 'all') {
          filteredData = data;
        } else if (filter === 'allSplit') {
          const currentUserCases = data.filter(
            (study) => study.researcherEmailId === userEmail
          );
          const otherCases = data.filter(
            (study) => study.researcherEmailId !== userEmail
          );
          setCurrentUserCases(currentUserCases);
          setOtherCases(otherCases);
          filteredData = [...currentUserCases, ...otherCases];
        } else {
          filteredData = data.filter(
            (study) => study.researcherEmailId === filter
          );
        }

        setStudyCases(filteredData);
      } catch (error) {
        console.error('Error fetching study cases:', error);
        setError('Failed to fetch study cases. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    getStudyData();
  }, [filter, studyAdded, updateTrigger]);

  const renderCell = useCallback(
    (studyCase: any, columnKey: any) => {
      const cellValue = studyCase[columnKey];

      switch (columnKey) {
        case 'consentName':
          return <h2> {studyCase.consentName}</h2>;
        case 'researcherEmailId':
          return (
            <UserAvatar
              description={studyCase.studyTypes.join(', ')}
              email={cellValue}
            />
          );
        case 'numberOfStages':
          return (
            <>
              <div className="relative flex items-center gap-1 ">
                {userEmail === studyCase.researcherEmailId && (
                  <>
                    <UpdateStudyDesignModal
                      studyCase={studyCase}
                      onStudyUpdated={handleStudyUpdate}
                    />
                    <Tooltip content="Delete">
                      <Button
                        className="bg-purple-200 text-purple-600 hover:bg-purple-100 transition-colors"
                        onPress={() => deleteCase(studyCase._id)}
                      >
                        <FcFullTrash size={40} />
                      </Button>
                    </Tooltip>
                  </>
                )}
                <Stages studyCase={studyCase} /> {cellValue} States
              </div>
            </>
          );

        default:
          return cellValue;
      }
    },
    [deleteCase, handleStudyUpdate, userEmail]
  );

  if (isLoading) {
    return (
      <div className="text-center p-4 md:p-8">
        <Spinner color="warning" label="Loading..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-4 md:p-8">
        <p className="text-lg md:text-xl text-red-600">{error}</p>
      </div>
    );
  }

  if (studyCases.length === 0) {
    return (
      <div className="text-center p-4 md:p-8">
        <p className="text-lg md:text-xl text-gray-600">
          No study cases found.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl px-4 md:px-0">
      {filter === 'allSplit' ? (
        <div className="space-y-8">
          {currentUserCases.length > 0 && (
            <>
              <Chip
                className="text-2xl font-bold mb-4"
                color="secondary"
                variant="dot"
              >
                Your Study Designs
              </Chip>
              <Table aria-label="Your study cases" className="mb-4">
                <TableHeader columns={columns}>
                  {(column) => (
                    <TableColumn key={column.uid} className="text-center">
                      {column.name}
                    </TableColumn>
                  )}
                </TableHeader>
                <TableBody items={currentUserCases}>
                  {(item) => (
                    <TableRow key={item._id}>
                      {(columnKey) => (
                        <TableCell>{renderCell(item, columnKey)}</TableCell>
                      )}
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </>
          )}

          {otherCases.length > 0 && (
            <>
              <Chip className="text-2xl font-bold ">Other Study Designs</Chip>

              <div className="overflow-x-auto">
                <Table aria-label="Other study cases">
                  <TableHeader columns={columns}>
                    {(column) => (
                      <TableColumn key={column.uid}>{column.name}</TableColumn>
                    )}
                  </TableHeader>
                  <TableBody items={otherCases}>
                    {(item) => (
                      <TableRow key={item._id}>
                        {(columnKey) => (
                          <TableCell>{renderCell(item, columnKey)}</TableCell>
                        )}
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </>
          )}

          {currentUserCases.length === 0 && otherCases.length === 0 && (
            <div className="text-center p-4 md:p-8">
              <p className="text-lg md:text-xl text-gray-600">
                No study cases found.
              </p>
            </div>
          )}
        </div>
      ) : (
        studyCases.map((studyCase) => (
          <div key={studyCase._id}>
            <ul className="space-y-2">
              <li className="flex justify-between items-center mb-2">
                <span>{studyCase.consentName}</span>
                {userEmail === studyCase.researcherEmailId ? (
                  <h3>CreatedBy You</h3>
                ) : (
                  <>{studyCase.researcherEmailId}</>
                )}
              </li>
            </ul>
          </div>
        ))
      )}
    </div>
  );
}
