import { HashAlgorithm } from '../enums';

/**
 * Options to configure the hashing behavior
 * @typedef THashOptions
 */
export type THashOptions = {
  salt?: number;
  algorithm?: HashAlgorithm;
};
