export const dateFormatter = (date: string | Date) =>
  new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'long',
  }).format(new Date(date));
