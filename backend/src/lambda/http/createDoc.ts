import 'source-map-support/register'
import * as middy from 'middy'
import {cors} from 'middy/middlewares'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { CreateDocRequest } from '../../requests/CreateDocRequest';
import { createDoc } from '../../Logic/docs-controller';
import { createLogger } from '../../utils/logger';

const logger = createLogger('create-Doc-Handler');

const createHandler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent,): Promise<APIGatewayProxyResult> => {
  // DOC: Implement creating a new DOC item
  
  logger.info('new doc item', event);

  const newDoc: CreateDocRequest = JSON.parse(event.body);
  const authorization = event.headers.Authorization;
  const split = authorization.split(' ');
  const jwtToken = split[1];

  const newItem = await createDoc(newDoc, jwtToken);
  return {
      statusCode: 201,
      body: JSON.stringify({
          newItem,
      }),
  };
};

export const handler = middy(createHandler).use(cors({ credentials: true }),);  
 
