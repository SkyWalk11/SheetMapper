export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const formatDate = (date: string | Date, locale = 'en-US') =>
  new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(date));

export const truncate = (str: string, maxLength: number) =>
  str.length > maxLength ? `${str.slice(0, maxLength)}…` : str;
