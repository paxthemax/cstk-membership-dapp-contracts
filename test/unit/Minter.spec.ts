import { expect } from 'chai';
import { BigNumberish, constants, utils, Wallet } from 'ethers';
import { ActorFixture, MinterFixture, createFixtureLoader, provider, minterFixture } from '../shared';
import { LoadFixtureFunction } from '../types';

const { AddressZero } = constants;
const { parseEther } = utils;

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

  describe('#receive', () => {
    describe('fails when', () => {
      it('receiving ether', async () => {
        await expect(actors.anyone().sendTransaction({ to: context.minter.address, value: parseEther('1.0') })).to.be
          .reverted;
      });
    });
  });

  describe('#pay', () => {
    let subject: (_beneficiary: Wallet | string, _sender: Wallet, _value: BigNumberish) => Promise<any>;

    before(() => {
      subject = (_beneficiary: Wallet | string, _sender: Wallet, _value: BigNumberish) =>
        context.minter
          .connect(_sender)
          .pay(typeof _beneficiary === 'string' ? _beneficiary : _beneficiary.address, { value: _value });
    });

    describe('works and', () => {
      it('transfers ETH to the collector', async () => {
        const val = parseEther('1.0');
        await subject(actors.contributorFirst(), actors.anyone(), val);
        expect(await provider.getBalance(context.state.collector)).to.be.eq(val);
      });
    });
  });

  // describe('#mint', () => {
  //   let subject: (_recipient: Wallet | string, _toMint: BigNumberish, _sender: Wallet) => Promise<any>;

  //   before(() => {
  //     subject = (_recipient: Wallet | string, _toMint: BigNumberish, _sender: Wallet) =>
  //       context.minter.connect(_sender).mint(typeof _recipient === 'string' ? _recipient : _recipient.address, _toMint);
  //   });

  //   describe('works and', () => {
  //     it('sets pending balance on the new contributor', async () => {});
  //   });
  // });

  describe('#setRatio', async () => {
    let subject: (_numerator: BigNumberish, _denominator: BigNumberish, _sender: Wallet) => Promise<any>;

    before(() => {
      subject = (_numerator: BigNumberish, _denominator: BigNumberish | string, _sender: Wallet) =>
        context.minter.connect(_sender).setRatio(_numerator, _denominator);
    });

    describe('works and', () => {
      it('emits the ratio changed event', async () => {
        await expect(subject(1, 10, actors.adminFirst())).to.emit(context.minter, 'RatioChanged').withArgs(1, 10);
      });

      it('changes the ratio', async () => {
        await subject(1, 10, actors.adminFirst());
        expect(await context.minter.numerator()).to.be.eq(1);
        expect(await context.minter.denominator()).to.be.eq(10);
      });
    });

    describe('fails when', () => {
      it('not called by an admin address', async () => {
        await expect(subject(1, 10, actors.anyone())).to.be.reverted;
      });
    });
  });

  describe('#changeCollector', () => {
    let subject: (_collector: Wallet | string, _sender: Wallet) => Promise<any>;

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
