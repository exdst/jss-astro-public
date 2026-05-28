import { BaseAppArgs } from '../../common';
import { AstroAnswer } from './prompts';

export type AstroArgs = BaseAppArgs & Partial<AstroAnswer>;
