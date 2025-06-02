import { getToken } from './auth';

const GRAPHQL_ENDPOINT = 'https://learn.reboot01.com/api/graphql-engine/v1/graphql';

export interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string }>;
}

export async function graphqlQuery<T>(
  query: string,
  variables?: Record<string, any>
): Promise<T> {
  const token = getToken();
  
  if (!token) {
    throw new Error('No authentication token found');
  }

  // Basic JWT validation
  const jwtParts = token.split('.');
  if (jwtParts.length !== 3) {
    console.error('Invalid JWT format:', token);
    localStorage.removeItem('jwt');
    throw new Error('Invalid token format. Please log in again.');
  }

  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('GraphQL error:', response.status, errorText);
      
      if (response.status === 401) {
        localStorage.removeItem('jwt');
        throw new Error('Session expired. Please log in again.');
      }
      
      throw new Error(`Request failed: ${response.status}`);
    }

    const result: GraphQLResponse<T> = await response.json();

    if (result.errors) {
      throw new Error(result.errors[0].message);
    }

    if (!result.data) {
      throw new Error('No data returned');
    }

    return result.data;
  } catch (error: any) {
    console.error('Query failed:', error);
    
    if (error.message.includes('JWT') || error.message.includes('JWS')) {
      localStorage.removeItem('jwt');
      throw new Error('Invalid token. Please log in again.');
    }
    
    throw error;
  }
}