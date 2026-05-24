const BASE_URL = import.meta.env.VITE_API_URL;

if (!BASE_URL) {
  throw new Error('VITE_API_URL is not configured');
}

async function handleResponse(response) {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));

    const error = new Error(errorData.message || 'API request failed');
    error.status = response.status;
    error.data = errorData;

    throw error;
  }

  // 204 No Content
  if (response.status === 204) {
    return null;
  }

  // Only parse JSON if it exists
  const contentType = response.headers.get('content-type');

  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }

  return null;
}

let isRefreshing = false;
let refreshSubscribers = [];

function subscribeTokenRefresh(cb) {
  refreshSubscribers.push(cb);
}

function onRefreshed() {
  refreshSubscribers.forEach((cb) => cb(null));
  refreshSubscribers = [];
}

function onRefreshFailed(error) {
  refreshSubscribers.forEach((cb) => cb(error));
  refreshSubscribers = [];
}

export async function request(endpoint, options = {}) {
  const { method = 'GET', body, ...customOptions } = options;

  const headers = {
    'Content-Type': 'application/json',
    ...customOptions.headers,
  };

  const config = {
    method,
    headers,
    credentials: 'include',
    ...customOptions,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);

    // Handle expired access token
    if (
        response.status === 401 &&
        endpoint !== '/Auth/Refresh' &&
        endpoint !== '/Auth/Login'
    ) {
      // Only attempt refresh if we have a stored user/session
      const hasUser = localStorage.getItem('user');

      if (!hasUser) {
        return handleResponse(response);
      }

      if (!isRefreshing) {
        isRefreshing = true;

        try {
          await request('/Auth/Refresh', {
            method: 'POST',
          });

          isRefreshing = false;
          onRefreshed();
        } catch (refreshError) {
          isRefreshing = false;

          localStorage.removeItem('user');

          onRefreshFailed(refreshError);

          throw refreshError;
        }
      }

      return new Promise((resolve, reject) => {
        subscribeTokenRefresh((error) => {
          if (error) {
            reject(error);
          } else {
            resolve(request(endpoint, options));
          }
        });
      });
    }

    return handleResponse(response);
  } catch (error) {
    throw error;
  }
}