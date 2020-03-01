import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy';
import { cors } from 'middy/middlewares';
import { UpdateDocRequest } from '../../requests/UpdateDocRequest';
import { update } from '../../Logic/docs-controller';
import { createLogger } from '../../utils/logger';

const logger = createLogger('update-Doc-Handler');

const updateHandler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent,): Promise<APIGatewayProxyResult> => {
    logger.info('Update a doc', event);

    const docId = event.pathParameters.docId;
    const updatedDoc: UpdateDocRequest = JSON.parse(event.body);
    const authorization = event.headers.Authorization;
    const split = authorization.split(' ');
    const jwtToken = split[1];

    await update(docId, updatedDoc, jwtToken);

    return {
        statusCode: 204,
        body: 'doc updated',
    };
};

export const handler = middy(updateHandler).use(cors({ credentials: true }),);