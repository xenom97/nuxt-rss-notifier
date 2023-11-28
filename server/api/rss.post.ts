import Parser from 'rss-parser';
import { IPayloadFetchRss, IResponse } from '~/interfaces/api.interface';
import { INotifier, Status } from '~/interfaces/notifier.interface';

export default defineEventHandler(
  async (event): Promise<IResponse<INotifier>> => {
    const body: IPayloadFetchRss = await readBody(event);
    try {
      const parser = new Parser();
      const feed = await parser.parseURL(body.url);

      return {
        status: 200,
        data: {
          ...(feed as any),
          rss: body.url,
          interval: body.interval,
          title: body.title,
          id: body.id || Date.now(),
          status: Status.running,
        },
        error: null,
      };
    } catch (error: any) {
      return {
        status: 500,
        data: null,
        error: error?.message || 'Something went wrong',
      };
    }
  }
);
