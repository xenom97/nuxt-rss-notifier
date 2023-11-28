export const dateFormatter = (date: Date) => {
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'long',
    timeZone: userTimeZone,
  }).format(date);
};
