import { Injectable } from '@nestjs/common';

/**
 * Generic query builder for Elasticsearch
 * Implements common query patterns and search functionality
 *
 * @template T - The document type these queries are built for
 */
@Injectable()
export class ElasticsearchQueryBuilder<T extends object> {
  /**
   * Builds a query from filter criteria
   *
   * @param filter - Object with field-value pairs to filter by
   * @returns An Elasticsearch bool query
   */
  public buildQuery(filter: Partial<T>): Record<string, unknown> {
    if (!filter || Object.keys(filter).length === 0) {
      return { match_all: {} };
    }

    const must: Record<string, unknown>[] = [];

    // Process each filter field
    for (const [field, value] of Object.entries(filter)) {
      if (value === undefined || value === null) {
        continue;
      }

      if (typeof value === 'string') {
        // Use match for text fields
        must.push({ match: { [field]: value } });
      } else if (typeof value === 'number' || typeof value === 'boolean') {
        // Use term for exact matches
        must.push({ term: { [field]: value } });
      } else if (Array.isArray(value)) {
        // Use terms for array values
        must.push({ terms: { [field]: value } });
      } else if (typeof value === 'object') {
        // Handle range queries
        const rangeConditions: Record<string, unknown> = {};

        if ('gt' in value) rangeConditions.gt = value.gt;
        if ('gte' in value) rangeConditions.gte = value.gte;
        if ('lt' in value) rangeConditions.lt = value.lt;
        if ('lte' in value) rangeConditions.lte = value.lte;

        if (Object.keys(rangeConditions).length > 0) {
          must.push({ range: { [field]: rangeConditions } });
        }
      }
    }

    return must.length > 0 ? { bool: { must } } : { match_all: {} };
  }

  /**
   * Builds a text search query across multiple fields
   *
   * @param text - The search text
   * @param fields - Fields to search in
   * @returns An Elasticsearch multi_match query
   */
  public buildTextSearchQuery(
    text: string,
    fields: string[]
  ): Record<string, unknown> {
    if (!text || !fields?.length) {
      return { match_all: {} };
    }

    return {
      multi_match: {
        query: text,
        fields,
        type: 'best_fields',
        fuzziness: 'AUTO',
        operator: 'and',
      },
    };
  }

  /**
   * Combines text search with filters
   *
   * @param text - The search text
   * @param fields - Fields to search in
   * @param filter - Additional filter criteria
   * @returns Combined Elasticsearch query
   */
  public buildCombinedQuery(
    text: string | null | undefined,
    fields: string[],
    filter?: Partial<T>
  ): Record<string, unknown> {
    // Build text search query if text is provided
    const textQuery =
      text && fields?.length ? this.buildTextSearchQuery(text, fields) : null;

    // Build filter query if filter is provided
    const filterQuery =
      filter && Object.keys(filter).length > 0 ? this.buildQuery(filter) : null;

    // If we have both queries, combine them with bool/must
    if (textQuery && filterQuery) {
      return {
        bool: {
          must: [textQuery],
          filter: [filterQuery],
        },
      };
    }

    // Return whichever query we have, or match_all if neither
    return textQuery || filterQuery || { match_all: {} };
  }

  /**
   * Builds a suggester query for autocomplete
   *
   * @param text - The prefix text to get suggestions for
   * @param field - Field to get suggestions from
   * @returns Elasticsearch completion suggester
   */
  public buildSuggesterQuery(
    text: string,
    field: string
  ): Record<string, unknown> {
    return {
      suggest: {
        text,
        completion: {
          field,
          size: 5,
          skip_duplicates: true,
          fuzzy: {
            fuzziness: 'AUTO',
          },
        },
      },
    };
  }
}
