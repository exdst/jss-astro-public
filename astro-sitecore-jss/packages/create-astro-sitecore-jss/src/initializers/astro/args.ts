import { BaseArgs } from '../../common';
import {AstroAnswer } from './prompts';

export type AstroArgs = BaseArgs & Partial<AstroAnswer>;
