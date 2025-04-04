import { Request, Response } from 'express';
import { studyCases } from '../schema/studyCases';
import mongoose from 'mongoose';

export async function addConsent(req: Request, res: Response) {
  try {
    const studyCaseData = req.body;

    const { stages } = studyCaseData;

    const transformedStages = stages.map((stage: string) => ({
      stageDescription: stage,
      approvalStatus: 'false',
      approvedBy: '',
    }));

    const transformedStudyCaseData = {
      ...studyCaseData,
      stages: transformedStages,
    };

    const newStudyCase = new studyCases(transformedStudyCaseData);
    const savedStudyCase = await newStudyCase.save();

    res.status(201).json({
      message: 'Study Case created successfully',
      studyCase: savedStudyCase,
    });
  } catch (error) {
    console.error('Error saving Study Case:', error);
    if (error instanceof mongoose.Error.ValidationError) {
      return res
        .status(400)
        .json({ message: 'Validation Error', error: error.message });
    }
    res.status(500).json({
      message: 'Error saving Study Case',
      error: 'An unexpected error occurred',
    });
  }
}

export async function getAllStudyCases(req: Request, res: Response) {
  try {
    const allStudyCases = await studyCases.find({});

    if (allStudyCases.length === 0) {
      return res.status(404).json({
        message: 'No study cases found 🔍',
        statusCode: 404,
      });
    }

    res.send(allStudyCases);
  } catch (error) {
    console.error('Error retrieving study cases:', error);
    res.status(500).json({
      message: 'Error retrieving study cases ❌',
      error: error,
      statusCode: 500,
    });
  }
}

export async function updateStudyCase(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const existingStudyCase = await studyCases.findById(id);
    if (!existingStudyCase) {
      return res.status(404).json({
        message: 'Study Case not found',
        statusCode: 404,
      });
    }

    if (updateData.stages) {
      updateData.stages = updateData.stages
        .map((stage: any) => {
          if (typeof stage === 'object' && stage.stageDescription) {
            return {
              ...stage,
              approvalStatus: stage.approvalStatus || 'false',
              approvedBy: stage.approvedBy || '',
              status: stage.status || 'active',
            };
          } else if (typeof stage === 'string') {
            return {
              stageDescription: stage,
              approvalStatus: 'false',
              approvedBy: '',
              status: 'active',
            };
          }
          return null;
        })
        .filter((stage: any) => stage !== null);
    }

    const updatedStudyCase = await studyCases.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true },
    );

    res.status(200).json({
      message: 'Study Case updated successfully',
      studyCase: updatedStudyCase,
    });
  } catch (error) {
    console.error('Error updating Study Case:', error);
    if (error instanceof mongoose.Error.ValidationError) {
      return res
        .status(400)
        .json({ message: 'Validation Error', error: error.message });
    }
    res.status(500).json({
      message: 'Error updating Study Case',
      error: 'An unexpected error occurred',
    });
  }
}

export async function deleteStudyCase(req: Request, res: Response) {
  try {
    const feedback = await studyCases.findByIdAndDelete(req.params.id);
    if (!feedback) {
      return res.status(404).json({ message: 'Study case not found' });
    }
    res.json({ message: 'Question deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err });
  }
}

export async function updateCurrentPatients(req: Request, res: Response) {
  try {
    const { studyCaseId, patientEmail } = req.body;

    const studyCase = await studyCases.findById(studyCaseId);
    if (!studyCase) {
      return res.status(404).json({
        message: 'Study design not found',
        statusCode: 404,
      });
    }

    if (studyCase.currentPatients.includes(patientEmail)) {
      return res.status(400).json({
        message: 'Patient is already part of this study case',
        statusCode: 400,
      });
    }

    studyCase.currentPatients.push(patientEmail);
    await studyCase.save();

    res.status(200).json({
      message: 'Patient added to study design successfully',
      studyCase: studyCase,
    });
  } catch (error) {
    console.error('Error updating current patients:', error);
    res.status(500).json({
      message: 'Error updating current patients',
      error: error,
      statusCode: 500,
    });
  }
}

export async function removePatientFromStudyCase(req: Request, res: Response) {
  try {
    const { studyCaseId, patientEmail } = req.body;

    const studyCase = await studyCases.findById(studyCaseId);
    if (!studyCase) {
      return res.status(404).json({
        message: 'Study case not found',
        statusCode: 404,
      });
    }

    const patientIndex = studyCase.currentPatients.indexOf(patientEmail);
    if (patientIndex === -1) {
      return res.status(400).json({
        message: 'Patient is not part of this study case',
        statusCode: 400,
      });
    }

    studyCase.currentPatients.splice(patientIndex, 1);
    await studyCase.save();

    res.status(200).json({
      message: 'Patient removed from study case successfully',
      studyCase: studyCase,
    });
  } catch (error) {
    console.error('Error removing patient from study case:', error);
    res.status(500).json({
      message: 'Error removing patient from study case',
      error: error,
      statusCode: 500,
    });
  }
}

export async function approvePhase(req: Request, res: Response) {
  try {
    const { studyCaseId, patientEmail, stageIndex, phaseIndex } = req.body;

    if (
      !studyCaseId ||
      !patientEmail ||
      stageIndex === undefined ||
      phaseIndex === undefined
    ) {
      return res.status(400).json({
        message: 'Missing required parameters',
        statusCode: 400,
      });
    }

    const studyCase = await studyCases.findById(studyCaseId);
    if (!studyCase) {
      return res.status(404).json({
        message: 'Study case not found',
        statusCode: 404,
      });
    }

    if (stageIndex < 0 || stageIndex >= studyCase.stages.length) {
      return res.status(400).json({
        message: 'Invalid stage index',
        statusCode: 400,
      });
    }

    const stage = studyCase.stages[stageIndex];
    if (phaseIndex < 0 || phaseIndex >= stage.phases.length) {
      return res.status(400).json({
        message: 'Invalid phase index',
        statusCode: 400,
      });
    }

    let patientProgress = studyCase.patientProgress.find(
      (pp) => pp.patientEmail === patientEmail,
    );
    if (!patientProgress) {
      patientProgress = {
        patientEmail,
        stages: studyCase.stages.map((_, index) => ({
          stageIndex: index,
          phases: stage.phases.map((_, pIndex) => ({
            phaseIndex: pIndex,
            checkPhase: false,
            status: 'active',
          })),
          status: 'active',
        })),
      };
      studyCase.patientProgress.push(patientProgress);
    }

    const patientStage = patientProgress.stages.find(
      (s) => s.stageIndex === stageIndex,
    );
    if (patientStage) {
      const patientPhase = patientStage.phases.find(
        (p) => p.phaseIndex === phaseIndex,
      );
      if (patientPhase) {
        patientPhase.checkPhase = true;
        patientPhase.status = 'completed';
      }

      const allPhasesApproved = patientStage.phases.every(
        (phase) => phase.checkPhase,
      );

      if (allPhasesApproved) {
        stage.approvalStatus = 'true';
        stage.approvedBy = studyCase.researcherEmailId || 'System';
        stage.status = 'completed';
        patientStage.status = 'completed';
      }
    } else {
      return res.status(404).json({
        message: 'Patient stage not found',
        statusCode: 404,
      });
    }

    // Save the updated study case
    await studyCase.save();

    res.status(200).json({
      message: 'Phase approved successfully for the patient',
      studyCase: studyCase,
    });
  } catch (error) {
    console.error('Error approving phase:', error);
    if (error instanceof mongoose.Error.ValidationError) {
      return res
        .status(400)
        .json({ message: 'Validation Error', error: error.message });
    }
    res.status(500).json({
      message: 'Error approving phase',
      error: error,
      statusCode: 500,
    });
  }
}

export async function disapprovePhase(req: Request, res: Response) {
  try {
    const { studyCaseId, patientEmail, stageIndex, phaseIndex } = req.body;

    // Validate input
    if (
      !studyCaseId ||
      !patientEmail ||
      stageIndex === undefined ||
      phaseIndex === undefined
    ) {
      return res.status(400).json({
        message: 'Missing required parameters',
        statusCode: 400,
      });
    }

    // Find the study case
    const studyCase = await studyCases.findById(studyCaseId);
    if (!studyCase) {
      return res.status(404).json({
        message: 'Study case not found',
        statusCode: 404,
      });
    }

    // Validate stage and phase indices
    if (stageIndex < 0 || stageIndex >= studyCase.stages.length) {
      return res.status(400).json({
        message: 'Invalid stage index',
        statusCode: 400,
      });
    }

    // Find patient progress
    let patientProgress = studyCase.patientProgress.find(
      (pp) => pp.patientEmail === patientEmail,
    );
    if (!patientProgress) {
      return res.status(404).json({
        message: 'Patient progress not found',
        statusCode: 404,
      });
    }

    // Disapprove phases in current and subsequent stages
    for (let i = stageIndex; i < patientProgress.stages.length; i++) {
      let currentStageProgress = patientProgress.stages[i];
      let startPhaseIndex = i === stageIndex ? phaseIndex : 0;

      for (
        let j = startPhaseIndex;
        j < currentStageProgress.phases.length;
        j++
      ) {
        currentStageProgress.phases[j].checkPhase = false;
        currentStageProgress.phases[j].status = 'active';
      }

      currentStageProgress.status = 'active';

      // Update stage approval status
      const allPatientsDisapproved = studyCase.patientProgress.every((pp) =>
        pp.stages[i].phases.some((phase) => !phase.checkPhase),
      );

      if (allPatientsDisapproved) {
        studyCase.stages[i].approvalStatus = 'false';
        studyCase.stages[i].approvedBy = '';
        studyCase.stages[i].status = 'active';
      }
    }

    // Save the updated study case
    await studyCase.save();

    res.status(200).json({
      message:
        'Phase and all subsequent phases disapproved successfully for the patient',
      studyCase: studyCase,
    });
  } catch (error) {
    console.error('Error disapproving phase:', error);
    if (error instanceof mongoose.Error.ValidationError) {
      return res
        .status(400)
        .json({ message: 'Validation Error', error: error.message });
    }
    res.status(500).json({
      message: 'Error disapproving phase',
      error: error,
      statusCode: 500,
    });
  }
}

export async function endStage(req: Request, res: Response) {
  try {
    const { studyCaseId, stageIndex, patientEmail } = req.body;

    if (!studyCaseId || stageIndex === undefined || !patientEmail) {
      return res.status(400).json({
        message: 'Missing required parameters',
        statusCode: 400,
      });
    }

    const studyCase = await studyCases.findById(studyCaseId);
    if (!studyCase) {
      return res.status(404).json({
        message: 'Study case not found',
        statusCode: 404,
      });
    }

    if (stageIndex < 0 || stageIndex >= studyCase.stages.length) {
      return res.status(400).json({
        message: 'Invalid stage index',
        statusCode: 400,
      });
    }

    // Find the patient's progress
    const patientProgress = studyCase.patientProgress.find(
      (pp) => pp.patientEmail === patientEmail,
    );
    if (!patientProgress) {
      return res.status(404).json({
        message: 'Patient progress not found',
        statusCode: 404,
      });
    }

    // Update the stage status for the specific patient
    const patientStage = patientProgress.stages.find(
      (s) => s.stageIndex === stageIndex,
    );
    if (!patientStage) {
      return res.status(404).json({
        message: 'Patient stage not found',
        statusCode: 404,
      });
    }

    patientStage.status = 'ended';

    // Update all phases in the stage to 'ended' and mark them as approved for the specific patient
    patientStage.phases.forEach((phase) => {
      phase.status = 'ended';
      phase.checkPhase = true; // Mark as approved
    });

    // Check if all patients have completed this stage
    const allPatientsCompleted = studyCase.patientProgress.every(
      (pp) =>
        pp.stages.find((s) => s.stageIndex === stageIndex)?.status === 'ended',
    );

    // If all patients have completed, update the main stage status
    if (allPatientsCompleted) {
      studyCase.stages[stageIndex].status = 'ended';
    }

    await studyCase.save();

    res.status(200).json({
      message:
        'Stage ended successfully for the patient and all phases marked as approved',
      studyCase: studyCase,
    });
  } catch (error) {
    console.error('Error ending stage:', error);
    res.status(500).json({
      message: 'Error ending stage',
      error: error,
      statusCode: 500,
    });
  }
}

export async function skipToStage(req: Request, res: Response) {
  try {
    const { studyCaseId, currentStageIndex, targetStageIndex, patientEmail } =
      req.body;

    if (
      !studyCaseId ||
      currentStageIndex === undefined ||
      targetStageIndex === undefined ||
      !patientEmail
    ) {
      return res.status(400).json({
        message: 'Missing required parameters',
        statusCode: 400,
      });
    }

    const studyCase = await studyCases.findById(studyCaseId);
    if (!studyCase) {
      return res.status(404).json({
        message: 'Study case not found',
        statusCode: 404,
      });
    }

    if (
      currentStageIndex < 0 ||
      currentStageIndex >= studyCase.stages.length ||
      targetStageIndex < 0 ||
      targetStageIndex >= studyCase.stages.length ||
      currentStageIndex === targetStageIndex
    ) {
      return res.status(400).json({
        message: 'Invalid stage indices',
        statusCode: 400,
      });
    }

    // Find the patient's progress
    const patientProgress = studyCase.patientProgress.find(
      (pp) => pp.patientEmail === patientEmail,
    );
    if (!patientProgress) {
      return res.status(404).json({
        message: 'Patient progress not found',
        statusCode: 404,
      });
    }

    // Update stages for the specific patient
    patientProgress.stages.forEach((stageProgress, index) => {
      if (index < targetStageIndex) {
        // Previous stages: mark as completed
        stageProgress.status = 'completed';
        stageProgress.phases.forEach((phase) => {
          phase.status = 'completed';
          phase.checkPhase = true;
        });
      } else if (index === targetStageIndex) {
        // Target stage: mark as active
        stageProgress.status = 'active';
        stageProgress.phases.forEach((phase) => {
          phase.status = 'active';
          phase.checkPhase = false;
        });
      } else {
        // Future stages: mark as skipped
        stageProgress.status = 'skipped';
        stageProgress.phases.forEach((phase) => {
          phase.status = 'skipped';
          phase.checkPhase = false;
        });
      }
    });

    // Check if all patients have completed or skipped stages up to the target stage
    const allPatientsReachedTarget = studyCase.patientProgress.every(
      (pp) =>
        pp.stages[targetStageIndex].status === 'active' ||
        pp.stages[targetStageIndex].status === 'completed',
    );

    // Update main stages if all patients have reached the target stage
    if (allPatientsReachedTarget) {
      studyCase.stages.forEach((stage, index) => {
        if (index < targetStageIndex) {
          stage.status = 'completed';
        } else if (index === targetStageIndex) {
          stage.status = 'active';
        } else {
          stage.status = 'skipped';
        }
      });
    }

    await studyCase.save();

    res.status(200).json({
      message: 'Skipped to target stage successfully for the patient',
      studyCase: studyCase,
    });
  } catch (error) {
    console.error('Error changing stage:', error);
    res.status(500).json({
      message: 'Error changing stage',
      error: error,
      statusCode: 500,
    });
  }
}
