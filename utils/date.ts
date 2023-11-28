import dayjs from 'dayjs';
import 'dayjs/locale/id';

export const dateFormatter = (
  date: Date,
  format = 'DD MMM YYYY HH:mm:ss Z'
) => {
  return dayjs(date).locale('id').format(format);
};
