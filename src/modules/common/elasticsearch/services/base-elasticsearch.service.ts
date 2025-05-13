import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import {
  BulkResponse,
  DeleteByQueryResponse,
  DeleteResponse,
  GetResponse,
  IndexRequest,
  IndexResponse,
  IndicesRefreshResponse,
  QueryDslQueryContainer,
  SearchHit,
  SearchResponse,
  UpdateResponse,
} from '@elastic/elasticsearch/lib/api/types';

import { ILogger } from '../../logger';
import {
  TBulkIndexResult,
  TElasticsearchSearchParams,
  TElasticsearchSearchResult,
} from '../types';

/**
 * Base abstract service for Elasticsearch operations
 * Provides common CRUD and search functionality for any document type
 *
 * @class BaseElasticsearchService
 * @template T - The type of documents stored in the index
 */
@Injectable()
export abstract class BaseElasticsearchService<T extends object> {
  /**
   * @param esService - The Elasticsearch service for performing operations
   * @param indexName - The name of the index this repository operates on
   * @param logger - Logger service for diagnostic information
   */
  public constructor(
    protected readonly esService: ElasticsearchService,
    protected readonly indexName: string,
    protected readonly logger: ILogger
  ) {}

  /**
   * Indexes a document in Elasticsearch
   *
   * @param document - The document to index
   * @param id - Optional document ID. If not provided, Elasticsearch will generate one
   * @returns The Elasticsearch response
   * @throws Error if indexing fails
   */
  public async index(document: T, id?: string): Promise<IndexResponse> {
    const context = {
      name: 'BaseElasticsearchService',
      method: 'index',
    };

    try {
      const params: IndexRequest<T> = {
        index: this.indexName,
        body: document,
        ...(id && { id }),
        refresh: 'wait_for', // Ensures document is available for search immediately
      };

      return await this.esService.index(params);
    } catch (error) {
      this.logger.error(`Error indexing document in ${this.indexName}:`, {
        context,
        error,
      });
      throw error;
    }
  }

  /**
   * Indexes multiple documents in a single bulk operation
   *
   * @param documents - Array of documents to index
   * @param idField - Optional field name to use as document ID
   * @returns Object with operation results including success status and item details
   * @throws Error if bulk indexing fails
   */
  public async bulkIndex(
    documents: T[],
    idField?: keyof T
  ): Promise<TBulkIndexResult> {
    const context = {
      name: 'BaseElasticsearchService',
      method: 'bulkIndex',
    };

    try {
      if (documents.length === 0) return { success: true, count: 0 };

      const operations = documents.flatMap((doc) => {
        const id = idField ? String(doc[idField]) : undefined;
        const operation = [
          { index: { _index: this.indexName, ...(id && { _id: id }) } },
          doc,
        ];
        return operation;
      });

      const response: BulkResponse = await this.esService.bulk({
        refresh: 'wait_for',
        body: operations,
      });

      if (response.errors) {
        this.logger.warn(
          `Some errors occurred during bulk indexing in ${this.indexName}`,
          {
            context,
          }
        );
      }

      return {
        success: !response.errors,
        items: response.items,
        took: response.took,
        count: documents.length,
      };
    } catch (error) {
      this.logger.error(`Error bulk indexing documents in ${this.indexName}:`, {
        context,
        error,
      });
      throw error;
    }
  }

  /**
   * Searches for documents matching specified criteria
   *
   * @param params - Search parameters including query, pagination, sorting, etc.
   * @returns Object containing matched documents, total count, and optional aggregations
   * @throws Error if search fails
   */
  public async search(
    params: TElasticsearchSearchParams = {}
  ): Promise<TElasticsearchSearchResult<T>> {
    const context = {
      name: 'BaseElasticsearchService',
      method: 'search',
    };

    try {
      const {
        query,
        from = 0,
        size = 10,
        sort,
        _source,
        aggs,
        highlight,
      } = params;

      const response: SearchResponse = await this.esService.search({
        index: this.indexName,
        ...(query && { query }),
        ...(sort && { sort }),
        ...(aggs && { aggs }),
        ...(highlight && { highlight }),
        // body: {
        //   ...(query && { query }),
        //   ...(sort && { sort }),
        //   ...(aggs && { aggs }),
        //   ...(highlight && { highlight }),
        // },
        from,
        size,
        _source,
      });

      return {
        hits: (response.hits.hits || []).map((hit: SearchHit) => ({
          _source: hit._source as T,
          _id: hit._id || '',
          _score: hit._score || 0,
          ...(hit.highlight && { highlight: hit.highlight }),
        })),
        total:
          typeof response.hits.total === 'object'
            ? response.hits.total.value
            : (response.hits.total as number),
        ...(response.aggregations && { aggregations: response.aggregations }),
      };
    } catch (error) {
      this.logger.error(`Error searching in index ${this.indexName}:`, {
        context,
        error,
      });
      throw error;
    }
  }

  /**
   * Find a document by its ID
   *
   * @param id - The document ID to retrieve
   * @returns The document if found, null otherwise
   * @throws Error if the retrieval fails for reasons other than document not found
   */
  public async findById(id: string): Promise<T | null> {
    const context = {
      name: 'BaseElasticsearchService',
      method: 'findById',
    };

    try {
      const response: GetResponse = await this.esService.get({
        index: this.indexName,
        id,
      });

      return response._source as T;
    } catch (error) {
      if ((error as { statusCode: number })?.statusCode === 404) {
        return null;
      }
      this.logger.error(`Error finding document by ID in ${this.indexName}:`, {
        context,
        error,
      });
      throw error;
    }
  }

  /**
   * Updates a document with the specified ID
   *
   * @param id - The ID of the document to update
   * @param document - Partial document with fields to update
   * @returns The Elasticsearch update response
   * @throws Error if the update fails
   */
  public async update(
    id: string,
    document: Partial<T>
  ): Promise<UpdateResponse<T>> {
    const context = {
      name: 'BaseElasticsearchService',
      method: 'update',
    };

    try {
      return await this.esService.update({
        index: this.indexName,
        id,
        doc: document,
        // body: {
        //   doc: document
        // },
        refresh: 'wait_for',
      });
    } catch (error) {
      this.logger.error(`Error updating document by ID in ${this.indexName}:`, {
        context,
        error,
      });
      throw error;
    }
  }

  /**
   * Deletes a document with the specified ID
   *
   * @param id - The ID of the document to delete
   * @returns The Elasticsearch delete response
   * @throws Error if the deletion fails
   */
  public async delete(id: string): Promise<DeleteResponse> {
    const context = {
      name: 'BaseElasticsearchService',
      method: 'delete',
    };

    try {
      return await this.esService.delete({
        index: this.indexName,
        id,
        refresh: 'wait_for',
      });
    } catch (error) {
      this.logger.error(`Error deleting document by ID in ${this.indexName}:`, {
        context,
        error,
      });
      throw error;
    }
  }

  /**
   * Deletes documents matching the specified query
   *
   * @param query - Elasticsearch query to match documents for deletion
   * @returns The Elasticsearch deleteByQuery response
   * @throws Error if the operation fails
   */
  public async deleteByQuery(
    // query: Record<string, unknown>
    query: QueryDslQueryContainer
  ): Promise<DeleteByQueryResponse> {
    const context = {
      name: 'BaseElasticsearchService',
      method: 'deleteByQuery',
    };

    try {
      return await this.esService.deleteByQuery({
        index: this.indexName,
        query,
        // body: {
        //   query,
        // },
        refresh: true,
      });
    } catch (error) {
      this.logger.error(
        `Error deleting documents by query in ${this.indexName}:`,
        {
          context,
          error,
        }
      );
      throw error;
    }
  }

  /**
   * Counts documents matching the specified query
   *
   * @param query - Elasticsearch query to match documents for counting
   * @returns The count of matching documents
   * @throws Error if the count operation fails
   */
  public async count(
    // query: Record<string, unknown> = { match_all: {} }
    query: QueryDslQueryContainer = { match_all: {} }
  ): Promise<number> {
    const context = {
      name: 'BaseElasticsearchService',
      method: 'count',
    };

    try {
      const response = await this.esService.count({
        index: this.indexName,
        query,
        // body: {
        //   query,
        // },
      });

      return response.count;
    } catch (error) {
      this.logger.error(`Error counting documents in ${this.indexName}:`, {
        context,
        error,
      });
      throw error;
    }
  }

  /**
   * Refreshes the index, making all operations performed since the last refresh available for search
   *
   * @returns The Elasticsearch refresh response
   * @throws Error if the refresh operation fails
   */
  public async refreshIndex(): Promise<IndicesRefreshResponse> {
    const context = {
      name: 'BaseElasticsearchService',
      method: 'refreshIndex',
    };

    try {
      return await this.esService.indices.refresh({
        index: this.indexName,
      });
    } catch (error) {
      this.logger.error(`Error refreshing index ${this.indexName}:`, {
        context,
        error,
      });
      throw error;
    }
  }
}
