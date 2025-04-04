import React, { useEffect, useState } from 'react';
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Tooltip,
  useDisclosure,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Progress,
  Chip,
} from '@nextui-org/react';
import { AxiosResponse } from 'axios';
import { toast } from 'react-toastify';
import { FcFullTrash, FcPlus, FcViewDetails } from 'react-icons/fc';

import { Stage } from './StageButton';

import { UserData } from '@/types';
import {
  addPatientToStage,
  getPatients,
  removePatientFromStage,
} from '@/helpers/axiosCalls';
import UserAvatar from '@/components/UserProfileImage';

interface Stage {
  stageDescription: string;
  approvalStatus: string;
  approvedBy: string;
  _id: string;
}

interface StudyCase {
  _id: string;
  researcherEmailId: string;
  currentPatients: any[];
  consentName: string;
  studyTypes: string[];
  numberOfStages: string | number;
  details: string;
  stages: Stage[];
  picture: string;
}

const Stages: React.FC<{ studyCase: StudyCase }> = ({ studyCase }) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [currentStage, setCurrentStage] = useState(1);
  const [currentStudyCase, setCurrentStudyCase] =
    useState<StudyCase>(studyCase);
  const [patients, setPatients] = useState<UserData[]>([]);
  const userInfoString = localStorage.getItem('user');
  const userInfo = userInfoString ? JSON.parse(userInfoString) : null;
  const userEmail = userInfo?.email;

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await getPatients();
        setPatients(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.error('Error fetching patients:', error);
        setPatients([]);
      }
    };
    fetchPatients();
  }, []);

  const handleStageClick = (stage: number): void => {
    setCurrentStage(stage);
  };

  const addPatient = async (patientEmail: any, studyCaseId: string) => {
    try {
      const data = { patientEmail, studyCaseId };

      const response: AxiosResponse<any> = await addPatientToStage(data);

      setCurrentStudyCase((prevState) => ({
        ...prevState,
        currentPatients: [...prevState.currentPatients, patientEmail],
      }));

      return response.data;
    } catch (error: any) {
      toast.error(error.response.data.message);
    }
  };

  const removePatient = async (patientEmail: string, studyCaseId: string) => {
    try {
      const data = { patientEmail, studyCaseId };
      const response: AxiosResponse<any> = await removePatientFromStage(data);
      setCurrentStudyCase((prevState) => ({
        ...prevState,
        currentPatients: prevState.currentPatients.filter(
          (email) => email !== patientEmail
        ),
      }));

      return response.data;
    } catch (error: any) {
      toast.error(error.response.data.message);
    }
  };

  const totalStages =
    typeof studyCase.numberOfStages === 'string'
      ? parseInt(studyCase.numberOfStages, 10)
      : studyCase.numberOfStages;

  const patientsToAdd = patients.filter(
    (patient) => !currentStudyCase.currentPatients.includes(patient.userEmailId)
  );
  return (
    <>
      <Tooltip content="View Stages">
        <Button
          className="bg-purple-200 text-purple-600 hover:bg-purple-100 transition-colors"
          onPress={onOpen}
        >
          <FcViewDetails size={40} />
        </Button>
      </Tooltip>
      <Modal
        isDismissable={false}
        isOpen={isOpen}
        placement="bottom-center"
        scrollBehavior="inside"
        size="4xl"
        onOpenChange={onOpenChange}
      >
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                View Stages
              </ModalHeader>
              <ModalBody>
                <div className="flex flex-col gap-6">
                  <Card className="w-full max-w-3xl mx-auto">
                    <CardHeader className="flex flex-col items-center pb-2">
                      <h1 className="text-2xl font-bold text-center text-purple-600">
                        Study Details
                      </h1>
                    </CardHeader>
                    <Divider className="my-2" />
                    <CardBody className="text-center">
                      <div className="mb-6">
                        <h2 className="text-xl font-bold text-center mb-4">
                          Description
                        </h2>
                        <Chip color="secondary" variant="dot">
                          {studyCase.details}
                        </Chip>
                      </div>

                      <Divider className="my-4" />

                      <div className="mt-6">
                        <h2 className="text-xl md:text-2xl font-bold mb-3">
                          Stage {currentStage}
                        </h2>
                        <Card className="shadow-md">
                          <CardBody>
                            <h1 className="text-xl font-thin text-center mb-8 text-purple-600">
                              {studyCase.stages[currentStage - 1]
                                ?.stageDescription ||
                                'No description available'}
                            </h1>
                          </CardBody>
                        </Card>
                      </div>
                    </CardBody>
                  </Card>
                  <div className="flex justify-between w-full">
                    {Array.from({ length: totalStages }, (_, index) => (
                      <React.Fragment key={`stage-group-${index}`}>
                        <Stage
                          key={`stage-${index}`}
                          isActive={currentStage === index + 1}
                          isCompleted={currentStage > index + 1}
                          number={index + 1}
                          onClick={() => handleStageClick(index + 1)}
                        />
                        {index < totalStages - 1 && (
                          <Progress
                            key={`progress-${index}`}
                            aria-hidden="true"
                            className="w-full max-w-md"
                            color={
                              currentStage > index + 1 ? 'success' : 'default'
                            }
                            size="sm"
                            value={currentStage > index + 1 ? 100 : 0}
                          />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                  <div className="mt-6 space-y-6">
                    {currentStudyCase.currentPatients.length > 0 && (
                      <div className="p-4 rounded-lg shadow-md">
                        <h3 className="text-xl font-semibold mb-3">
                          Current Patients
                        </h3>
                        <div className="max-h-48 overflow-y-auto pr-2 space-y-2">
                          {currentStudyCase.currentPatients.map(
                            (patientEmail: any, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between p-2 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md"
                              >
                                <UserAvatar
                                  description="Patient"
                                  email={patientEmail}
                                />
                                {userEmail ===
                                currentStudyCase.researcherEmailId ? (
                                  <Tooltip content="Remove">
                                    <Button
                                      className="transition-all duration-200 hover:bg-red-100 dark:hover:bg-red-900"
                                      color="danger"
                                      size="sm"
                                      variant="flat"
                                      onPress={() =>
                                        removePatient(
                                          patientEmail,
                                          currentStudyCase._id
                                        )
                                      }
                                    >
                                      <FcFullTrash size={25} />
                                    </Button>
                                  </Tooltip>
                                ) : (
                                  <>Only Author can remove</>
                                )}
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                    {patientsToAdd.length > 0 && (
                      <div className="bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900 dark:to-teal-900 p-4 rounded-lg shadow-md">
                        <h3 className="text-xl font-semibold mb-3 text-green-700 dark:text-green-300">
                          Add Patients
                        </h3>
                        <div className="max-h-48 overflow-y-auto pr-2 space-y-2">
                          {patientsToAdd.map((patient, key) => (
                            <div
                              key={key}
                              className="flex items-center justify-between p-2 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md"
                            >
                              <UserAvatar
                                description="Patient"
                                email={patient?.userEmailId}
                              />
                              {userEmail ===
                              currentStudyCase.researcherEmailId ? (
                                <Tooltip content="Add">
                                  <Button
                                    className="transition-all duration-200 hover:bg-green-100 dark:hover:bg-green-900"
                                    color="success"
                                    size="sm"
                                    variant="flat"
                                    onPress={() =>
                                      addPatient(
                                        patient.userEmailId,
                                        currentStudyCase._id
                                      )
                                    }
                                  >
                                    <FcPlus size={25} />
                                  </Button>
                                </Tooltip>
                              ) : (
                                <>Only Author can Add</>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {currentStudyCase.currentPatients.length === 0 &&
                      patientsToAdd.length === 0 && (
                        <div className="text-center p-6 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-inner">
                          <p className="text-gray-500 dark:text-gray-400 italic">
                            No patients are currently available for this study.
                          </p>
                        </div>
                      )}
                  </div>
                </div>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default Stages;
