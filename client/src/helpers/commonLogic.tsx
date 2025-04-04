import { useNavigate } from 'react-router-dom';

import { StoredUser } from '@/types';

export const specializations = [
  'Cardiology',
  'Dermatology',
  'Endocrinology',
  'Gastroenterology',
  'Neurology',
  'Oncology',
  'Pediatrics',
  'Psychiatry',
  'Radiology',
  'Surgery',
  'Anesthesiology',
  'Allergy and Immunology',
  'Emergency Medicine',
  'Family Medicine',
  'Geriatrics',
  'Hematology',
  'Infectious Disease',
  'Internal Medicine',
  'Nephrology',
  'Obstetrics and Gynecology',
  'Ophthalmology',
  'Orthopedics',
  'Otolaryngology',
  'Pathology',
  'Plastic Surgery',
  'Pulmonology',
  'Rheumatology',
  'Sports Medicine',
  'Urology',
];

export function getUserFromLocalStorage(): StoredUser | null {
  const storedUser = localStorage.getItem('user');
  return storedUser ? JSON.parse(storedUser) : null;
}

export function useNavigateTo(route: string) {
  const navigate = useNavigate();

  const goToRoute = () => {
    navigate(route);
  };

  return goToRoute;
}
