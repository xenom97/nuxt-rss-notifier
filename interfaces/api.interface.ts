export interface IResponse<T> {
  status: number;
  data: null | T;
  error: null | string;
}

export interface IPayloadFetchRss {
  url: string;
  interval: number;
  title: string;
  id: number | null;
}
