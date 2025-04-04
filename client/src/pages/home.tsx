import { Card, CardBody, CardHeader } from '@nextui-org/react';
import {
  FcConferenceCall,
  FcDocument,
  FcApproval,
  FcCollaboration,
  FcAlarmClock,
  FcPrivacy,
} from 'react-icons/fc';

import DefaultLayout from '@/layouts/default';

const features = [
  {
    title: 'Study Management',
    description:
      'Create, edit, and manage research studies with precision. Define study parameters, timelines, and objectives. Organize studies by type, status, and priority for optimal efficiency.',
    icon: FcDocument,
    details: [
      'Intuitive study creation wizard',
      'Real-time study progress tracking',
      'Customizable study templates',
    ],
  },
  {
    title: 'Patient Enrollment',
    description:
      'Streamline the process of enrolling patients into research studies. Track eligibility criteria, screening processes, and enrollment status. Manage patient demographics and study-specific information seamlessly.',
    icon: FcConferenceCall,
    details: [
      'Automated eligibility screening',
      'Interactive patient dashboard',
      'Bulk enrollment capabilities',
    ],
  },
  {
    title: 'Consent Tracking',
    description:
      'Efficiently manage different types of patient consent. Create and customize consent forms, track consent status, and maintain a detailed history of patient consents and revocations for full transparency.',
    icon: FcApproval,
    details: [
      'Digital consent form builder',
      'Audit trail for consent changes',
      'Multi-language support',
    ],
  },
  {
    title: 'Team Collaboration',
    description:
      'Facilitate seamless collaboration among team members. Assign roles and responsibilities, share documents, and communicate within the platform. Track team member activities and contributions to each study effortlessly.',
    icon: FcCollaboration,
    details: ['Real-time chat and notifications', 'Role-based access control'],
  },
  {
    title: 'Reminders',
    description:
      'Set up and manage reminders for critical study tasks, appointments, and data collection deadlines. Customize notification preferences and ensure timely completion of study milestones for smooth operations.',
    icon: FcAlarmClock,
    details: ['Multi-channel notifications'],
  },
  {
    title: 'Patient Records',
    description:
      'Maintain comprehensive patient records securely. Store and retrieve patient medical histories, study-specific data, and relevant documents. Ensure data privacy and compliance with healthcare regulations at all times.',
    icon: FcPrivacy,
    details: ['compliant data storage', 'Advanced search functionality'],
  },
];

const FeatureCard = ({ title, description, icon: Icon, details }: any) => (
  <Card className="w-full bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-md">
    <CardHeader className="flex items-center space-x-2 bg-purple-200 text-purple-800 py-4">
      <Icon className="w-8 h-8" />
      <h3 className="font-bold text-xl">{title}</h3>
    </CardHeader>
    <CardBody className="text-sm text-purple-700 space-y-4 p-6">
      <p>{description}</p>
      <ul className="list-disc list-inside space-y-2">
        {details.map((detail: any, index: any) => (
          <li key={index}>{detail}</li>
        ))}
      </ul>
    </CardBody>
  </Card>
);

export default function Home() {
  return (
    <DefaultLayout>
      <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10 px-4">
        <h1 className="text-4xl font-bold text-center mb-6">
          Clinical Research Management System 🧬🔬
        </h1>
        <p className="text-xl text-center text-gray-600 mb-8 max-w-3xl">
          Revolutionize your clinical research process with our comprehensive
          management system. Explore our key features designed to enhance
          efficiency, ensure compliance, and accelerate breakthroughs in your
          studies. 🚀
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-7xl">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </section>
    </DefaultLayout>
  );
}
