import type { APIGatewayProxyHandler } from 'aws-lambda';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { randomUUID } from 'crypto';
import { docClient, tableName, cvPk } from '../shared/dynamo';
import { jsonResponse, nowIso, parseJsonBody } from '../shared/response';
import type { CvItemInput } from '../shared/types';

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const input = parseJsonBody<CvItemInput>(event.body);
    if (!input.type || !input.title) {
      return jsonResponse(400, { message: 'type and title are required' });
    }

    const id = randomUUID();
    const timestamp = nowIso();
    const item = {
      pk: cvPk,
      sk: `${input.type}#${id}`,
      id,
      ...input,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await docClient.send(new PutCommand({ TableName: tableName, Item: item }));
    return jsonResponse(201, item);
  } catch (error) {
    console.error(error);
    return jsonResponse(500, { message: 'Could not create CV item' });
  }
};
