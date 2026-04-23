import type { APIGatewayProxyHandler } from 'aws-lambda';
import { QueryCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, tableName, cvPk } from '../shared/dynamo';
import { jsonResponse, nowIso, parseJsonBody } from '../shared/response';
import type { CvItemInput } from '../shared/types';

const editableFields = ['type', 'title', 'subtitle', 'description', 'tags', 'startDate', 'endDate', 'metadata'] as const;

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const id = event.pathParameters?.id;
    if (!id) return jsonResponse(400, { message: 'id is required' });

    const input = parseJsonBody<Partial<CvItemInput>>(event.body);
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

    const names: Record<string, string> = { '#updatedAt': 'updatedAt' };
    const values: Record<string, unknown> = { ':updatedAt': nowIso() };
    const sets = ['#updatedAt = :updatedAt'];

    for (const field of editableFields) {
      if (input[field] !== undefined) {
        names[`#${field}`] = field;
        values[`:${field}`] = input[field];
        sets.push(`#${field} = :${field}`);
      }
    }

    const result = await docClient.send(
      new UpdateCommand({
        TableName: tableName,
        Key: { pk: cvPk, sk: current.sk },
        UpdateExpression: `SET ${sets.join(', ')}`,
        ExpressionAttributeNames: names,
        ExpressionAttributeValues: values,
        ReturnValues: 'ALL_NEW',
      }),
    );

    return jsonResponse(200, result.Attributes);
  } catch (error) {
    console.error(error);
    return jsonResponse(500, { message: 'Could not update CV item' });
  }
};
