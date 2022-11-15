import { handlerPath } from '@libs/handler-resolver';

export default {
  handler: `${handlerPath(__dirname)}/handler.handler`,
  events: [
    {
      websocket: {
        route: '$disconnect',
      },
    },
  ],
};