import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { deleteDoc } from '../../Logic/docs-controller';
import { createLogger } from '../../utils/logger';

const logger = createLogger('delete-Doc-Handler');

const deleteHandler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent, ): Promise<APIGatewayProxyResult> => {
  // DOC: Remove a DOC item by id

  logger.info('Delete doc id', event);

  const docId = event.pathParameters.docId;
  const authorization = event.headers.Authorization;
  const split = authorization.split(' ');
  const jwtToken = split[1];

  await deleteDoc(docId, jwtToken);
  return {
    statusCode: 204,
    body: 'Item deleted',
  };
};

export const handler = middy(deleteHandler).use(cors({ credentials: true }),);

