import { expect } from "detox";
import {
  getElementById,
  getIdOfElement,
  openDeeplink,
  scrollToId,
  tapById,
  waitForElementById,
} from "../../helpers";
import { getEnv } from "@ledgerhq/live-env";
import { Currency } from "@ledgerhq/live-common/e2e/enum/Currency";

const baseLink = "add-account";
const isMock = getEnv("MOCK");

export default class AddAccountDrawer {
  deselectAllButtonId = "add-accounts-deselect-all";
  accountCardRegExp = (id = ".*") => new RegExp(`account-card-${id}`);
  accountCard = (id: string) => getElementById(this.accountCardRegExp(id));
  accountId = (currency: string, index: number) =>
    isMock ? `mock:1:${currency}:MOCK_${currency}_${index}:` : `js:2:${currency}:.*`;
  accountTitleId = (accountName: string, index: number) =>
    getElementById(`test-id-account-${accountName}`, index);
  modalButtonId = "add-accounts-modal-add-button";
  currencyRow = (currencyId: string) => `currency-row-${currencyId}`;
  continueButtonId = "add-accounts-continue-button";
  succesCtaId = "add-accounts-success-cta";

  async openViaDeeplink() {
    await openDeeplink(baseLink);
  }

  async importWithYourLedger() {
    await waitForElementById(this.modalButtonId);
    await tapById(this.modalButtonId);
  }

  async selectCurrency(currencyId: string) {
    const id = this.currencyRow(currencyId);
    await scrollToId(id);
    await tapById(id);
  }

  async startAccountsDiscovery() {
    await waitForElementById(this.continueButtonId, 120000);
  }

  async expectAccountDiscovery(currencyName: string, currencyId: string, index = 0) {
    const accountName = `${currencyName} ${index + 1}`;
    await expect(this.accountCard(this.accountId(currencyId, index))).toBeVisible();
    await expect(this.accountTitleId(accountName, index)).toHaveText(accountName);
  }

  async finishAccountsDiscovery() {
    await waitForElementById(this.continueButtonId);
    await tapById(this.continueButtonId);
  }

  async tapSuccessCta() {
    await waitForElementById(this.succesCtaId);
    await tapById(this.succesCtaId);
  }

  async addFirstAccount(currency: Currency) {
    await this.startAccountsDiscovery();
    await this.expectAccountDiscovery(currency.name, currency.currencyId);
    await tapById(this.deselectAllButtonId);
    await tapById(this.accountCardRegExp(), 0);
    const accountId = (await getIdOfElement(this.accountCardRegExp(), 0)).replace(
      /^account-card-/,
      "",
    );
    await this.finishAccountsDiscovery();
    await this.tapSuccessCta();
    return accountId;
  }

  async addAccount(currency: Currency) {
    await this.startAccountsDiscovery();
    const accountName = await this.expectAccountDiscovery(currency.name, currency.currencyId);
    await this.finishAccountsDiscovery();
    await this.tapSuccessCta();
    return accountName;
  }
}
