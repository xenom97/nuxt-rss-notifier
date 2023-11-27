import Parser from 'rss-parser';
import { IResponse } from '~/interfaces/api';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  try {
    const parser = new Parser();
    const feed = await parser.parseURL(body.url);
    return {
      status: 200,
      data: {
        ...feed,
        rss: body.url,
        interval: body.interval,
        title: body.title,
        id: body.id || Date.now(),
      },
      error: null,
    } as IResponse;
  } catch (error: any) {
    return {
      status: 500,
      data: null,
      error: error?.message || 'Something went wrong',
    } as IResponse;
  }
});