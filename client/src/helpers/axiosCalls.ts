import axios, { AxiosResponse } from 'axios';

import { CommentData, StudyData, UserData } from '@/types';
const BASE_URL: string = 'http://localhost:3500';

// Define a type for HTTP methods
type HttpMethod = 'get' | 'post' | 'put' | 'delete';

// Generic API function to handle requests
const axiosCall = async <T>(
  method: HttpMethod,
  endpoint: string,
  data?: any
): Promise<AxiosResponse<T>> => {
  const url: string = `${BASE_URL}/${endpoint}`;
  const response: AxiosResponse<T> = await axios[method](url, data);
  return response;
};

export const getUserById = async (id: string): Promise<AxiosResponse<any>> =>
  axiosCall<any>('get', `getUser/${id}`);

export const createUserDetails = async (
  userData: UserData
): Promise<AxiosResponse<any>> =>
  axiosCall<any>('post', 'userDetails', userData);

export const getUserUpdatedDetailsById = async (
  id: string,
  type: string
): Promise<AxiosResponse<any>> =>
  axiosCall<any>('get', `getUserGetUserUpdatedDetails/${id}/${type}`);

export const addStudyCase = async (
  data: StudyData
): Promise<AxiosResponse<any>> => axiosCall<any>('post', 'addStudyCase', data);

export const getAllStudyCases = async (): Promise<AxiosResponse<any>> =>
  axiosCall<any>('get', `getAllStudyCases`);

export const getAllUsers = async (): Promise<AxiosResponse<any>> =>
  axiosCall<any>('get', `get-users`);

export const deleteStudyCases = async (
  id: string
): Promise<AxiosResponse<any>> =>
  axiosCall<any>('delete', `deleteStudyCase/${id}`);

export const deleteUser = async (id: string): Promise<AxiosResponse<any>> =>
  axiosCall<any>('delete', `delete-user/${id}`);

export const getPatients = async (): Promise<AxiosResponse<any>> =>
  axiosCall<any>('get', `getPatients`);

export const addPatientToStage = async (
  data: any
): Promise<AxiosResponse<any>> => axiosCall<any>('put', 'addPatient', data);

export const removePatientFromStage = async (
  data: any
): Promise<AxiosResponse<any>> => axiosCall<any>('put', 'removePatient', data);

export const addComment = async (
  data: CommentData
): Promise<AxiosResponse<any>> => axiosCall<any>('post', 'add-comment', data);

export const getUserProfile = async (
  email: string
): Promise<AxiosResponse<any>> =>
  axiosCall<any>('get', `user-picture/${email}`);

export const getComments = async (params: any): Promise<AxiosResponse<any>> =>
  axiosCall<any>('get', `get-comments`, { params });

export const updateComment = async (
  commentId: string,
  updatedData: { comment: string }
): Promise<AxiosResponse<CommentData>> =>
  axiosCall<CommentData>('put', `update-comment/${commentId}`, updatedData);

export const deleteComment = async (
  commentId: string
): Promise<AxiosResponse<{ message: string }>> =>
  axiosCall<{ message: string }>('delete', `delete-comment/${commentId}`);

export const updateStudyDesign = async (
  commentId: string,
  data: any
): Promise<AxiosResponse<CommentData>> =>
  axiosCall<CommentData>('put', `update-study-design/${commentId}`, data);

export const approvePhase = async (
  studyCaseId: string,
  patientEmail: string,
  stageIndex: number,
  phaseIndex: number
) => {
  const response = await axios.post('http://localhost:3500/approve-phase', {
    studyCaseId,
    stageIndex,
    phaseIndex,
    patientEmail,
  });
  return response.data;
};

export const disapprovePhase = async (
  studyCaseId: string,
  patientEmail: string,
  stageIndex: number,
  phaseIndex: number
) => {
  const response = await axios.post('http://localhost:3500/disapprove-phase', {
    studyCaseId,
    stageIndex,
    phaseIndex,
    patientEmail,
  });
  return response.data;
};

export const endStage = async (
  studyCaseId: string,
  stageIndex: number,
  patientEmail: string
) => {
  try {
    const response = await axios.post(`${BASE_URL}/end-stage`, {
      studyCaseId,
      stageIndex,
      patientEmail,
    });
    return response.data;
  } catch (error) {
    console.error('Error ending stage:', error);
    throw error;
  }
};

export const skipToStage = async (
  studyCaseId: string,
  currentStageIndex: number,
  targetStageIndex: number,
  patientEmail: string
) => {
  try {
    const response = await axios.post(`http://localhost:3500/skip-to-stage`, {
      studyCaseId,
      currentStageIndex,
      targetStageIndex,
      patientEmail,
    });
    return response.data;
  } catch (error) {
    console.error('Error skipping to stage:', error);
    throw error;
  }
};
