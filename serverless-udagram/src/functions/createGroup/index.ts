import schema from './schema';
import { handlerPath } from '@libs/handler-resolver';

export default {
  handler: `${handlerPath(__dirname)}/handler.handler`,
  events: [
    {
      http: {
        method: 'post',
        path: 'groups',
        request: {
          schemas: {
            'application/json': schema,
          },
        },
      },
    },
  ],
};