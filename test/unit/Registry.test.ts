import { expect } from 'chai';
import { constants, BigNumberish, Wallet } from 'ethers';
import { ActorFixture, BurnAddress, createFixtureLoader, provider, registryFixture, RegistryFixture } from '../shared';
import { LoadFixtureFunction } from '../types';

const { AddressZero } = constants;

let loadFixture: LoadFixtureFunction;

describe('unit/Registry', () => {
  const actors = new ActorFixture(provider.getWallets(), provider);
  let context: RegistryFixture;

  before('loader', async () => {
    loadFixture = createFixtureLoader(provider.getWallets(), provider);
  });

  beforeEach('create fixture loader', async () => {
    context = await loadFixture(registryFixture);
  });

  describe('#registerContributor', () => {
    let subject: (
      _address: Wallet | string,
      _maxTrust: BigNumberish,
      _pendingBalance: BigNumberish,
      _sender: Wallet
    ) => Promise<any>;
    let check: (_address: Wallet | string) => Promise<any>;

    beforeEach(() => {
      subject = (_address: Wallet | string, _maxTrust: BigNumberish, _pendingBalance: BigNumberish, _sender: Wallet) =>
        context.registry
          .connect(_sender)
          .registerContributor(typeof _address === 'string' ? _address : _address.address, _maxTrust, _pendingBalance);
      check = (_addr: Wallet | string) =>
        context.registry.getMaxTrust(typeof _addr === 'string' ? _addr : _addr.address);
    });

    describe('works and', () => {
      it('emits the contributor added event', async () => {
        await expect(subject(actors.anyone(), 1000, 1000, actors.adminFirst()))
          .to.emit(context.registry, 'ContributorAdded')
          .withArgs(actors.anyone().address);
      });

      it('sets the max trust of the contributor', async () => {
        await subject(actors.anyone(), 1000, 1000, actors.adminFirst());
        expect(await check(actors.anyone())).to.be.eq(1000);
      });
    });

    describe('fails when', async () => {
      it('not called by an admin', async () => {
        await expect(subject(actors.anyone(), 1000, 1000, actors.anyone())).to.be.reverted;
      });

      it('trying to register address zero', async () => {
        await expect(subject(AddressZero, 1000, 1000, actors.adminFirst())).to.be.reverted;
      });

      it('trying to set max trust to zero', async () => {
        await expect(subject(actors.anyone(), 0, 1000, actors.adminFirst())).to.be.reverted;
      });

      it('trying to register an existing contributor', async () => {
        const existing = context.state.contributors[0].address;
        await expect(subject(existing, 1000, 1000, actors.adminFirst())).to.be.reverted;
      });
    });
  });

  describe('#removeContributor', () => {
    let subject: (_addr: Wallet | string, _sender: Wallet) => Promise<any>;
    let check: (_addr: Wallet | string) => Promise<any>;

    beforeEach(() => {
      subject = (_addr: Wallet | string, _sender: Wallet) =>
        context.registry.connect(_sender).removeContributor(typeof _addr === 'string' ? _addr : _addr.address);
      check = (_addr: Wallet | string) =>
        context.registry.getMaxTrust(typeof _addr === 'string' ? _addr : _addr.address);
    });

    describe('works and', () => {
      it('emits the contributor removed event', async () => {
        await expect(subject(actors.contributorFirst(), actors.adminFirst()))
          .to.emit(context.registry, 'ContributorRemoved')
          .withArgs(actors.contributorFirst().address);
      });

      it('sets the maxTrust to zero', async () => {
        await expect(subject(actors.contributorFirst(), actors.adminFirst()));
        expect(await check(actors.contributorFirst())).to.be.eq(1000);
      });
    });

    describe('fails when', () => {
      it('not called by an admin', async () => {
        await expect(subject(actors.anyone(), actors.other())).to.be.reverted;
      });

      it('trying to remove address zero', async () => {
        await expect(subject(AddressZero, actors.adminFirst())).to.be.reverted;
      });

      it('trying to remove a non-contributor', async () => {
        await expect(subject(actors.anyone(), actors.adminFirst())).to.be.reverted;
      });
    });
  });

  describe('#registerContributors', () => {
    let subject: (
      _cnt: BigNumberish,
      _addrs: string[],
      _trusts: BigNumberish[],
      _pendingBalances: BigNumberish[],
      _sender: Wallet
    ) => Promise<any>;
    let check: (_account: string) => Promise<any>;

    let contributors: string[];
    let maxTrusts: BigNumberish[];
    let pendingBalances: BigNumberish[];

    before(() => {
      subject = (
        _cnt: BigNumberish,
        _addrs: string[],
        _trusts: BigNumberish[],
        _pendingBalances: BigNumberish[],
        _sender: Wallet
      ) => context.registry.connect(_sender).registerContributors(_cnt, _addrs, _trusts, _pendingBalances);

      check = (_account: string) => context.registry.getMaxTrust(_account);

      contributors = actors.others(2).map((c) => c.address);
      maxTrusts = ['1000', '2000'];
      pendingBalances = ['1000', '2000'];
    });

    describe('works and', () => {
      it('registers contributors', async () => {
        await subject('2', contributors, maxTrusts, pendingBalances, actors.adminFirst());
        expect(await check(contributors[0])).to.be.eq('1000');
        expect(await check(contributors[1])).to.be.eq('2000');
      });
    });

    describe('fails when', () => {
      it('not called by an admin address', async () => {
        await expect(subject(2, contributors, maxTrusts, pendingBalances, actors.anyone())).to.be.reverted;
      });
      it('the number of addresses is mismatched', async () => {
        await expect(subject(2, [], maxTrusts, pendingBalances, actors.adminFirst())).to.be.reverted;
      });

      it('the number of trust values is mismatched', async () => {
        await expect(subject(2, contributors, [], [], actors.adminFirst())).to.be.reverted;
      });
    });
  });

  describe('#getContributors', () => {
    let subject: () => Promise<string[]>;

    beforeEach(() => {
      subject = () => context.registry.getContributors();
    });

    describe('works and', () => {
      it('returns all contributors', async () => {
        expect(await subject()).to.have.same.members(context.state.everyone.map((c) => c.address));
      });
    });
  });

  describe('#getContributorInfo', () => {
    let subject: () => Promise<any>;

    beforeEach(() => {
      subject = () => context.registry.getContributorInfo();
    });

    describe('works and', () => {
      it('returns info for all contributors', async () => {
        const res = await subject();
        expect(res.contributors).to.have.same.members(context.state.everyone.map((c) => c.address));
        expect(res.trusts.map((t) => t.toString())).to.have.ordered.members(
          context.state.everyone.map((c) => c.maxTrust)
        );
      });
    });
  });

  describe('#getMaxTrust', () => {
    let subject: (_address: Wallet | string) => Promise<any>;

    beforeEach(() => {
      subject = (_address: Wallet | string) =>
        context.registry.getMaxTrust(typeof _address === 'string' ? _address : _address.address);
    });

    describe('works and', () => {
      it('returns max trust for a registered contributor', async () => {
        for (const c of context.state.contributors) {
          expect(await subject(c.address)).to.be.eq(c.maxTrust);
        }
      });
    });
  });

  describe('#getPendingBalance', () => {
    let subject: (_adr: Wallet | string) => Promise<any>;

    beforeEach(() => {
      subject = (_adr: Wallet | string) =>
        context.registry.getPendingBalance(typeof _adr === 'string' ? _adr : _adr.address);
    });

    describe('works and', () => {
      it('returns pending balance for a registered contributor', async () => {
        for (const c of context.state.contributors) {
          expect(await subject(c.address)).to.be.eq(c.pendingBalance);
        }
      });
    });
  });

  describe('#setMinterContract', () => {
    let subject: (_minterContract: string, _sender: Wallet) => Promise<any>;

    beforeEach(() => {
      subject = (_minterContract: string, _sender: Wallet) =>
        context.registry.connect(_sender).setMinterContract(_minterContract);
    });

    describe('works and', () => {
      it('emits the minter contract set event', async () => {
        await expect(subject(AddressZero, actors.adminFirst()))
          .to.emit(context.registry, 'MinterContractSet')
          .withArgs(AddressZero);
      });

      it('sets the minter contract address', async () => {
        const testAddress = BurnAddress;
        await subject(testAddress, actors.adminFirst());
        expect(await context.registry.minterContract()).to.be.eq(testAddress);
      });
    });

    describe('fails when', () => {
      it('not called by an admin address', async () => {
        await expect(subject(AddressZero, actors.anyone())).to.be.reverted;
      });
    });
  });
});
