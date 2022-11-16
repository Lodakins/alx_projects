import { handlerPath } from '@libs/handler-resolver';

export default {
  handler: `${handlerPath(__dirname)}/handler.handler`,
  events: [
    {
      http: {
        method: 'post',
        path: 'groups/{groupId}/images',
        reqValidatorName: "RequestBodyValidator",
        documentation: {
          "summary": "Create a new image for a group",
          "description": "Create a new image for a group",
          "requestModels": {
            "application/json": "ImageRequest"
          }
        }
      },
    },
  ],
};