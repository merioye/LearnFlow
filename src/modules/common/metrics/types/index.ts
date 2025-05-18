import { MetricType } from '../enums';

export type MetricConfig = {
  name: string;
  type: MetricType;
  help?: string;
  labelNames?: string[];
  buckets?: number[]; // For histograms
  percentiles?: number[]; // For summaries
};
