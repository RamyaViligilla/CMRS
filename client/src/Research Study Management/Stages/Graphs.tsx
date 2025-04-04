import React from 'react';
import {
  Card,
  Progress,
  Accordion,
  AccordionItem,
  Chip,
} from '@nextui-org/react';
import { FcDocument, FcApproval, FcBusinessman, FcInfo } from 'react-icons/fc';

interface Phase {
  phaseIndex: number;
  checkPhase: boolean;
}

interface PatientStageProgress {
  stageIndex: number;
  phases: Phase[];
}

interface PatientProgress {
  patientEmail: string;
  stages: PatientStageProgress[];
}

interface Stage {
  _id: string;
  stageDescription: string;
  approvalStatus: string;
  approvedBy: string;
  phases: any[];
}

interface StudyCase {
  _id: string;
  consentName: string;
  studyTypes: string[];
  details: string;
  numberOfStages: string;
  stages: Stage[];
  researcherEmailId: string;
  currentPatients: string[];
  patientProgress: PatientProgress[];
}

interface StudyProgressDashboardProps {
  studyCases: StudyCase[];
}

const StudyProgressDashboard: React.FC<StudyProgressDashboardProps> = ({
  studyCases,
}) => {
  const userInfoString = localStorage.getItem('user');
  const userInfo = userInfoString ? JSON.parse(userInfoString) : null;
  const userEmail = userInfo?.email;
  console.log(JSON.stringify(studyCases, null, 2));

  const calculateProgress = (
    patientProgress: PatientProgress,
    totalStages: number
  ) => {
    const completedStages = patientProgress.stages.filter((stage) =>
      stage.phases.every((phase) => phase.checkPhase)
    ).length;
    return Math.round((completedStages / totalStages) * 100);
  };

  const renderStudyCase = (studyCase: StudyCase) => (
    <Card
      key={studyCase._id}
      className="p-6 mb-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-md"
    >
      <div className="flex items-center mb-4">
        <FcDocument className="w-8 h-8 mr-3" />
        <h2 className="text-2xl font-bold text-blue-800">
          {studyCase.consentName}
        </h2>
      </div>
      <Accordion>
        {studyCase.patientProgress.map((patient, index) => (
          <AccordionItem
            key={index}
            aria-label={`Patient ${patient.patientEmail}`}
            title={
              <div className="flex justify-between items-center w-full">
                <div className="flex items-center">
                  <FcBusinessman className="w-6 h-6 mr-2" />
                  <span className="font-semibold">
                    {patient.patientEmail.split('@')[0]}
                  </span>
                </div>
                <div className="flex items-center">
                  <FcApproval className="w-5 h-5 mr-2" />
                  <span className="text-sm font-semibold bg-blue-200 text-blue-800 px-2 py-1 rounded-full">
                    {calculateProgress(patient, studyCase.stages.length)}%
                    Complete
                  </span>
                </div>
              </div>
            }
          >
            <div className="space-y-6 mt-4">
              {studyCase.stages.map((stage, stageIndex) => {
                const patientStage = patient.stages.find(
                  (s) => s.stageIndex === stageIndex
                );
                const completedPhases = patientStage
                  ? patientStage.phases.filter((phase) => phase.checkPhase)
                      .length
                  : 0;
                const totalPhases = stage.phases.length;
                const stageProgress = Math.round(
                  (completedPhases / totalPhases) * 100
                );

                return (
                  <div
                    key={stage._id}
                    className="bg-white p-4 rounded-lg shadow"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center">
                        <FcInfo className="w-5 h-5 mr-2" />
                        <span className="font-semibold text-blue-700">
                          Stage {stageIndex + 1}
                        </span>
                      </div>
                      <span className="text-sm font-semibold bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        {stageProgress}% Complete
                      </span>
                    </div>
                    <Progress
                      aria-label={`Stage ${stageIndex + 1} progress`}
                      className="h-2"
                      color="success"
                      value={stageProgress}
                    />
                    <div className="mt-2 text-sm text-gray-600">
                      {completedPhases} of {totalPhases} phases completed
                    </div>
                    <div className="text-sm text-purple-700">
                      {stage.stageDescription}
                    </div>
                  </div>
                );
              })}
            </div>
          </AccordionItem>
        ))}
      </Accordion>
    </Card>
  );

  const userStudyCases = studyCases.filter(
    (studyCase) => studyCase.researcherEmailId === userEmail
  );
  const otherStudyCases = studyCases.filter(
    (studyCase) => studyCase.researcherEmailId !== userEmail
  );

  const chunkArray = (arr: StudyCase[], size: number) => {
    return Array.from({ length: Math.ceil(arr.length / size) }, (_v, i) =>
      arr.slice(i * size, i * size + size)
    );
  };

  return (
    <div className="space-y-8">
      {userStudyCases.length > 0 && (
        <div>
          <Chip
            className="text-2xl font-bold mb-4"
            color="secondary"
            variant="dot"
          >
            Your Study Designs
          </Chip>

          {chunkArray(userStudyCases, 3).map((row, rowIndex) => (
            <div key={rowIndex} className="flex flex-wrap -mx-2 mb-4">
              {row.map((studyCase) => (
                <div key={studyCase._id} className="w-full md:w-1/3 px-2 mb-4">
                  {renderStudyCase(studyCase)}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
      {otherStudyCases.length > 0 && (
        <div>
          <Chip className="text-2xl font-bold mb-4">Other Study Designs</Chip>
          {chunkArray(otherStudyCases, 3).map((row, rowIndex) => (
            <div key={rowIndex} className="flex flex-wrap -mx-2 mb-4">
              {row.map((studyCase) => (
                <div key={studyCase._id} className="w-full md:w-1/3 px-2 mb-4">
                  {renderStudyCase(studyCase)}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudyProgressDashboard;
