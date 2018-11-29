import { alphaToNum } from '../problemList/utils';
import { problemIdFromNo } from '$queries/problem';
import { IProblemId, IProblemNo } from '$types';
import * as patterns from '$regexp';

export const parseProblemId = async (problemNo: IProblemNo): Promise<IProblemId | null> => {
  const match = problemNo.match(patterns.problemNo);
  if (!match) {
    return null;
  }
  const volume = alphaToNum(match[1]);
  const no = parseInt(match[2], 10);
  const problemId = await problemIdFromNo(volume, no);
  return problemId;
};
