import { MockProvider } from 'ethereum-waffle';
import { Wallet } from 'ethers';

// User indexes:
export const WALLET_USER_INDEXES = {
  OWNER: 0,
  ADMIN_FIRST: 1,
  ADMIN_SECOND: 2,
  ADMIN_THIRD: 3,
  ADMIN_FOURTH: 4,
  CONTRIBUTOR_FIRST: 5,
  CONTRIBUTOR_SECOND: 6,
  USER_FIRST: 7,
  USER_SECOND: 8,
  DRAIN_VAULT_RECEIVER: 0,
  ESCAPE_HATCH_CALLER: 0,
  ESCAPE_HATCH_DESTINATION: 0,
  OTHER: 9,
};

export class ActorFixture {
  wallets: Wallet[];
  provider: MockProvider;

  constructor(wallets: Wallet[], provider: MockProvider) {
    (this.wallets = wallets), (this.provider = provider);
  }

  owner() {
    return this._getActor(WALLET_USER_INDEXES.OWNER);
  }

  deployer() {
    return this.owner();
  }

  adminFirst() {
    return this._getActor(WALLET_USER_INDEXES.ADMIN_FIRST);
  }

  adminSecond() {
    return this._getActor(WALLET_USER_INDEXES.ADMIN_SECOND);
  }

  adminThird() {
    return this._getActor(WALLET_USER_INDEXES.ADMIN_THIRD);
  }

  adminFourth() {
    return this._getActor(WALLET_USER_INDEXES.ADMIN_FOURTH);
  }

  contributorFirst() {
    return this._getActor(WALLET_USER_INDEXES.CONTRIBUTOR_FIRST);
  }

  contrbutorSecond() {
    return this._getActor(WALLET_USER_INDEXES.CONTRIBUTOR_SECOND);
  }

  contributors() {
    return [this.contributorFirst(), this.contrbutorSecond()];
  }

  userFirst() {
    return this._getActor(WALLET_USER_INDEXES.USER_FIRST);
  }

  userSecond() {
    return this._getActor(WALLET_USER_INDEXES.USER_SECOND);
  }

  users() {
    return [this.userFirst(), this.userSecond()];
  }

  drainVaultReceiver() {
    return this._getActor(WALLET_USER_INDEXES.DRAIN_VAULT_RECEIVER);
  }

  escapeHatchCaller() {
    return this._getActor(WALLET_USER_INDEXES.ESCAPE_HATCH_CALLER);
  }

  escapeHatchDestination() {
    return this._getActor(WALLET_USER_INDEXES.ESCAPE_HATCH_DESTINATION);
  }

  other() {
    return this._getActor(WALLET_USER_INDEXES.OTHER);
  }

  anyone() {
    return this.other();
  }

  // Actual logic of fetching the wallet
  private _getActor(index: number): Wallet {
    if (index < 0) {
      throw new Error(`Invalid index: ${index}`);
    }
    const account = this.wallets[index];
    if (!account) {
      throw new Error(`Account ID ${index} could not be loaded`);
    }
    return account;
  }
}
