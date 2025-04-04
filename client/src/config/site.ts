export type SiteConfig = typeof siteConfig;
export const siteConfig = {
  name: 'Custom name',
  description: 'custom description',
  navMenuItemsDefault: [
    {
      label: 'Home',
      href: '/',
    },
    {
      label: 'Authentication',
      href: '/authentication',
    },
  ],
  navMenuItemsResearcher: [
    {
      label: 'Home',
      href: '/',
    },
    {
      label: 'Profile',
      href: '/createProfile',
    },
    {
      label: 'Dashboard',
      href: '/researcherDashboard',
    },
    {
      label: 'Study Design',
      href: '/allStudyCases',
    },
    {
      label: 'In Process',
      href: '/currentPatients',
    },
  ],
  navMenuItemsPatient: [
    {
      label: 'Home',
      href: '/',
    },
    {
      label: 'Profile',
      href: '/createProfile',
    },
    {
      label: 'Dashboard',
      href: '/patientDashboard',
    },
  ],
  navMenuItemsAdmin: [
    {
      label: 'Home',
      href: '/',
    },
    {
      label: 'Dashboard',
      href: '/admin',
    },
  ],
};
