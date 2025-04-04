import { Router } from 'express';
import {
  Register,
  login,
  getUser,
  emailCheck,
  getUserPictureByEmail,
  getAllUser,
  deleteUser,
} from '../controllers/members';
import {
  getPatients,
  GetUserUpdatedDetails,
  UserDetails,
} from '../controllers/specificUsers';
import {
  addConsent,
  approvePhase,
  deleteStudyCase,
  disapprovePhase,
  endStage,
  getAllStudyCases,
  removePatientFromStudyCase,
  skipToStage,
  updateCurrentPatients,
  updateStudyCase,
} from '../controllers/studyCases';
import {
  createComment,
  deleteComment,
  getComments,
  updateComment,
} from '../controllers/comments';

const router = Router();
router.post('/register', Register);
router.post('/login', login);
router.get('/verify/:token', emailCheck);
router.get('/getUser/:id', getUser);
router.get('/get-users', getAllUser);
router.delete('/delete-user/:id', deleteUser);
router.post('/userDetails', UserDetails);
router.get('/getUserGetUserUpdatedDetails/:id/:type', GetUserUpdatedDetails);
router.post('/addStudyCase', addConsent);
router.get('/getAllStudyCases', getAllStudyCases);
router.delete('/deleteStudyCase/:id', deleteStudyCase);
router.get('/getPatients', getPatients);
router.put('/addPatient', updateCurrentPatients);
router.put('/removePatient', removePatientFromStudyCase);
router.post('/approve-phase', approvePhase);
router.post('/disapprove-phase', disapprovePhase);
router.post('/end-stage', endStage);
router.post('/skip-to-stage', skipToStage);
router.get('/user-picture/:email', getUserPictureByEmail);
router.post('/add-comment', createComment);
router.get('/get-comments', getComments);
router.put('/update-comment/:id', updateComment);
router.delete('/delete-comment/:id', deleteComment);
router.put('/update-study-design/:id', updateStudyCase);

export default router;
