import { useState, useEffect } from 'react';
import { RouterProvider } from 'react-router';
import { router } from './routes';
import { WelcomeOnboarding } from '@/shared/components';

export default function App() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  }, []);
  
  const handleOnboardingComplete = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    setShowOnboarding(false);
  };
  
  return (
    <>
      {showOnboarding && (
        <WelcomeOnboarding 
          onComplete={handleOnboardingComplete}
        />
      )}
      <RouterProvider router={router} />
    </>
  );
}
