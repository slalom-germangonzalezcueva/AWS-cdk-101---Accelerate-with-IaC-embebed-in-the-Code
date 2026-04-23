import type { APIGatewayProxyHandler } from 'aws-lambda';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, tableName, cvPk } from '../shared/dynamo';
import { jsonResponse, nowIso, parseJsonBody } from '../shared/response';
import type { ProfileInput } from '../shared/types';

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const input = parseJsonBody<ProfileInput>(event.body);
    const item = {
      pk: cvPk,
      sk: 'PROFILE',
      ...input,
      updatedAt: nowIso(),
    };
    await docClient.send(new PutCommand({ TableName: tableName, Item: item }));
    return jsonResponse(200, item);
  } catch (error) {
    console.error(error);
    return jsonResponse(500, { message: 'Could not update profile' });
  }
};
