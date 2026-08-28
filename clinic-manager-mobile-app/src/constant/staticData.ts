import OnboardingBg1 from '@images/onboardingBgOne.png';
import OnboardingBg3 from '@images/onboardingBgThree.png';
import OnboardingBg2 from '@images/onboardingBgTwo.png';

import DoctorTeamSvg from '@images/OnboardingImgOne.svg';
import DoctorCallSvg from '@images/OnboardingImgThree.svg';
import DoctorConsultationSvg from '@images/OnboardingImgTwo.svg';

export const dropdownOptions = [
  {label: 'Yes', value: 'YES'},
  {label: 'No', value: 'NO'},
];

export interface OnboardingItem {
  id: string;
  backgroundImage: any;
  illustration: any;
  title: string;
  description: string;
}

export const onboardingData: OnboardingItem[] = [
  {
    id: '1',
    backgroundImage: OnboardingBg1,
    illustration: DoctorTeamSvg,
    title: 'Welcome to Pall Mall Medical',
    description:
      'Experience trusted healthcare with personalized care and advanced treatments. Your health journey begins here.',
  },
  {
    id: '2',
    backgroundImage: OnboardingBg2,
    illustration: DoctorConsultationSvg,
    title: 'Book Consultation For Your Better Solution',
    description:
      'Our team will help you find the best consultation for your health needs.',
  },
  {
    id: '3',
    backgroundImage: OnboardingBg3,
    illustration: DoctorCallSvg,
    title: 'Chat, Call and Live Talk With Your Doctor',
    description:
      'Easily connect with doctors and start a live conversation for better treatment.',
  },
];