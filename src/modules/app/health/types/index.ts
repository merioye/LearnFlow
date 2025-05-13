import { TElasticSearchHealth } from '@/modules/common/elasticsearch';

import { TDatabaseHealth } from '@/database';

export type THealth = {
  server: {
    message: string;
    status: string;
  };
  database: TDatabaseHealth;
  elasticSearch: TElasticSearchHealth;
};

export type TPongItem = {
  available: boolean;
  timestamp: Date;
};

export type TPong = {
  database: TPongItem;
  elasticSearch: TPongItem;
};
