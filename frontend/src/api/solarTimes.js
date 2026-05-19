import { request } from './client';

export const solarApi = {
  getSolarTimes: (city, date, token) => {
    const query = new URLSearchParams({ city, date, utc: 'false' });
    return request(`/api/solar-times?${query.toString()}`, { token });
  },
};
