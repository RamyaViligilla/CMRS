import { useEffect, useState } from 'react';

import { getAllStudyCases } from '@/helpers/axiosCalls';
import DefaultLayout from '@/layouts/default';
import CreateNewStudy from '@/Research Study Management/Study Case/CreateNewStudy';
import { StudyCase } from '@/types';
import StudyProgressDashboard from '@/Research Study Management/Stages/Graphs';

export default function ResearcherDashboard() {
  const [studyCases, setStudyCases] = useState<StudyCase[]>([]);

  useEffect(() => {
    fetchStudyCases();
  }, []);

  const fetchStudyCases = async () => {
    try {
      const res = await getAllStudyCases();
      const cases: StudyCase[] = Array.isArray(res.data) ? res.data : [];
      setStudyCases(cases);
    } catch (error) {
      console.error('Error fetching study cases:', error);
      setStudyCases([]);
    }
  };

  return (
    <DefaultLayout>
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">
            Research Study Management Dashboard
          </h1>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-4">
          <CreateNewStudy />
        </div>
        <StudyProgressDashboard studyCases={studyCases} />
      </div>
    </DefaultLayout>
  );
}
