import { useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { StreamScheduler } from '@/components/StreamScheduler';
import { useStreamSchedule } from '@/hooks/useStreamSchedule';

const Schedule = () => {
  const { fetchSchedules } = useStreamSchedule();

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8 mt-20">
        <StreamScheduler />
      </main>
    </div>
  );
};

export default Schedule;
