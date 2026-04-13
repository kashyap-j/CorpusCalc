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
        <meta name="description" content="Create a personalised 6-step retirement plan tailored for India. Calculate your corpus, SIP, and deployment strategy for free." />
        <link rel="canonical" href="https://corpuscalc.com/plan" />
      </Helmet>
      <PlannerShell />
    </>
  );
}
