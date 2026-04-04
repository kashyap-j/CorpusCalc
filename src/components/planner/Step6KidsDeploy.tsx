import { usePlannerStore } from '../../store/plannerStore';
import { computeTab2, calcAllKidGoals } from '../../lib/math';
import DeployCorpusUI, { type KidGoal } from './DeployCorpusUI';

export default function Step6KidsDeploy() {
  const { state: S } = usePlannerStore();
  const r2 = computeTab2(S);
  const kidsGoals: KidGoal[] = calcAllKidGoals(S);
  return (
    <DeployCorpusUI
      totalCorpus={r2?.totalCorpus ?? 0}
      moAtRet={r2?.moAtRet ?? 0}
      kidsGoals={kidsGoals}
    />
  );
}
