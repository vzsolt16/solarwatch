import { request } from './client';

export const solarApi = {
  getSolarTimes: (city, date) => {
    const query = new URLSearchParams({ city, date, utc: 'false' });
    return request(`/api/solar-times?${query.toString()}`);
  },
};
