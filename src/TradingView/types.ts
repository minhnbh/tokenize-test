export enum IntervalEnum {
  ONE_MINUTE = "1m",
  THREE_MINUTES = "3m",
  FIVE_MINUTES = "5m",
  FIFTEEN_MINUTES = "15m",
  THIRTY_MINUTES = "30m",
  ONE_HOUR = "1H",
  TWO_HOURS = "2H",
  FOUR_HOURS = "4H",
  SIX_HOURS = "6H",
  EIGHT_HOURS = "8H",
  TWELVE_HOURS = "12H",
  ONE_DAY = "1D",
  THREE_DAYS = "3D",
  ONE_WEEK = "1W",
  ONE_MONTH = "1M",
}

export interface IGetUIKlinesParams {
  symbol: string;
  interval: IntervalEnum;
  startTime?: string;
  endTime?: string;
}

export interface IGetExchangeInfoParams {
  symbol?: string;
  symbols?: string[];
}
