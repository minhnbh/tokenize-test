import React, { useMemo } from "react";
import { useState } from "react";
import {
  widget,
  ChartingLibraryWidgetOptions,
  IChartingLibraryWidget,
} from "../charting_library";
import {
  overrideProperties,
  tradingOrderPanelSettingsBroker,
} from "./constants";
import { flatten, tradingViewDatafeed } from "./helpers";
import * as saveLoadAdapter from "./saveLoadAdapter";
import { IntervalEnum } from "./types";

export interface ChartContainerProps {
  symbol: ChartingLibraryWidgetOptions["symbol"];
  interval: ChartingLibraryWidgetOptions["interval"];
  auto_save_delay: ChartingLibraryWidgetOptions["auto_save_delay"];

  // BEWARE: no trailing slash is expected in feed URL
  // datafeed: any;
  libraryPath: ChartingLibraryWidgetOptions["library_path"];
  chartsStorageUrl: ChartingLibraryWidgetOptions["charts_storage_url"];
  chartsStorageApiVersion: ChartingLibraryWidgetOptions["charts_storage_api_version"];
  clientId: ChartingLibraryWidgetOptions["client_id"];
  userId: ChartingLibraryWidgetOptions["user_id"];
  fullscreen: ChartingLibraryWidgetOptions["fullscreen"];
  autosize: ChartingLibraryWidgetOptions["autosize"];
  studiesOverrides: ChartingLibraryWidgetOptions["studies_overrides"];
  container: ChartingLibraryWidgetOptions["container"];
  theme: "Dark" | "Light";
}

const TradingView: React.FC = () => {
  const tvWidgetRef = React.useRef<IChartingLibraryWidget | null>(null);
  const [currentInterval, setCurrentInterval] = useState(
    localStorage.getItem("interval_filter") || IntervalEnum.ONE_DAY
  );

  const defaultProps: ChartContainerProps = {
    symbol: "BTCUSDT",
    // @ts-ignore
    interval: localStorage.getItem("interval_filter") || IntervalEnum.ONE_DAY,
    auto_save_delay: 5,
    theme: "Dark",
    container: "tv_chart_container",
    // datafeed: datafeed,
    libraryPath: "/charting_library/",
    chartsStorageApiVersion: "1.1",
    clientId: "tradingview.com",
    userId: "public_user_id",
    fullscreen: false,
    autosize: true,
    studiesOverrides: {},
  };

  const chartProperties = JSON.parse(
    localStorage.getItem("chartproperties") || "{}"
  );

  const savedProperties = flatten(chartProperties, {
    restrictTo: ["scalesProperties", "paneProperties", "tradingProperties"],
  });

  const widgetOptions = useMemo<ChartingLibraryWidgetOptions>(
    () => ({
      symbol: defaultProps.symbol,
      datafeed: tradingViewDatafeed,
      interval: defaultProps.interval,
      container: defaultProps.container,
      library_path: defaultProps.libraryPath,
      auto_save_delay: 5,
      locale: "en",
      disabled_features: ["use_localstorage_for_settings"],
      enabled_features: ["study_templates"],
      load_last_chart: true,
      client_id: defaultProps.clientId,
      user_id: defaultProps.userId,
      fullscreen: defaultProps.fullscreen,
      autosize: defaultProps.autosize,
      studies_overrides: defaultProps.studiesOverrides,
      theme: defaultProps.theme,
      overrides: {
        ...savedProperties,
        ...overrideProperties,
      },
      // @ts-ignore
      save_load_adapter: saveLoadAdapter,
      settings_adapter: {
        initialSettings: {
          "trading.orderPanelSettingsBroker": JSON.stringify(
            tradingOrderPanelSettingsBroker
          ),
          "trading.chart.property":
            localStorage.getItem("trading.chart.property") ||
            JSON.stringify({
              hideFloatingPanel: 1,
            }),
          "chart.favoriteDrawings":
            localStorage.getItem("chart.favoriteDrawings") ||
            JSON.stringify([]),
          "chart.favoriteDrawingsPosition":
            localStorage.getItem("chart.favoriteDrawingsPosition") ||
            JSON.stringify({}),
        },
        setValue: (key: string, value: string) => {
          localStorage.setItem(key, value);
        },
        removeValue: (key: string) => {
          localStorage.removeItem(key);
        },
      },
    }),
    [
      defaultProps.autosize,
      defaultProps.clientId,
      defaultProps.container,
      defaultProps.fullscreen,
      defaultProps.interval,
      defaultProps.libraryPath,
      defaultProps.studiesOverrides,
      defaultProps.symbol,
      defaultProps.theme,
      defaultProps.userId,
      savedProperties,
    ]
  );

  const onChangeInterval = (interval: string) => {
    localStorage.setItem("interval_filter", interval);
    setCurrentInterval(interval);
  };

  React.useEffect(() => {
    const tvWidget = new widget(widgetOptions);

    tvWidget.onChartReady(() => {
      tvWidgetRef.current = tvWidget;
      tvWidget
        // @ts-ignore
        .subscribe("onAutoSaveNeeded", () => tvWidget.saveChartToServer());
      tvWidget
        .chart()
        .onIntervalChanged()
        .subscribe(null, (interval) => {
          onChangeInterval(interval);
        });

      tvWidget.headerReady().then(() => {
        [
          IntervalEnum.ONE_DAY,
          IntervalEnum.THREE_DAYS,
          IntervalEnum.ONE_WEEK,
          IntervalEnum.ONE_MONTH,
        ].map((item) => {
          const btn = tvWidget.createButton();
          btn.innerText = item;
          btn.style.cursor = "pointer";
          if (currentInterval === item) {
            btn.style.color = "yellow";
          }
          btn.addEventListener("click", () => {
            onChangeInterval(item);
          });
          return btn;
        });
        // const btn = tvWidget.createButton();
        // btn.innerHTML = `<div style="${triangleStyle}">
        //   <div style="${selectIntervalContainerStyle}"></div>
        // </div>`;
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tvWidgetRef.current]);

  return (
    <div id={defaultProps.container as string} className={"TVChartContainer"} />
  );
};

export default TradingView;
