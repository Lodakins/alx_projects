import { handlerPath } from '@libs/handler-resolver';

export default {
  environment: {
    "ES_ENDPOINT": "ImagesSearch.DomainEndpoint"
  },
  handler: `${handlerPath(__dirname)}/handler.handler`,
  events: [
    {
      stream: {
        "type": "dynamodb",
        "arn": "!GetAtt ImagesDynamoDBTable.StreamArn"
      }
    }
  ]
};