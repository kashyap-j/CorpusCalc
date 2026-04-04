import { useEffect } from 'react';
import PlannerShell from '../components/planner/PlannerShell';
import { incrementVisitCounter } from '../lib/supabase';

export default function PlannerPage() {
  useEffect(() => {
    incrementVisitCounter();
  }, []);

  return <PlannerShell />;
}
