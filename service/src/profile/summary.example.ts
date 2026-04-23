// Live exercise file: rename to summary.ts, uncomment the CDK block in lib/aws-cdk-crash-course-stack.ts, then deploy.
import type { APIGatewayProxyHandler } from 'aws-lambda';
import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, tableName, cvPk } from '../shared/dynamo';
import { jsonResponse } from '../shared/response';

export const handler: APIGatewayProxyHandler = async () => {
  const result = await docClient.send(
    new QueryCommand({
      TableName: tableName,
      KeyConditionExpression: 'pk = :pk',
      ExpressionAttributeValues: { ':pk': cvPk },
    }),
  );

  const items = result.Items ?? [];
  const profile = items.find((item) => item.sk === 'PROFILE') ?? {};
  const byType = items
    .filter((item) => item.sk !== 'PROFILE')
    .reduce<Record<string, number>>((acc, item) => {
      acc[String(item.type)] = (acc[String(item.type)] ?? 0) + 1;
      return acc;
    }, {});

  return jsonResponse(200, {
    name: profile.fullName ?? 'Demo Candidate',
    headline: profile.headline ?? 'Cloud Engineer',
    totalItems: items.length - 1,
    byType,
  });
};
