type Headers = { [key: string]: any };

type Config = {
  method: 'POST' | 'GET';
  [key: string]: any;
};

type Options = {
  body?: any;
  apiUrl?: string;
  token?: string;
  [key: string]: any;
};

export const client = <T>(
  endpoint: string,
  { body, apiUrl, token, ...customConfig }: Options = {},
): Promise<T> => {
  const headers: Headers = { 'content-type': 'application/json' };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const config: Config = {
    method: body ? 'POST' : 'GET',
    ...customConfig,
    headers: {
      ...headers,
      ...customConfig.headers,
    },
  };
  if (body) {
    config.body = JSON.stringify(body);
  }
  return fetch(`${apiUrl}${endpoint}`, config).then(async (response) => {
    if (response.status === 401) {
      return;
    }
    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      const errorMessage = await response.text();
      return Promise.reject(new Error(errorMessage));
    }
  });
};
