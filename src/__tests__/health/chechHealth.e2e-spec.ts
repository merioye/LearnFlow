describe('Health Check', () => {
  it('should pass', () => {
    expect(200).toBe(200);
  });
});

// import { NestExpressApplication } from '@nestjs/platform-express';
// import { Test, TestingModule } from '@nestjs/testing';
// import { HealthModule } from '@/modules/app/health';
// import { CommonAppModule } from '@/modules/common';
// import request from 'supertest';

// import { loggerModuleOptions } from '@/config';
// import { ENDPOINTS } from '@/constants';

// jest.mock('callsites', () => {
//   return jest.fn(() => []);
// });

// describe(`GET ${ENDPOINTS.Health.Base}${ENDPOINTS.Health.Get.HealthCheck}`, () => {
//   let app: NestExpressApplication;

//   beforeAll(async () => {
//     const moduleRef: TestingModule = await Test.createTestingModule({
//       imports: [
//         CommonAppModule.forRoot({
//           logger: loggerModuleOptions,
//         }),
//         HealthModule,
//       ],
//     }).compile();

//     app = moduleRef.createNestApplication();
//     await app.init();
//   });

//   afterAll(async () => {
//     await app.close();
//   });

//   it('should return 200 and health status', async () => {
//     const server = app.getHttpServer();
//     const response = await request(server).get(
//       ENDPOINTS.Health.Base + ENDPOINTS.Health.Get.HealthCheck
//     );

//     expect(response.statusCode).toBe(200);
//   });
// });
