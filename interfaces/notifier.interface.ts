export interface IItem {
  title: string;
  link: string;
  pubDate: string;
  'content:encoded': string;
  'content:encodedSnippet': string;
  content: string;
  contentSnippet: string;
  guid: string;
  isoDate: Date;
}

export interface IImage {
  link: string;
  url: string;
  title: string;
}

export enum Status {
  running = 'running',
  paused = 'paused',
}

export interface INotifier {
  items: IItem[];
  image: IImage;
  title: string;
  description: string;
  pubDate: string;
  managingEditor: string;
  generator: string;
  link: string;
  language: string;
  copyright: string;
  docs: string;
  rss: string;
  interval: number;
  id: number;
  status: Status;
  intervalId: NodeJS.Timer | null;
  lastUpdated: string;
}
