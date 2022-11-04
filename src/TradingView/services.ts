import axios from "axios";
import { IGetExchangeInfoParams, IGetUIKlinesParams } from "./types";

const apiPrefix = "https://api.binance.com/api/v3";

const binanceServices = {
  getUIKlines: async (params: IGetUIKlinesParams) => {
    const { data } = await axios.get(`${apiPrefix}/uiKlines`, {
      params: {
        ...params,
        interval: params.interval.toLowerCase(),
      },
    });
    return data;
  },
  getExchangeInfo: async (params: IGetExchangeInfoParams) => {
    const { data } = await axios.get(`${apiPrefix}/exchangeInfo`, {
      params,
    });
    return data;
  },
};

export default binanceServices;
