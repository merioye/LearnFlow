import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  collectDefaultMetrics,
  Counter,
  Gauge,
  Histogram,
  Registry,
  Summary,
} from 'prom-client';

import { Config } from '@/enums';
import { APP_NAME } from '@/constants';

import { ILogger, InjectLogger } from '../../logger';
import { MetricType } from '../enums';
import { MetricConfig } from '../types';

/**
 * Service for managing metrics.
 *
 * This service provides methods to create and manage metrics,
 * including counters, gauges, histograms, and summaries.
 *
 * @class MetricsService
 */
@Injectable()
export class MetricsService {
  private readonly _registry: Registry;
  private readonly _metrics: Map<string, any> = new Map();
  private readonly _defaultLabels: Record<string, string>;

  /**
   * Creates an instance of MetricsService.
   *
   * Initializes a Prometheus registry, sets default labels (application name
   * and environment), and starts collection of default system metrics.
   *
   * @param _logger Logger instance for logging metric registration events.
   * @param _configService Service to access application configuration (e.g., environment).
   */
  public constructor(
    @InjectLogger() private readonly _logger: ILogger,
    private readonly _configService: ConfigService
  ) {
    this._registry = new Registry();

    // Configure default labels for all metrics
    this._defaultLabels = {
      app: APP_NAME,
      environment: this._configService.get<string>(Config.NODE_ENV)!,
    };

    this._registry.setDefaultLabels(this._defaultLabels);

    // Initialize default metrics collection
    this._collectDefaultMetrics();
  }

  /**
   * Creates or retrieves an existing metric based on the provided configuration.
   *
   * Supports COUNTER, GAUGE, HISTOGRAM, and SUMMARY metric types.
   *
   * @template T The metric type (e.g., Counter, Gauge).
   * @param config Configuration for the metric.
   * @returns The metric instance.
   * @throws Error if the metric type is unsupported.
   */
  public getOrCreateMetric<T>(config: MetricConfig): T {
    const name = config.name;

    if (this._metrics.has(name)) {
      return this._metrics.get(name) as T;
    }

    let metric;
    const baseConfig = {
      name,
      help: config.help || name,
      labelNames: config.labelNames || [],
      registers: [this._registry],
    };

    switch (config.type) {
      case MetricType.COUNTER:
        metric = new Counter(baseConfig);
        break;
      case MetricType.GAUGE:
        metric = new Gauge(baseConfig);
        break;
      case MetricType.HISTOGRAM:
        metric = new Histogram({
          ...baseConfig,
          buckets: config.buckets || [0.1, 0.5, 1, 2, 5],
        });
        break;
      case MetricType.SUMMARY:
        metric = new Summary({
          ...baseConfig,
          percentiles: config.percentiles || [0.01, 0.05, 0.5, 0.9, 0.95, 0.99],
        });
        break;
      default:
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        throw new Error(`Unsupported metric type: ${config.type}`);
    }

    this._metrics.set(name, metric);
    this._logger.log(`Registered new metric: ${name} (${config.type})`);
    return metric as T;
  }

  /**
   * Increment a counter metric by a given value.
   *
   * @param name The name of the counter metric.
   * @param labels Optional labels to associate with the increment.
   * @param value The increment value (default is 1).
   */
  public incrementCounter(
    name: string,
    labels?: Record<string, string | number>,
    value: number = 1
  ): void {
    const metric = this.getOrCreateMetric<Counter>({
      name,
      type: MetricType.COUNTER,
      help: `Counter for ${name}`,
      labelNames: labels ? Object.keys(labels) : [],
    });

    if (labels) {
      metric.inc(labels, value);
    } else {
      metric.inc(value);
    }
  }

  /**
   * Set a gauge metric to a specific value.
   *
   * @param name The name of the gauge metric.
   * @param value The value to set.
   * @param labels Optional labels to associate with the value.
   */
  public setGauge(
    name: string,
    value: number,
    labels?: Record<string, string | number>
  ): void {
    const metric = this.getOrCreateMetric<Gauge>({
      name,
      type: MetricType.GAUGE,
      help: `Gauge for ${name}`,
      labelNames: labels ? Object.keys(labels) : [],
    });

    if (labels) {
      metric.set(labels, value);
    } else {
      metric.set(value);
    }
  }

  /**
   * Observe a value for a histogram metric.
   *
   * @param name The name of the histogram metric.
   * @param value The value to observe.
   * @param labels Optional labels to associate with the observation.
   * @param buckets Optional bucket boundaries for the histogram.
   */
  public observeHistogram(
    name: string,
    value: number,
    labels?: Record<string, string | number>,
    buckets?: number[]
  ): void {
    const metric = this.getOrCreateMetric<Histogram>({
      name,
      type: MetricType.HISTOGRAM,
      help: `Histogram for ${name}`,
      labelNames: labels ? Object.keys(labels) : [],
      buckets,
    });

    if (labels) {
      metric.observe(labels, value);
    } else {
      metric.observe(value);
    }
  }

  /**
   * Observe a value for a summary metric.
   *
   * @param name The name of the summary metric.
   * @param value The value to observe.
   * @param labels Optional labels to associate with the observation.
   * @param percentiles Optional percentiles for the summary.
   */
  public observeSummary(
    name: string,
    value: number,
    labels?: Record<string, string | number>,
    percentiles?: number[]
  ): void {
    const metric = this.getOrCreateMetric<Summary>({
      name,
      type: MetricType.SUMMARY,
      help: `Summary for ${name}`,
      labelNames: labels ? Object.keys(labels) : [],
      percentiles,
    });

    if (labels) {
      metric.observe(labels, value);
    } else {
      metric.observe(value);
    }
  }

  /**
   * Returns all metrics in Prometheus exposition format as a string.
   *
   * @returns A Promise resolving to the metrics string.
   */
  public async getMetricsAsString(): Promise<string> {
    return await this._registry.metrics();
  }

  /**
   * Returns the underlying Prometheus Registry instance.
   *
   * @returns The metrics Registry.
   */
  public getRegistry(): Registry {
    return this._registry;
  }

  /**
   * Starts collection of default metrics exposed by the platform.
   *
   * Registers metrics such as CPU, memory usage, and event loop metrics with the registry.
   * @returns {void}
   */
  private _collectDefaultMetrics(): void {
    collectDefaultMetrics({ register: this._registry, prefix: 'app_' });
  }
}
