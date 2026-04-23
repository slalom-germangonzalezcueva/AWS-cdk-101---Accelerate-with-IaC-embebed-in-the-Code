import type { APIGatewayProxyHandler } from 'aws-lambda';
import { GetCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, tableName, cvPk } from '../shared/dynamo';
import { jsonResponse } from '../shared/response';

export const handler: APIGatewayProxyHandler = async () => {
  try {
    const result = await docClient.send(new GetCommand({ TableName: tableName, Key: { pk: cvPk, sk: 'PROFILE' } }));
    return jsonResponse(200, result.Item ?? { pk: cvPk, sk: 'PROFILE', fullName: 'Demo Candidate', headline: 'Cloud Engineer' });
  } catch (error) {
    console.error(error);
    return jsonResponse(500, { message: 'Could not read profile' });
  }
};
