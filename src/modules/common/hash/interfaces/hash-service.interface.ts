import { THashOptions } from '../types';

export interface IHashService {
  hash(data: string, options?: THashOptions): Promise<string>;
  hashSync(data: string, options?: THashOptions): string;
  compare(
    data: string,
    encrypted: string,
    options?: THashOptions
  ): Promise<boolean>;
  compareSync(data: string, encrypted: string, options?: THashOptions): boolean;
}
