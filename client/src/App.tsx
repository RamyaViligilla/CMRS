import { ToastContainer } from 'react-toastify';

import CreateProfile from './pages/createProfile/createProfile';

import 'react-toastify/dist/ReactToastify.css';
// eslint-disable-next-line import/order
import { Route, Routes } from 'react-router-dom';

import Home from './pages/home';
import PatientDashboard from './pages/dashboard/patient';
import ResearcherDashboard from './pages/dashboard/researcher';
import AllStudyCases from './Research Study Management/Study Case/AllStudyCases';
import ListOfPatients from './Research Study Management/StateMachine/ListOfPatients';

import Authentication from '@/pages/authentication';
import AdminDashboard from '@/pages/dashboard/admin';

function App() {
  return (
    <>
      <ToastContainer />
      <Routes>
        <Route element={<Home />} path="/" />
        <Route element={<Authentication />} path="/authentication" />
        <Route element={<PatientDashboard />} path="/patientDashboard" />
        <Route element={<ResearcherDashboard />} path="/researcherDashboard" />
        <Route element={<CreateProfile />} path="/createProfile" />
        <Route element={<AllStudyCases />} path="/allStudyCases" />
        <Route element={<ListOfPatients />} path="/currentPatients" />
        <Route element={<AdminDashboard />} path="/admin" />
      </Routes>
    </>
  );
}

export default App;
