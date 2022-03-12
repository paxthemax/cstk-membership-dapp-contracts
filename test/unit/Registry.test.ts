import { expect } from 'chai';
import { constants, BigNumberish, Wallet, BigNumber } from 'ethers';
import { Context__factory } from '../../typechain-types';
import { ActorFixture, createFixtureLoader, log, provider, registryFixture, RegistryFixture } from '../shared';
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
    let subject: (_address: Wallet | string, _maxTrust: BigNumberish, _sender: Wallet) => Promise<any>;
    let check: (_address: Wallet | string) => Promise<any>;

    beforeEach(() => {
      subject = (_address: Wallet | string, _maxTrust: BigNumberish, _sender: Wallet) =>
        context.registry
          .connect(_sender)
          .registerContributor(typeof _address === 'string' ? _address : _address.address, _maxTrust);
      check = (_addr: Wallet | string) =>
        context.registry.getMaxTrust(typeof _addr === 'string' ? _addr : _addr.address);
    });

    describe('works and', () => {
      it('emits the contributor added event', async () => {
        await expect(subject(actors.anyone(), 1000, actors.adminFirst()))
          .to.emit(context.registry, 'ContributorAdded')
          .withArgs(actors.anyone().address);
      });

      it('sets the max trust of the contributor', async () => {
        await subject(actors.anyone(), 1000, actors.adminFirst());
        expect(await check(actors.anyone())).to.be.eq(1000);
      });
    });

    describe('fails when', async () => {
      it('not called by an admin', async () => {
        await expect(subject(actors.anyone(), 1000, actors.anyone())).to.be.reverted;
      });

      it('trying to register address zero', async () => {
        await expect(subject(AddressZero, 1000, actors.adminFirst())).to.be.reverted;
      });

      it('trying to set max trust to zero', async () => {
        await expect(subject(actors.anyone(), 0, actors.adminFirst())).to.be.reverted;
      });

      it('trying to register an existing contributor', async () => {
        const existing = context.contributors[0].address;
        await expect(subject(existing, 1000, actors.adminFirst())).to.be.reverted;
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
    let subject: (_cnt: BigNumberish, _addrs: Wallet[], _trusts: BigNumberish[], _sender: Wallet) => Promise<any>;
    let check: (_addr: Wallet) => Promise<BigNumber>;

    beforeEach(() => {
      subject = (_cnt: BigNumberish, _addrs: Wallet[], _trusts: BigNumberish[], _sender: Wallet) =>
        context.registry.connect(_sender).registerContributors(
          _cnt,
          _addrs.map((a) => a.address),
          _trusts
        );
      check = (_addr: Wallet) => context.registry.getMaxTrust(_addr.address);
    });

    describe('works and', () => {
      it('registers contributors', async () => {
        await subject(2, actors.users(), [1000, 2000], actors.adminFirst());
        expect(await check(actors.userFirst())).to.be.eq(1000);
        expect(await check(actors.userSecond())).to.be.eq(2000);
      });
    });

    describe('fails when', () => {
      it('not called by an admin address', async () => {
        await expect(subject(2, actors.users(), [1000, 2000], actors.anyone())).to.be.reverted;
      });
      it('the number of addresses is mismatched', async () => {
        await expect(subject(2, [], [1000, 2000], actors.adminFirst())).to.be.reverted;
      });

      it('the number of trust values is mismatched', async () => {
        await expect(subject(2, actors.users(), [], actors.adminFirst())).to.be.reverted;
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
        expect(await subject()).to.have.same.members(context.contributors.map((c) => c.address));
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
        expect(res.contributors).to.have.same.members(context.contributors.map((c) => c.address));
        expect(res.trusts.map((t) => t.toNumber())).to.have.ordered.members(
          context.contributors.map((c) => c.maxTrust)
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
        for (const c of context.contributors) {
          expect(await subject(c.address)).to.be.eq(c.maxTrust);
        }
      });
    });
  });
});