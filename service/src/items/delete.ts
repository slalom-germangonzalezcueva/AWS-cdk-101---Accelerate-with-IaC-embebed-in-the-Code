import type { APIGatewayProxyHandler } from 'aws-lambda';
import { DeleteCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, tableName, cvPk } from '../shared/dynamo';
import { jsonResponse } from '../shared/response';

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const id = event.pathParameters?.id;
    if (!id) return jsonResponse(400, { message: 'id is required' });

    const existing = await docClient.send(
      new QueryCommand({
        TableName: tableName,
        KeyConditionExpression: 'pk = :pk',
        FilterExpression: 'id = :id',
        ExpressionAttributeValues: { ':pk': cvPk, ':id': id },
      }),
    );
    const current = existing.Items?.[0];
    if (!current) return jsonResponse(404, { message: 'CV item not found' });

    await docClient.send(new DeleteCommand({ TableName: tableName, Key: { pk: cvPk, sk: current.sk } }));
    return jsonResponse(200, { deleted: true, id });
  } catch (error) {
    console.error(error);
    return jsonResponse(500, { message: 'Could not delete CV item' });
  }
};
