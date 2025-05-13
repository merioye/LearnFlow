import { THashOptions } from '../types';

export interface IHashService {
  hash(data: string, options?: THashOptions): Promise<string>;
  compare(
    data: string,
    encrypted: string,
    options?: THashOptions
  ): Promise<boolean>;
}
