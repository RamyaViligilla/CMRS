import GetStudyCase from './GetStudyCase';

import DefaultLayout from '@/layouts/default';

const AllStudyCases = () => {
  return (
    <DefaultLayout>
      <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
        <GetStudyCase filter="allSplit" />
      </section>
    </DefaultLayout>
  );
};

export default AllStudyCases;
