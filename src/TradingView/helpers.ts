import { isEmpty } from "lodash";
import {
  Bar,
  HistoryCallback,
  IBasicDataFeed,
  IDatafeedChartApi,
  IDatafeedQuotesApi,
  IExternalDatafeed,
  PeriodParams,
} from "../charting_library/charting_library";
import binanceServices from "./services";
import { IntervalEnum } from "./types";

export function flatten(
  obj: Record<any, any>,
  { prefix = "", restrictTo }: any
) {
  let restrict = restrictTo;
  if (restrict) {
    restrict = restrict.filter((k: any) => obj.hasOwnProperty(k));
  }
  const result: Record<any, any> = {};
  (function recurse(obj, current, keys) {
    (keys || Object.keys(obj)).forEach((key: any) => {
      const value = obj[key];
      const newKey = current ? current + "." + key : key; // joined key with dot
      if (value && typeof value === "object") {
        // @ts-ignore
        recurse(value, newKey); // nested object
      } else {
        result[newKey] = value;
      }
    });
  })(obj, prefix, restrict);
  return result;
}

const configurationData = {
  supported_resolutions: ["1d", "3d", "1w", "1M"],
  exchanges: [
    {
      value: "Binance",
      name: "Binance",
      desc: "Binance",
    },
    {
      // `exchange` argument for the `searchSymbols` method, if a user selects this exchange
      value: "Kraken",

      // filter name
      name: "Kraken",

      // full exchange name displayed in the filter popup
      desc: "Kraken bitcoin exchange",
    },
  ],
  symbols_types: [
    {
      name: "crypto",

      // `symbolType` argument for the `searchSymbols` method, if a user selects this symbol type
      value: "crypto",
    },
    // ...
  ],
};

export const tradingViewDatafeed:
  | IBasicDataFeed
  | (IDatafeedChartApi & IExternalDatafeed & IDatafeedQuotesApi) = {
  onReady: (callback) => {
    console.log("[onReady]: Method call");
    setTimeout(() => {
      callback(configurationData as any);
    }, 0);
  },
  searchSymbols: (userInput, exchange, symbolType, onResultReadyCallback) => {
    console.log("[searchSymbols]: Method call");
  },
  getTimescaleMarks(symbolInfo, from, to, onDataCallback, resolution) {
    console.log("[getTimescaleMarks]: ", resolution);
  },
  resolveSymbol: async (
    symbolName,
    onSymbolResolvedCallback,
    onResolveErrorCallback
  ) => {
    console.log("[resolveSymbol]: Method call", symbolName);
    try {
      const data = await binanceServices.getExchangeInfo({
        symbol: symbolName,
      });
      onSymbolResolvedCallback({
        name: symbolName,
        full_name: symbolName,
        description: symbolName,
        ticker: symbolName,
        type: "crypto",
        session: "24x7",
        exchange: "BTC",
        listed_exchange: "BTC",
        timezone: data.timezone,
        format: "price",
        pricescale: 100000000,
        intraday_multipliers: ["1", "60"],
        minmov: 1,
        supported_resolutions: Object.values(IntervalEnum) as any,
        volume_precision: 8,
        data_status: "streaming",
      });
    } catch (error) {
      onResolveErrorCallback(error as any);
    }
  },
  getBars: async (
    symbolInfo,
    resolution,
    periodParams: PeriodParams,
    onResult: HistoryCallback,
    onError
  ) => {
    console.log("[get bars]: ", periodParams, symbolInfo);
    try {
      const { firstDataRequest, from, to } = periodParams;
      const params = {
        symbol: symbolInfo.name,
        interval: resolution as IntervalEnum,
      };
      const data = await binanceServices.getUIKlines(
        firstDataRequest
          ? params
          : {
              ...params,
              startTime: from.toString(),
              endTime: to.toString(),
            }
      );
      if (isEmpty(data)) {
        onResult([], { noData: true });
        return;
      }
      const formatData = (data as Array<Array<number | string>>).map((item) => {
        const [time, open, high, low, close, volume] = item;
        return {
          time: +time,
          open: +open,
          high: +high,
          low: +low,
          close: +close,
          volume: +volume,
        };
      });
      onResult(formatData, { noData: false });
    } catch (error) {
      onResult([], { noData: true });
      onError(error as any);
    }
  },
  subscribeBars: (
    symbolInfo,
    resolution,
    onRealtimeCallback,
    subscribeUID,
    onResetCacheNeededCallback
  ) => {
    console.log(
      "[subscribeBars]: Method call with subscribeUID:",
      subscribeUID
    );
  },
  unsubscribeBars: (subscriberUID) => {
    console.log(
      "[unsubscribeBars]: Method call with subscriberUID:",
      subscriberUID
    );
  },
};
