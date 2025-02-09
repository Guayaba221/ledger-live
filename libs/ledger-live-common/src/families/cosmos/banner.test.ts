/* eslint-disable @typescript-eslint/no-var-requires */

import { getAccountBannerState } from "./banner";
import * as preloadedData from "@ledgerhq/coin-cosmos/preloadedData";
import type { CosmosAccount, CosmosValidatorItem } from "./types";
import data from "@ledgerhq/coin-cosmos/preloadedData.mock";
import { BigNumber } from "bignumber.js";
import { LiveConfig } from "@ledgerhq/live-config/LiveConfig";
import { liveConfig } from "../../config/sharedConfig";
import cryptoFactory from "@ledgerhq/coin-cosmos/chain/chain";

jest.mock("@ledgerhq/coin-cosmos/prepareTransaction", () => ({
  calculateFees: jest.fn(() => Promise.resolve({})),
}));

jest.mock("@ledgerhq/coin-cosmos/chain/chain");

jest.mock("@ledgerhq/coin-cosmos/logic", () => ({
  ...jest.requireActual("@ledgerhq/coin-cosmos/logic"),
  canDelegate: jest.fn(),
  canRedelegate: jest.fn(),
}));

LiveConfig.setConfig(liveConfig);
const LEDGER_VALIDATOR_ADDRESS = LiveConfig.getValueByKey("config_currency_cosmos").ledgerValidator;
const ledgerValidator: CosmosValidatorItem | undefined = data.validators.find(
  x => x.validatorAddress === LEDGER_VALIDATOR_ADDRESS,
);
const expensiveValidator: CosmosValidatorItem | undefined = data.validators.find(
  x => x.validatorAddress === "cosmosvaloper1qs8tnw2t8l6amtzvdemnnsq9dzk0ag0z52uzay",
);
const cheapValidator: CosmosValidatorItem | undefined = data.validators.find(
  x => x.validatorAddress === "cosmosvaloper1qaa9zej9a0ge3ugpx3pxyx602lxh3ztqgfnp42",
);

const account: CosmosAccount = {
  type: "Account",
  id: "js:2:cosmos:cosmos1f9y7wdychcdhwvyrhff3zvs3gy3qxcu2th4g8u:",
  used: false,
  seedIdentifier: "02d4c121ce2bb160ebf39aa0be0050b4d553e18872985ac3a4e21904fd1442defe",
  derivationMode: "",
  index: 1,
  freshAddress: "cosmos1f9y7wdychcdhwvyrhff3zvs3gy3qxcu2th4g8u",
  freshAddressPath: "44'/118'/1'/0/0",
  blockHeight: 5417472,
  creationDate: new Date("2022-08-02T16:09:08.906Z"),
  balance: new BigNumber("200250"),
  spendableBalance: new BigNumber("200250"),
  operations: [],
  operationsCount: 1,
  pendingOperations: [],
  currency: {
    type: "CryptoCurrency",
    id: "cosmos",
    coinType: 118,
    name: "Cosmos",
    managerAppName: "Cosmos",
    ticker: "ATOM",
    scheme: "cosmos",
    color: "#16192f",
    family: "cosmos",
    units: [
      { name: "Atom", code: "ATOM", magnitude: 6 },
      { name: "microAtom", code: "uatom", magnitude: 0 },
    ],
    explorerViews: [
      {
        tx: "https://www.mintscan.io/cosmos/txs/$hash",
        address: "https://www.mintscan.io/cosmos/validators/$address",
      },
    ],
  },
  lastSyncDate: new Date("2022-08-02T16:11:47.343Z"),
  swapHistory: [],
  balanceHistoryCache: {
    HOUR: { balances: [0, 393248, 393248], latestDate: 1661162400000 },
    DAY: { balances: [0, 393248], latestDate: 1661122800000 },
    WEEK: { balances: [0, 393248], latestDate: 1661036400000 },
  },
  xpub: "cosmos1f9y7wdychcdhwvyrhff3zvs3gy3qxcu2th4g8u",
  cosmosResources: {
    delegations: [
      {
        amount: new BigNumber("50000"),
        status: "bonded",
        pendingRewards: new BigNumber("112"),
        validatorAddress: "cosmosvaloper1c4k24jzduc365kywrsvf5ujz4ya6mwympnc4en",
      },
    ],
    redelegations: [],
    unbondings: [],
    delegatedBalance: new BigNumber("0"),
    pendingRewardsBalance: new BigNumber("0"),
    unbondingBalance: new BigNumber("0"),
    withdrawAddress: "",
    sequence: 0,
  },
};

const validators = [expensiveValidator, cheapValidator, ledgerValidator];
const validatorsMap = {
  cosmos: { validators } as {
    validators: CosmosValidatorItem[];
  },
};

describe("cosmos/banner", () => {
  describe("useCosmosFormattedDelegations", () => {
    beforeEach(() => {
      // @ts-expect-error Ledger value come from config
      cryptoFactory.mockReturnValue({
        ledgerValidator: LEDGER_VALIDATOR_ADDRESS,
      });
    });
    afterEach(() => {
      jest.restoreAllMocks();
    });
    it("should not display the banner", async () => {
      jest.spyOn(preloadedData, "getCurrentCosmosPreloadData").mockReturnValue(validatorsMap);
      require("@ledgerhq/coin-cosmos/logic").canDelegate.mockReturnValue(false);
      require("@ledgerhq/coin-cosmos/logic").canRedelegate.mockReturnValue(false);
      const result = getAccountBannerState(account);
      expect(result).toStrictEqual({
        display: false,
        redelegate: false,
        validatorSrcAddress: "",
        ledgerValidator,
      });
    });
    it("should return display delegate mode", async () => {
      jest.spyOn(preloadedData, "getCurrentCosmosPreloadData").mockReturnValue(validatorsMap);
      require("@ledgerhq/coin-cosmos/logic").canDelegate.mockReturnValue(true);
      require("@ledgerhq/coin-cosmos/logic").canRedelegate.mockReturnValue(false);
      const result = getAccountBannerState(account);
      expect(result).toStrictEqual({
        display: true,
        redelegate: false,
        validatorSrcAddress: "",
        ledgerValidator,
      });
    });
    it("should return display redelegate mode", async () => {
      jest.spyOn(preloadedData, "getCurrentCosmosPreloadData").mockReturnValue(validatorsMap);
      require("@ledgerhq/coin-cosmos/logic").canDelegate.mockReturnValue(false);
      require("@ledgerhq/coin-cosmos/logic").canRedelegate.mockReturnValue(true);
      account.cosmosResources.redelegations.push({
        validatorSrcAddress: "xxxx",
        validatorDstAddress: expensiveValidator?.validatorAddress as string,
        amount: new BigNumber(1000),
        completionDate: new Date(),
      });
      const accountWithSpendable5000 = {
        ...account,
        spendableBalance: new BigNumber(5000),
      };
      const result = getAccountBannerState(accountWithSpendable5000);
      expect(result).toStrictEqual({
        display: true,
        redelegate: true,
        validatorSrcAddress: expensiveValidator?.validatorAddress,
        ledgerValidator,
      });
    });
    it("should return not display redelegate mode", async () => {
      jest.spyOn(preloadedData, "getCurrentCosmosPreloadData").mockReturnValue(validatorsMap);
      require("@ledgerhq/coin-cosmos/logic").canDelegate.mockReturnValue(false);
      require("@ledgerhq/coin-cosmos/logic").canRedelegate.mockReturnValue(false);
      account.cosmosResources.redelegations.push({
        validatorSrcAddress: "xxxx",
        validatorDstAddress: expensiveValidator?.validatorAddress as string,
        amount: new BigNumber(1000),
        completionDate: new Date(),
      });
      const result = getAccountBannerState(account);
      expect(result).toStrictEqual({
        display: false,
        redelegate: false,
        validatorSrcAddress: "",
        ledgerValidator,
      });
    });
  });
});
