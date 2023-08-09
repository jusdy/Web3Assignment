import { Get, Queries, Query, Route, Tags } from "tsoa";
import Exchange, { Market } from "ccxt";
import { config } from "dotenv";
import { stableCoins } from "../constants/coin";

config();

const binanceExchange = new Exchange.binance();

interface CoinsResponse {
  success: boolean;
  coins?: string[];
  message?: string;
}

interface PriceData {
  name: string;
  price: number;
}

interface PriceResponse {
  success: boolean;
  coins?: PriceData[];
  message?: string;
}

@Tags("ccxt-binance")
@Route("/ccxt/binance")
export default class CCXTBinanceController {
  @Get("/coins")
  public async getCurrencies(): Promise<CoinsResponse> {
    try {
      const markets = await binanceExchange.loadMarkets();
      const tradableTokens: string[] = Object.values(markets).map(
        (market: Market) => market.base
      );
      const uniqueTokens = [...new Set(tradableTokens)];

      return {
        success: true,
        coins: uniqueTokens,
      };
    } catch (err: any) {
      return {
        success: false,
        message: err?.response?.data ?? err?.reason ?? err?.message,
      };
    }
  }

  @Get("/average-prices")
  public async getAveragePrices(): Promise<PriceResponse> {
    try {
      const markets = await binanceExchange.loadMarkets();

      const eachData: PriceData[] = [];
      for (const key in markets) {
        const market = markets[key];
        const symbol = market.symbol;
        
        let flag = false;
        for(const stableCoin of stableCoins) {
          if(symbol.endsWith(stableCoin)) {
            flag = true;
            break;
          }
        }

        if(!flag) {
          continue;
        }

        const trades = await binanceExchange.fetchTrades(
          symbol,
          undefined,
          100
        );
        const prices = trades.map((trade) => trade.price);
        const averagePrice =
          prices.reduce((sum, price) => sum + price, 0) / prices.length;

        eachData.push({
          name: market.base,
          price: averagePrice,
        });
      }

      const averageTemplate: any[] = [];
      for(const coin of eachData) {
        let flag = false;
        for(const temp of averageTemplate) {
          if(coin.name == temp?.name) {
            temp.price += coin.price;
            temp.count += 1;
            flag = true;
            break;
          }
        }

        if(!flag) {
          averageTemplate.push({
            ...coin,
            count: 1,
          })
        }
      }

      return {
        success: true,
        coins: averageTemplate.map((item) => ({
          name: item.name,
          price: item.price / item.count
        })),
      };
    } catch (err: any) {
      return {
        success: false,
        message: err?.response?.data ?? err?.reason ?? err?.message,
      };
    }
  }
}
