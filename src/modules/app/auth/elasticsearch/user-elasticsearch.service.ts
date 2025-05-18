// import { Injectable } from '@nestjs/common';
// import { ElasticsearchService } from '@nestjs/elasticsearch';
// import { BaseElasticsearchService } from '@/modules/common/elasticsearch';
// import { ILogger, InjectLogger } from '@/modules/common/logger';

// type TUser = {
//   id: number;
//   firstName: string;
//   lastName: string;
// };
// @Injectable()
// export class UserElasticsearchService extends BaseElasticsearchService<TUser> {
//   public constructor(
//     esService: ElasticsearchService,
//     @InjectLogger() logger: ILogger
//   ) {
//     super(esService, 'users', logger);
//   }
// }
