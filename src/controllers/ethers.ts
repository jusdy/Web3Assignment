import { Get, Post, Query, Route, Tags } from "tsoa";
import { isAddress, formatEther } from "ethers/lib/utils";
import { Wallet, providers } from "ethers";

interface ValidateResponse {
  address: string;
  isValid: boolean;
}

interface WalletResponse {
  address: string;
  privateKey: string;
}

interface TransactionData {
  hash: string;
  from: string;
  to: string;
  value: string;
  formattedValue: number;
  blockNumber: number;
}

interface WalletHistoryResponse {
  success: boolean;
  size?: number;
  transactions?: TransactionData[];
  message?: string;
}

const provider = new providers.EtherscanProvider();

@Tags("ethers")
@Route("ethers")
export default class EthersTestController {
  @Get("/address-validate")

  public validateAddress(@Query() address: string): ValidateResponse {
    return {
      address,
      isValid: isAddress(address),
    };
  }

  @Post("/generate-wallet")
  public generateWallet(): WalletResponse {
    const wallet = Wallet.createRandom();
    return {
      address: wallet.address,
      privateKey: wallet.privateKey,
    };
  }

  @Get("/wallet-history")
  public async getWalletHistory(
    @Query() address: string
  ): Promise<WalletHistoryResponse> {
    if (!isAddress(address)) {
      return {
        success: false,
        message: "Address is invalid",
      };
    }
    try {
      const histories = await provider.getHistory(address);
      return {
        success: true,
        size: histories.length,
        transactions: histories.map((item) => ({
          hash: item.hash,
          from: item.from,
          to: item.to ?? "",
          value: item.value.toString(),
          formattedValue: parseFloat(formatEther(item.value)),
          blockNumber: item.blockNumber ?? 0,
        })),
      };
    } catch (err: any) {
      console.log(err);
      return {
        success: false,
        message: err?.response?.data ?? err?.message,
      };
    }
  }
}
