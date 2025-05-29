import { Module } from '@nestjs/common';

import { UsersMetrics } from './metrics';
import { SecurityModule } from './security';
import { AuthService } from './services';

/**
 * The AuthModule is responsible for managing the authentication functionalities
 * within the application. It integrates the necessary controllers and services
 * to handle authentication operations.
 *
 * @module AuthModule
 */
@Module({
  imports: [SecurityModule],
  providers: [UsersMetrics, AuthService],
  exports: [],
})
export class AuthModule {}

// @Module({
//   providers: [
//     UsersMetrics,
//     AuthService,
//     {
//       provide: UserElasticsearchService,
//       useFactory: (esFactory: ElasticsearchServiceFactory) => {
//         return esFactory.create(UserElasticsearchService, 'users');
//       },
//       inject: [ElasticsearchServiceFactory],
//     },
//     {
//       provide: USERS_INDEX_CONFIG,
//       useValue: {
//         index: 'users',
//         mappings: {
//           properties: {
//             id: { type: 'keyword' },
//             email: { type: 'keyword' },
//             username: { type: 'text', fields: { keyword: { type: 'keyword' } } },
//             firstName: { type: 'text', analyzer: 'standard' },
//             lastName: { type: 'text', analyzer: 'standard' },
//             bio: { type: 'text', analyzer: 'standard' },
//             createdAt: { type: 'date' },
//             updatedAt: { type: 'date' },
//           }
//         },
//         settings: {
//           number_of_shards: 1,
//           number_of_replicas: 1,
//           analysis: {
//             analyzer: {
//               standard: {
//                 type: 'standard',
//                 stopwords: '_english_'
//               }
//             }
//           }
//         }
//       }
//     }
//   ],
//   exports: [],
// })
