import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import PlannerShell from '../components/planner/PlannerShell';
import { incrementVisitCounter } from '../lib/supabase';

export default function PlannerPage() {
  useEffect(() => {
    incrementVisitCounter();
  }, []);

  return (
    <>
      <Helmet>
        <title>Build Your Retirement Plan | CorpusCalc</title>
        <meta name="description" content="Create a personalised retirement plan based on your age, income, and goals. Start planning today." />
        <link rel="canonical" href="https://corpuscalc.com/plan" />
      </Helmet>
      <PlannerShell />
    </>
  );
}
