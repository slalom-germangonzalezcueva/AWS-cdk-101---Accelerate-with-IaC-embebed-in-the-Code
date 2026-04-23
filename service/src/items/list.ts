import type { APIGatewayProxyHandler } from 'aws-lambda';
import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, tableName, cvPk } from '../shared/dynamo';
import { jsonResponse } from '../shared/response';

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const type = event.queryStringParameters?.type;
    const result = await docClient.send(
      new QueryCommand({
        TableName: tableName,
        KeyConditionExpression: 'pk = :pk',
        ExpressionAttributeValues: { ':pk': cvPk },
        ScanIndexForward: true,
      }),
    );

    const items = (result.Items ?? [])
      .filter((item) => item.sk !== 'PROFILE')
      .filter((item) => (type ? item.type === type : true))
      .sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));

    return jsonResponse(200, { items });
  } catch (error) {
    console.error(error);
    return jsonResponse(500, { message: 'Could not list CV items' });
  }
};
