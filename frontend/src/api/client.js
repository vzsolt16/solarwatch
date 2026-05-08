const BASE_URL = 'http://localhost:5115'; // Default port for .NET, adjust if needed

async function handleResponse(response) {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error = new Error(errorData.message || 'API request failed');
    error.status = response.status;
    error.data = errorData;
    throw error;
  }
  return response.json();
}

export async function request(endpoint, options = {}) {
  const { method = 'GET', body, token, ...customOptions } = options;

  const headers = {
    'Content-Type': 'application/json',
    ...customOptions.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    method,
    headers,
    ...customOptions,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, config);
  return handleResponse(response);
}
