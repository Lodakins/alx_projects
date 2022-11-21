import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy';
import { cors } from 'middy/middlewares';
import { createGroup } from '../../businessLogic/groups';
import { CreateGroupRequest } from '../../requests/CreateGroupRequest';

export const handler: APIGatewayProxyHandler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Processing event: ', event)

  const group:CreateGroupRequest = JSON.parse(event.body)
  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]

  const newItem = await createGroup(group,jwtToken);
  return {
    statusCode: 201,
    body: JSON.stringify({
      newItem
    })
  }
});

handler.use(cors({
  credentials: true
}));
