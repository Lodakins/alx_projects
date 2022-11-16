import { handlerPath } from '@libs/handler-resolver';

export default {
  handler: `${handlerPath(__dirname)}/handler.handler`,
  events: [
    {
      http: {
        method: 'post',
        path: 'groups',
        reqValidatorName: "RequestBodyValidator",
          documentation: {
            "summary": "Create a new group",
            "description": "Create a new group",
            "requestModels": {
              "application/json": "GroupRequest"
            }
          }
      },
    },
  ],
};