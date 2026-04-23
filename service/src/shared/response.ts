export const jsonResponse = (statusCode: number, body: unknown) => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'OPTIONS,GET,POST,PUT,DELETE',
  },
  body: JSON.stringify(body),
});

export const parseJsonBody = <T>(body: string | null | undefined): T => {
  if (!body) throw new Error('Missing request body');
  return JSON.parse(body) as T;
};

export const nowIso = () => new Date().toISOString();
