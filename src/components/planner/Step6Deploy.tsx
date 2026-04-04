import { usePlannerStore } from '../../store/plannerStore';
import { compute } from '../../lib/math';
import DeployCorpusUI from './DeployCorpusUI';

export default function Step6Deploy() {
  const { state: S } = usePlannerStore();
  const r = compute(S);
  return <DeployCorpusUI totalCorpus={r.totalCorpus} moAtRet={r.moAtRet} />;
}
