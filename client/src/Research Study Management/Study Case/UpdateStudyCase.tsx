import React, { useState, useEffect } from 'react';
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
  Tooltip,
} from '@nextui-org/react';
import { toast } from 'react-toastify';
import { FcEditImage } from 'react-icons/fc';

import { updateStudyDesign } from '@/helpers/axiosCalls';
import { specializations } from '@/helpers/commonLogic';

interface Stage {
  stageDescription: string;
  approvalStatus: string;
  approvedBy: string;
  status: string;
  _id?: string;
  phases: any[];
}

interface StudyData {
  consentName: string;
  studyTypes: string[];
  details: string;
  numberOfStages: string;
  stages: Stage[];
}

interface FormErrors {
  consentName?: string;
  studyTypes?: string;
  details?: string;
  numberOfStages?: string;
  stages?: string;
}

interface UpdateStudyDesignModalProps {
  studyCase: StudyData & { _id: string };
  onStudyUpdated: () => void;
}

export default function UpdateStudyDesignModal({
  studyCase,
  onStudyUpdated,
}: UpdateStudyDesignModalProps) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [studyData, setStudyData] = useState<StudyData>(studyCase);
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    setStudyData(studyCase);
  }, [studyCase]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setStudyData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleNumberOfStagesChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    const numStages = parseInt(value, 10);
    setStudyData((prev: StudyData): StudyData => {
      const newStages: Stage[] = isNaN(numStages)
        ? []
        : Array(numStages)
            .fill(null)
            .map(
              (_, i): Stage =>
                prev.stages[i] || {
                  stageDescription: '',
                  approvalStatus: 'false',
                  approvedBy: '',
                  status: 'active',
                  phases: [],
                }
            );
      return {
        ...prev,
        numberOfStages: value,
        stages: newStages,
      };
    });
    setErrors((prev) => ({
      ...prev,
      numberOfStages: undefined,
      stages: undefined,
    }));
  };

  const handleStageChange = (index: number, value: string) => {
    setStudyData(
      (prev: StudyData): StudyData => ({
        ...prev,
        stages: prev.stages.map(
          (stage, i): Stage =>
            i === index ? { ...stage, stageDescription: value } : stage
        ),
      })
    );
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

    if (studyData.stages.some((stage) => !stage.stageDescription.trim())) {
      newErrors.stages = 'All stage descriptions must be filled';
      isValid = false;
    }

    setErrors(newErrors);

    return isValid;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      try {
        const response: any = await updateStudyDesign(studyCase._id, studyData);
        toast.success(response.data.message);
        onStudyUpdated();
        onOpenChange();
      } catch (error: any) {
        toast.error(
          error.response?.data?.message ||
            'An error occurred while updating the study'
        );
      }
    }
  };

  return (
    <>
      <Tooltip content="Update">
        <Button
          className="bg-purple-200 text-purple-600 hover:bg-purple-100 transition-colors"
          onPress={onOpen}
        >
          <FcEditImage size={40} />
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
                Update Study Design
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

                  {studyData.stages.map((stage: any, index) => (
                    <div key={index} className="col-span-1 md:col-span-2">
                      <Textarea
                        isRequired
                        className="w-full"
                        errorMessage={index === 0 ? errors.stages : undefined}
                        isInvalid={!!errors.stages}
                        label={`Stage ${index + 1}`}
                        maxRows={10}
                        placeholder={`Enter stage ${index + 1} Process`}
                        value={stage.stageDescription}
                        onChange={(e) =>
                          handleStageChange(index, e.target.value)
                        }
                      />
                    </div>
                  ))}
                </form>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onOpenChange}>
                  Cancel
                </Button>
                <Button color="primary" onPress={handleSubmit}>
                  Update Study
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
