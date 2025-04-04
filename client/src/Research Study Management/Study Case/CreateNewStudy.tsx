import React, { useState } from 'react';
import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Input,
  Textarea,
  Select,
  SelectItem,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Avatar,
} from '@nextui-org/react';
import { toast } from 'react-toastify';
import {
  FcFullTrash,
  FcPlus,
  FcViewDetails,
  FcBiotech,
  FcTimeline,
  FcOrgUnit,
  FcIdea,
} from 'react-icons/fc';

import GetStudyCase from './GetStudyCase';

import {
  getUserFromLocalStorage,
  specializations,
  useNavigateTo,
} from '@/helpers/commonLogic';
import { StudyData } from '@/types';
import { addStudyCase } from '@/helpers/axiosCalls';

interface FormErrors {
  consentName?: string;
  studyTypes?: string;
  details?: string;
  numberOfStages?: string;
  stages?: string;
}

const initialStudyData: StudyData = {
  consentName: '',
  studyTypes: [],
  details: '',
  numberOfStages: '',
  stages: [],
};

const CreateNewStudy: React.FC = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [studyData, setStudyData] = useState<StudyData>(initialStudyData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [studyAdded, setStudyAdded] = useState(false);
  const user = getUserFromLocalStorage();
  const researcherEmailId = user ? user.email : null;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setStudyData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const onStudyAdded = () => {
    setStudyAdded((prev) => !prev);
  };
  const handleNumberOfStagesChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    const numStages = parseInt(value, 10);
    setStudyData((prev) => ({
      ...prev,
      numberOfStages: value,
      stages: isNaN(numStages) ? [] : Array(numStages).fill(''),
    }));
    setErrors((prev) => ({
      ...prev,
      numberOfStages: undefined,
      stages: undefined,
    }));
  };
  const NavigateToAllStudyCases = useNavigateTo('/allStudyCases');

  const handleStageChange = (index: number, value: string) => {
    setStudyData((prev) => ({
      ...prev,
      stages: prev.stages.map((stage, i) => (i === index ? value : stage)),
    }));
    setErrors((prev) => ({ ...prev, stages: undefined }));
  };
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    if (!studyData.consentName.trim()) {
      newErrors.consentName = 'Consent name is required';
      isValid = false;
    }

    if (studyData.studyTypes.length === 0) {
      newErrors.studyTypes = 'At least one study type must be selected';
      isValid = false;
    }

    if (!studyData.details.trim()) {
      newErrors.details = 'Study details are required';
      isValid = false;
    }

    if (!studyData.numberOfStages.trim()) {
      newErrors.numberOfStages = 'Number of stages is required';
      isValid = false;
    } else if (parseInt(studyData.numberOfStages, 10) <= 0) {
      newErrors.numberOfStages = 'Number of stages must be greater than 0';
      isValid = false;
    }

    if (studyData.stages.some((stage) => !stage.trim())) {
      newErrors.stages = 'All stage names must be filled';
      isValid = false;
    }

    setErrors(newErrors);

    return isValid;
  };
  const handleSubmit = async () => {
    if (validateForm()) {
      const { consentName, studyTypes, details, numberOfStages, stages } =
        studyData;
      const data = {
        consentName,
        studyTypes,
        details,
        numberOfStages,
        stages,
        researcherEmailId,
      };
      try {
        const response = await addStudyCase(data);
        toast.success(response.data.message);
        onStudyAdded();
        clearForm();
        onOpenChange();
      } catch (error: any) {
        toast.error(error.response.data.message);
      }
    }
  };

  const clearForm = () => {
    setStudyData(initialStudyData);
    setErrors({});
  };

  const handleCancel = () => {
    clearForm();
    onOpenChange();
  };

  return (
    <>
      <Card isFooterBlurred className="max-w-[440px]">
        <CardHeader className="justify-between">
          <div>
            <Avatar isBordered radius="full" size="md" />
          </div>
          <p>Research Studies</p>

          <Button
            className="bg-white text-purple-600 hover:bg-purple-100 transition-colors"
            color="primary"
            radius="full"
            size="sm"
            onPress={onOpen}
          >
            Create New Study
          </Button>
        </CardHeader>
        <CardBody className="px-3 py-0 text-small text-default-500">
          <p>
            Develop research case studies that explore topics of your interest
            within the medical field. Focus on areas such as innovative
            treatments, patient outcomes, or healthcare technology.
          </p>
          <span className="pt-2">
            #recentStudyCases
            <span aria-label="computer" className="py-2" role="img">
              💻
            </span>
          </span>
          <GetStudyCase filter="getLast2" studyAdded={studyAdded} />
        </CardBody>
        <CardFooter className=" bg-black/40 bottom-0 z-10 border-t-1 border-default-600 dark:border-default-100">
          <div className="flex flex-grow gap-2 items-center">
            <div className="flex flex-col">
              <p className="text-tiny text-white/60">Study Cases</p>
              <p className="text-tiny text-white/60">
                Do you want to see others ...?
              </p>
            </div>
          </div>
          <Button
            className="bg-white text-purple-600 hover:bg-purple-100 transition-colors"
            radius="full"
            size="sm"
            onPress={NavigateToAllStudyCases}
          >
            Get Study cases
          </Button>
        </CardFooter>
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
                  Create New Study
                </ModalHeader>
                <ModalBody>
                  <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="col-span-1 md:col-span-2">
                      <Input
                        isRequired
                        className="w-full"
                        errorMessage={errors.consentName}
                        isInvalid={!!errors.consentName}
                        label="Related Consent Name"
                        name="consentName"
                        placeholder="Enter consent name"
                        value={studyData.consentName}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="col-span-1">
                      <Select
                        isRequired
                        className="w-full"
                        errorMessage={errors.studyTypes}
                        isInvalid={!!errors.studyTypes}
                        label="Study Types"
                        placeholder="Select study types"
                        selectedKeys={new Set(studyData.studyTypes)}
                        selectionMode="multiple"
                        onSelectionChange={(keys) => {
                          setStudyData((prev) => ({
                            ...prev,
                            studyTypes: Array.from(keys) as string[],
                          }));
                          setErrors((prev) => ({
                            ...prev,
                            studyTypes: undefined,
                          }));
                        }}
                      >
                        {specializations.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </Select>
                    </div>

                    <div className="col-span-1">
                      <Textarea
                        isRequired
                        className="w-full"
                        errorMessage={errors.details}
                        isInvalid={!!errors.details}
                        label="Study Details"
                        name="details"
                        placeholder="Enter study details"
                        value={studyData.details}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="col-span-1 md:col-span-2">
                      <Input
                        isRequired
                        className="w-full"
                        errorMessage={errors.numberOfStages}
                        isInvalid={!!errors.numberOfStages}
                        label="Number of Stages"
                        name="numberOfStages"
                        placeholder="Enter number of stages"
                        type="number"
                        value={studyData.numberOfStages}
                        onChange={handleNumberOfStagesChange}
                      />
                    </div>

                    {studyData.stages.map((stage, index) => (
                      <div key={index} className="col-span-1 md:col-span-2">
                        <Textarea
                          isRequired
                          className="w-full"
                          errorMessage={index === 0 ? errors.stages : undefined}
                          isInvalid={!!errors.stages}
                          label={`Stage ${index + 1}`}
                          maxRows={10}
                          placeholder={`Enter stage ${index + 1} Process`}
                          value={stage}
                          onChange={(e) =>
                            handleStageChange(index, e.target.value)
                          }
                        />
                      </div>
                    ))}
                  </form>
                </ModalBody>
                <ModalFooter>
                  <Button color="danger" variant="light" onPress={handleCancel}>
                    Cancel
                  </Button>
                  <Button color="primary" onPress={handleSubmit}>
                    Create Study
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </Card>
      <Card className="w-full bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-md">
        <CardHeader className="flex items-center space-x-2 bg-purple-200 text-purple-800 py-4">
          <FcBiotech className="w-8 h-8" />
          <h2 className="font-bold text-xl">Study Design Management 🧪📊</h2>
        </CardHeader>
        <CardBody className="text-sm text-purple-700 space-y-4 p-6">
          <p className="font-semibold text-base flex items-center">
            <FcIdea className="w-6 h-6 mr-2" />
            Empower your research with comprehensive study design tools! 🚀
          </p>
          <ul className="space-y-3">
            <li className="flex items-center">
              <FcPlus className="w-6 h-6 mr-2" />
              Create new research studies with ease
            </li>
            <li className="flex items-center">
              <FcViewDetails className="w-6 h-6 mr-2" />
              Edit and manage existing studies efficiently
            </li>
            <li className="flex items-center">
              <FcTimeline className="w-6 h-6 mr-2" />
              Define study parameters, timelines, and objectives
            </li>
            <li className="flex items-center">
              <FcOrgUnit className="w-6 h-6 mr-2" />
              Organize studies by type, status, and priority
            </li>
            <li className="flex items-center">
              <FcFullTrash className="w-6 h-6 mr-2" />
              Easily remove or archive completed studies
            </li>
          </ul>
          <p className="italic mt-4 flex items-center">
            <FcIdea className="w-6 h-6 mr-2" />
            Streamline your research process and boost collaboration across your
            team! 🤝💡
          </p>
        </CardBody>
      </Card>
    </>
  );
};

export default CreateNewStudy;
