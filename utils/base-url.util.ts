export const getBaseUrl = (url: string) => {
  const parsedUrl = new URL(url);
  return `${parsedUrl.protocol}//${parsedUrl.hostname}`;
};
