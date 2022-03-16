import { expect } from 'chai';
import { constants, Wallet } from 'ethers';
import { ActorFixture, MinterFixture, createFixtureLoader, provider, minterFixture } from '../shared';
import { LoadFixtureFunction } from '../types';

const { AddressZero } = constants;

let loadFixture: LoadFixtureFunction;

describe('unit/Minter', () => {
  const actors = new ActorFixture(provider.getWallets(), provider);
  let context: MinterFixture;

  before('loader', async () => {
    loadFixture = createFixtureLoader(provider.getWallets(), provider);
  });

  beforeEach('create fixture loader', async () => {
    context = await loadFixture(minterFixture);
  });

  describe('#changeCollector', () => {
    let subject;

    before(() => {
      subject = (_collector: Wallet | string, _sender: Wallet) =>
        context.minter
          .connect(_sender)
          .changeCollector(typeof _collector === 'string' ? _collector : _collector.address);
    });

    describe('works and', () => {
      it('emits the collector changed event', async () => {
        await expect(subject(actors.anyone(), actors.adminFirst()))
          .to.emit(context.minter, 'CollectorChanged')
          .withArgs(actors.anyone().address, actors.adminFirst().address);
      });

      it('changes the collector', async () => {
        await subject(actors.anyone(), actors.adminFirst());
        expect(await context.minter.collector()).to.be.eq(actors.anyone().address);
      });
    });

    describe('fails when', () => {
      it('not called by an admin address', async () => {
        await expect(subject(actors.anyone(), actors.anyone())).to.be.reverted;
      });

      it('trying to set zero address as collector', async () => {
        await expect(subject(AddressZero, actors.adminFirst())).to.be.reverted;
      });
    });
  });
});
