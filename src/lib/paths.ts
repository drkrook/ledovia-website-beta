export const base = import.meta.env.BASE_URL;
export const url = (path = '') => `${base}${path.replace(/^\//, '')}`;
