export const getBaseUrl = (url: string): string => {
  const parsedUrl = new URL(url);
  const domainName = parsedUrl.hostname.split('.').slice(1).join('.');
  return `${parsedUrl.protocol}//${domainName}`;
};

export const getDomainName = (url: string) => {
  return getBaseUrl(url).split('//')[1].split('.')[0];
};
