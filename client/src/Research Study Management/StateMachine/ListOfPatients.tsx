import React, { useCallback, useEffect, useState } from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Progress,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  useDisclosure,
  Divider,
  CircularProgress,
  Chip,
  Tooltip,
} from '@nextui-org/react';
import { FcApproval, FcDisapprove } from 'react-icons/fc';
import { MdSkipNext } from 'react-icons/md';
import { FcViewDetails } from 'react-icons/fc';

import { Stage } from '../Stages/StageButton';
import SearchFilterComponent from '../Stages/filter';

import { CommentDisplay } from './CommentBox';

import {
  getAllStudyCases,
  approvePhase,
  disapprovePhase,
  endStage,
} from '@/helpers/axiosCalls';
import DefaultLayout from '@/layouts/default';
import { PatientProgress, StudyCase } from '@/types';
import UserAvatar from '@/components/UserProfileImage';

export default function ListOfPatients({ userType }: any) {
  const [studyCases, setStudyCases] = useState<StudyCase[]>([]);
  const [filteredStudyCases, setFilteredStudyCases] = useState<StudyCase[]>([]);
  const [currentStudyCase, setCurrentStudyCase] = useState<StudyCase | null>(
    null
  );
  const [currentPatient, setCurrentPatient] = useState<string>('');
  const [currentStage, setCurrentStage] = useState(1);
  const [allStagesCompleted, setAllStagesCompleted] = useState(false);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [displayStage, setDisplayStage] = useState(1);
  const [loadingPhases, setLoadingPhases] = useState<{
    [key: string]: boolean;
  }>({});
  const userInfoString = localStorage.getItem('user');
  const userInfo = userInfoString ? JSON.parse(userInfoString) : null;
  const userEmail = userInfo?.email;

  useEffect(() => {
    fetchStudyCases();
  }, []);

  const fetchStudyCases = async () => {
    try {
      const res = await getAllStudyCases();
      const cases: StudyCase[] = Array.isArray(res.data) ? res.data : [];
      setStudyCases(cases);
      setFilteredStudyCases(cases);
    } catch (error) {
      console.error('Error fetching study cases:', error);
      setStudyCases([]);
      setFilteredStudyCases([]);
    }
  };
  const handleSearch = useCallback(
    (searchTerm: string, filterType: string) => {
      let filtered = studyCases;

      if (searchTerm) {
        filtered = filtered.filter(
          (studyCase) =>
            studyCase.currentPatients.some((patient) =>
              patient.includes(searchTerm)
            ) || studyCase.researcherEmailId.includes(searchTerm)
        );
      }

      switch (filterType) {
        case 'myStudies':
          filtered = filtered.filter(
            (studyCase) => studyCase.researcherEmailId === userEmail
          );
          break;
        case 'otherStudies':
          filtered = filtered.filter(
            (studyCase) => studyCase.researcherEmailId !== userEmail
          );
          break;
        case 'byPatient':
          filtered = filtered.filter((studyCase) =>
            studyCase.currentPatients.some((patient) =>
              patient.includes(searchTerm)
            )
          );
          break;
        case 'byResearcher':
          filtered = filtered.filter((studyCase) =>
            studyCase.researcherEmailId.includes(searchTerm)
          );
          break;
      }

      setFilteredStudyCases(filtered);
    },
    [studyCases, userEmail]
  );
  const fetchLatestStudyCase = async (studyCaseId: string) => {
    try {
      const res = await getAllStudyCases();
      const cases: StudyCase[] = Array.isArray(res.data) ? res.data : [];
      const updatedStudyCase = cases.find((sc) => sc._id === studyCaseId);
      if (updatedStudyCase) {
        setCurrentStudyCase(updatedStudyCase);
        updateCurrentStage(updatedStudyCase);
        setStudyCases((prevCases) =>
          prevCases.map((sc) =>
            sc._id === studyCaseId ? updatedStudyCase : sc
          )
        );
      }
    } catch (error) {
      console.error('Error fetching latest study case:', error);
    }
  };

  const calculateStageStatus = useCallback((stage: any) => {
    if (stage.phases.every((phase: any) => phase.checkPhase)) {
      return 'completed';
    } else if (stage.phases.some((phase: any) => phase.checkPhase)) {
      return 'active';
    } else {
      return 'pending';
    }
  }, []);

  const calculateCurrentStage = useCallback(
    (progress: PatientProgress) => {
      for (let i = 0; i < progress.stages.length; i++) {
        const stageStatus = calculateStageStatus(progress.stages[i]);
        if (stageStatus === 'active' || stageStatus === 'pending') {
          return i + 1;
        }
      }

      return progress.stages.length;
    },
    [calculateStageStatus]
  );

  const updateCurrentStage = useCallback(
    (studyCase: StudyCase) => {
      const patientProgress = studyCase.patientProgress.find(
        (progress) => progress.patientEmail === currentPatient
      );
      if (patientProgress) {
        const newStage = calculateCurrentStage(patientProgress);
        setCurrentStage(newStage);

        let stageToDisplay = newStage;
        if (
          newStage > 1 &&
          calculateStageStatus(patientProgress.stages[newStage - 2]) ===
            'completed'
        ) {
          stageToDisplay = Math.min(newStage, patientProgress.stages.length);
        }
        setDisplayStage(stageToDisplay);

        setAllStagesCompleted(
          newStage === patientProgress.stages.length &&
            calculateStageStatus(patientProgress.stages[newStage - 1]) ===
              'completed'
        );
      } else {
        setCurrentStage(1);
        setDisplayStage(1);
        setAllStagesCompleted(false);
      }
    },
    [currentPatient, calculateCurrentStage, calculateStageStatus]
  );

  useEffect(() => {
    if (currentStudyCase) {
      updateCurrentStage(currentStudyCase);
    }
  }, [currentStudyCase, currentPatient, updateCurrentStage]);

  const handleApprovePhase = async (
    studyCaseId: string,
    patientEmail: string,
    stageIndex: number,
    phaseIndex: number
  ) => {
    const loadingKey = `${studyCaseId}-${patientEmail}-${stageIndex}-${phaseIndex}`;
    setLoadingPhases((prev) => ({ ...prev, [loadingKey]: true }));

    try {
      const response = await approvePhase(
        studyCaseId,
        patientEmail,
        stageIndex,
        phaseIndex
      );
      setCurrentStudyCase(response.studyCase);
      const updatedPatientProgress = response.studyCase.patientProgress.find(
        (progress: any) => progress.patientEmail === patientEmail
      );

      if (updatedPatientProgress) {
        const currentStageProgress = updatedPatientProgress.stages[stageIndex];
        const allPhasesCompleted = currentStageProgress.phases.every(
          (phase: any) => phase.checkPhase
        );

        if (allPhasesCompleted) {
          const nextStageIndex = stageIndex + 1;
          if (nextStageIndex < updatedPatientProgress.stages.length) {
            setCurrentStage(nextStageIndex + 1);
          } else {
            setAllStagesCompleted(true);
          }
        }
      }
    } catch (error) {
      console.error('Error approving phase:', error);
    } finally {
      setLoadingPhases((prev) => ({ ...prev, [loadingKey]: false }));
    }
  };

  const handleDisapprovePhase = async (
    studyCaseId: string,
    patientEmail: string,
    stageIndex: number,
    phaseIndex: number
  ) => {
    const loadingKey = `${studyCaseId}-${patientEmail}-${stageIndex}-${phaseIndex}`;
    setLoadingPhases((prev) => ({ ...prev, [loadingKey]: true }));
    try {
      await disapprovePhase(studyCaseId, patientEmail, stageIndex, phaseIndex);
      await fetchLatestStudyCase(studyCaseId);
    } catch (error) {
      console.error('Error disapproving phase:', error);
    } finally {
      setLoadingPhases((prev) => ({ ...prev, [loadingKey]: false }));
    }
  };

  const handleEndStage = async () => {
    if (!currentStudyCase || !currentPatient) return;

    try {
      const response = await endStage(
        currentStudyCase._id,
        currentStage - 1,
        currentPatient
      );

      setCurrentStudyCase(response.studyCase);

      const updatedPatientProgress = response.studyCase.patientProgress.find(
        (progress: any) => progress.patientEmail === currentPatient
      );

      if (updatedPatientProgress) {
        const nextActiveStage = updatedPatientProgress.stages.find(
          (stage: any) => stage.status === 'active'
        );

        if (nextActiveStage) {
          setCurrentStage(nextActiveStage.stageIndex + 1);
        } else {
          setAllStagesCompleted(true);
        }
      }
      await fetchLatestStudyCase(currentStudyCase._id);
    } catch (error) {
      console.error('Error ending stage:', error);
    }
  };

  const handleStageClick = (stage: number) => {
    if (!allStagesCompleted) {
      setCurrentStage(stage);
    }
  };

  const handleViewStages = (studyCase: StudyCase, patient: string) => {
    setCurrentStudyCase(studyCase);
    setCurrentPatient(patient);
    setAllStagesCompleted(false);
    updateCurrentStage(studyCase);
    onOpen();
  };

  const isFirstPhaseApproved = useCallback(
    (studyCase: StudyCase, patientEmail: string): boolean => {
      const patientProgress = studyCase.patientProgress.find(
        (progress) => progress.patientEmail === patientEmail
      );
      if (!patientProgress || patientProgress.stages.length === 0) return false;
      const firstStage = patientProgress.stages[0];
      return firstStage.phases.length > 0 && firstStage.phases[0].checkPhase;
    },
    []
  );

  const renderStageContent = () => {
    if (!currentStudyCase) return null;

    const patientProgress = currentStudyCase.patientProgress.find(
      (progress) => progress.patientEmail === currentPatient
    ) || {
      stages: currentStudyCase.stages.map((stage) => ({
        phases: stage.phases.map((phase) => ({ ...phase, checkPhase: false })),
      })),
    };

    const allStagesCompleted = patientProgress.stages.every((stage) =>
      stage.phases.every((phase) => phase.checkPhase)
    );

    if (allStagesCompleted) {
      return (
        <div className="flex flex-col gap-6 p-4 sm:p-6">
          <h2 className="text-2xl font-bold text-center text-purple-600">
            All Stages Completed for `{currentPatient}`
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {currentStudyCase.stages.map((stage, stageIndex) => (
              <Card key={stageIndex}>
                <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 sm:p-4">
                  <h3 className="text-xl sm:text-2xl font-semibold text-purple-600">
                    State {stageIndex + 1}
                  </h3>
                  <span className="text-sm font-semibold mt-1 sm:mt-0 mb-4">
                    Completed
                  </span>
                  <Chip className="mb-4" variant="dot">
                    Description
                  </Chip>
                  <h1 className="text-sm text font-semibold text-purple-600">
                    {stage.stageDescription}
                  </h1>
                </CardHeader>
                <CardBody className="p-3 sm:p-4">
                  <Divider className="my-2" />
                  {stage.phases.map((phase, phaseIndex) => (
                    <div key={phaseIndex} className="mt-3 sm:mt-4">
                      <div className="flex justify-between items-center">
                        <Chip color="secondary" variant="dot">
                          -- {phase.phaseName} --
                        </Chip>
                        <CircularProgress
                          showValueLabel
                          className="mt-1"
                          color="success"
                          size="lg"
                          value={100}
                        />
                      </div>
                      <CommentDisplay
                        currentPatientEmail={currentPatient}
                        currentPhase={phaseIndex + 1}
                        currentStage={stageIndex + 1}
                        currentStudyName={currentStudyCase._id}
                        currentUserEmail={currentStudyCase.researcherEmailId}
                        showAddNewComment={false}
                      />
                    </div>
                  ))}
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      );
    }
    const showEndStageButton = isFirstPhaseApproved(
      currentStudyCase,
      currentPatient
    );

    return (
      <div className="p-8 flex flex-col gap-6">
        <div className="text-center">
          <h2 className="text-xl md:text-2xl font-bold mb-2">
            State {currentStage}
          </h2>
          <h1 className="text-xl font-thin text-center mb-8 text-purple-600">
            {currentStudyCase.stages[currentStage - 1]?.stageDescription || ''}
          </h1>
        </div>

        <div className="flex justify-between w-full">
          {Array.from(
            { length: parseInt(currentStudyCase.numberOfStages, 10) },
            (_, index) => (
              <React.Fragment key={`stage-group-${index}`}>
                <Stage
                  key={`stage-${index}`}
                  isActive={displayStage === index + 1}
                  isCompleted={
                    calculateStageStatus(patientProgress.stages[index]) ===
                    'completed'
                  }
                  number={index + 1}
                  onClick={() => handleStageClick(index + 1)}
                />
                {index < parseInt(currentStudyCase.numberOfStages, 10) - 1 && (
                  <Progress
                    key={`progress-${index}`}
                    aria-hidden="true"
                    color={
                      calculateStageStatus(patientProgress.stages[index]) ===
                      'completed'
                        ? 'success'
                        : 'default'
                    }
                    radius="sm"
                    size="sm"
                    value={
                      calculateStageStatus(patientProgress.stages[index]) ===
                      'completed'
                        ? 100
                        : 0
                    }
                  />
                )}
              </React.Fragment>
            )
          )}
        </div>

        <div className="p-4">
          <h3 className="text-lg font-semibold mb-2">Status:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentStudyCase.stages[currentStage - 1]?.phases.map(
              (phase, phaseIndex) => {
                const phaseProgress =
                  patientProgress.stages[currentStage - 1]?.phases[phaseIndex];
                const previousPhaseApproved =
                  phaseIndex === 0 ||
                  patientProgress.stages[currentStage - 1]?.phases[
                    phaseIndex - 1
                  ]?.checkPhase;

                if (!previousPhaseApproved) return null;

                const loadingKey = `${currentStudyCase._id}-${currentPatient}-${currentStage - 1}-${phaseIndex}`;
                const isLoading = loadingPhases[loadingKey];

                return (
                  <Card
                    key={phaseIndex}
                    className="w-full max-w-xl mx-auto p-4 space-y-4 "
                  >
                    <div className="flex justify-between items-center">
                      <h1>{phase.phaseName}</h1>
                      <CircularProgress
                        showValueLabel
                        aria-label="Phase Progress"
                        color={
                          phaseProgress?.checkPhase ? 'success' : 'warning'
                        }
                        size="lg"
                        value={phaseProgress?.checkPhase ? 100 : 0}
                      />
                    </div>

                    <CommentDisplay
                      currentPatientEmail={currentPatient}
                      currentPhase={phaseIndex + 1}
                      currentStage={currentStage}
                      currentStudyName={currentStudyCase._id}
                      currentUserEmail={userInfo.email}
                      phaseProgress={!phaseProgress?.checkPhase}
                      showAddNewComment={true}
                    />
                    <Divider />
                    {userType !== 'patient' && (
                      <>
                        {userEmail === currentStudyCase.researcherEmailId && (
                          <Button
                            fullWidth
                            color={
                              phaseProgress?.checkPhase ? 'danger' : 'secondary'
                            }
                            isLoading={isLoading}
                            size="lg"
                            onClick={() =>
                              phaseProgress?.checkPhase
                                ? handleDisapprovePhase(
                                    currentStudyCase._id,
                                    currentPatient,
                                    currentStage - 1,
                                    phaseIndex
                                  )
                                : handleApprovePhase(
                                    currentStudyCase._id,
                                    currentPatient,
                                    currentStage - 1,
                                    phaseIndex
                                  )
                            }
                          >
                            {phaseProgress?.checkPhase ? (
                              <>
                                Dis-Approve <FcDisapprove size={40} />
                              </>
                            ) : (
                              <>
                                Approve <FcApproval size={40} />
                              </>
                            )}
                          </Button>
                        )}
                      </>
                    )}
                  </Card>
                );
              }
            )}
          </div>
        </div>
        {userType !== 'patient' && (
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            {userEmail === currentStudyCase.researcherEmailId && (
              <>
                {showEndStageButton && (
                  <Button
                    className="w-full sm:w-auto"
                    color="warning"
                    onClick={handleEndStage}
                  >
                    Skip State - {currentStage} <MdSkipNext size={40} />
                  </Button>
                )}
              </>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderStudyCase = (studyCase: StudyCase) => (
    <Card
      key={studyCase._id}
      className="w-full bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-md"
    >
      <CardHeader className="flex flex-col gap-3 bg-purple-200 text-purple-800">
        <h2 className="text-xl font-semibold text-purple-700 dark:text-purple-300">
          {studyCase.consentName}
        </h2>
        <p className="text-sm">Study Design</p>
        <div className="flex items-center space-x-2">
          <UserAvatar
            description={studyCase.studyTypes.join(', ')}
            email={studyCase.researcherEmailId}
          />
        </div>
      </CardHeader>
      <Divider />
      <CardBody className="pt-4">
        <p className="mb-2">
          <span className="font-semibold text-indigo-600 dark:text-indigo-400">
            Details:
          </span>
          {studyCase.details}
        </p>
        <p className="mb-4">
          <span className="font-semibold text-indigo-600 dark:text-indigo-400">
            Number of Stages:
          </span>
          {studyCase.numberOfStages}
        </p>
        <Divider className="my-4" />
        {userType === 'patient' ? (
          <>
            <h3 className="text-lg font-semibold mb-3 text-purple-600 dark:text-purple-400">
              You Enrolled in
            </h3>
          </>
        ) : (
          <>
            <h3 className="text-lg font-semibold mb-3 text-purple-600 dark:text-purple-400">
              Patients Enrolled
            </h3>
          </>
        )}

        <div className="space-y-4">
          {studyCase.currentPatients
            .filter((patient) =>
              userType === 'patient' ? patient === userEmail : true
            )
            .map((patient, patientIndex) => (
              <div
                key={patientIndex}
                className="flex items-center justify-between p-3 rounded-lg shadow-sm bg-gray-50 dark:bg-gray-800"
              >
                <UserAvatar
                  description="Patient"
                  email={patient.split('@')[0]}
                />
                <Tooltip content="View Stages">
                  <Button
                    className="bg-purple-200 text-purple-600 hover:bg-purple-100 transition-colors"
                    onPress={() => handleViewStages(studyCase, patient)}
                  >
                    <FcViewDetails size={30} />
                  </Button>
                </Tooltip>
              </div>
            ))}
        </div>
      </CardBody>
    </Card>
  );

  return (
    <DefaultLayout>
      <SearchFilterComponent
        userType={userType}
        onFilter={handleSearch}
        onSearch={handleSearch}
      />
      {userType === 'patient' ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6 p-6">
            {filteredStudyCases
              .filter((studyCase) =>
                studyCase.currentPatients.includes(userEmail)
              )
              .map(renderStudyCase)}
          </div>
        </>
      ) : (
        <>
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-purple-600 dark:text-purple-400">
              Your Study Design
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6 p-6">
              {filteredStudyCases
                .filter(
                  (studyCase) => studyCase.researcherEmailId === userEmail
                )
                .map(renderStudyCase)}
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-purple-600 dark:text-purple-400">
              Other Study Design
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6 p-6">
              {filteredStudyCases
                .filter(
                  (studyCase) => studyCase.researcherEmailId !== userEmail
                )
                .map(renderStudyCase)}
            </div>
          </div>
        </>
      )}

      <Modal
        isDismissable={false}
        isOpen={isOpen}
        placement="bottom-center"
        scrollBehavior="inside"
        size="full"
        onOpenChange={onOpenChange}
      >
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-col gap-1 m-2">
                {allStagesCompleted ? 'All States Completed' : 'View States'}
              </ModalHeader>
              <ModalBody className="p-6 m-5">{renderStageContent()}</ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </DefaultLayout>
  );
}
