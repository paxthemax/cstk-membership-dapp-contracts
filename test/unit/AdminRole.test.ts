import { expect } from 'chai';
import { constants, Wallet } from 'ethers';
import { ActorFixture, AdminRoleMockFixture, adminRoleMockFixture, createFixtureLoader, provider } from '../shared';
import { LoadFixtureFunction } from '../types';

const { AddressZero } = constants;

let loadFixture: LoadFixtureFunction;

describe('unit/AdminRole', () => {
  const actors = new ActorFixture(provider.getWallets(), provider);
  let context: AdminRoleMockFixture;

  before('loader', async () => {
    loadFixture = createFixtureLoader(provider.getWallets(), provider);
  });

  beforeEach('create fixture loader', async () => {
    context = await loadFixture(adminRoleMockFixture);
  });

  describe('#isAdmin', () => {
    let subject: (_account: Wallet | string) => Promise<any>;

    beforeEach(() => {
      subject = (_account: Wallet | string) =>
        context.adminRole.isAdmin(typeof _account == 'string' ? _account : _account.address);
    });

    describe('works and', () => {
      it('returns true for admin addresses', async () => {
        for (const acc of context.admins) {
          expect(await subject(acc)).to.be.true;
        }
      });

      it('returns false for non-admin addresses', async () => {
        expect(await subject(actors.other())).to.be.false;
      });
    });

    describe('fails when', () => {
      it('recieves a zero address', async () => {
        await expect(subject(AddressZero)).to.be.reverted;
      });
    });
  });

  describe('#addAdmin', () => {
    let subject: (_actor: Wallet, _admin: Wallet | string) => Promise<any>;
    let check: (_admin: Wallet) => Promise<any>;

    beforeEach(() => {
      subject = (_actor: Wallet, _account: Wallet | string) =>
        context.adminRole.connect(_actor).addAdmin(typeof _account === 'string' ? _account : _account.address);
      check = (_account: Wallet) => context.adminRole.isAdmin(_account.address);
    });

    describe('works and', () => {
      it('emits the admin added event', async () => {
        await expect(subject(actors.adminFirst(), actors.adminThird()))
          .to.emit(context.adminRole, 'AdminAdded')
          .withArgs(actors.adminThird().address);
      });

      it('adds the new admin', async () => {
        await subject(actors.adminFirst(), actors.adminThird());
        expect(await check(actors.adminThird())).to.be.true;
      });
    });

    describe('fails when', () => {
      it('called by a non-admin', async () => {
        await expect(subject(actors.other(), actors.adminThird())).to.be.reverted;
      });

      it('passing a zero address as an account', async () => {
        await expect(subject(actors.adminFirst(), AddressZero)).to.be.reverted;
      });

      it('trying to add an exising admin', async () => {
        const existingAdmin = context.admins[1];
        await expect(subject(actors.adminFirst(), existingAdmin)).to.be.reverted;
      });
    });
  });

  describe('#renounceAdmin', () => {
    let subject: (_actor: Wallet) => Promise<any>;
    let check: (_account: Wallet | string) => Promise<any>;

    beforeEach(() => {
      subject = (_actor: Wallet) => context.adminRole.connect(_actor).renounceAdmin();
      check = (_account: Wallet | string) =>
        context.adminRole.isAdmin(typeof _account === 'string' ? _account : _account.address);
    });

    describe('works and', () => {
      it('emits the admin removed event', async () => {
        await expect(subject(actors.adminSecond()))
          .to.emit(context.adminRole, 'AdminRemoved')
          .withArgs(actors.adminSecond().address);
      });

      it('removes the admin', async () => {
        await subject(actors.adminSecond());
        expect(await check(actors.adminSecond())).to.be.false;
      });
    });

    describe('fails when', () => {
      it('called by a non-admin', async () => {
        await expect(subject(actors.other())).to.be.reverted;
      });
    });
  });

  describe('#removeAdmin', () => {
    let subject: (_account: Wallet | string, _sender: Wallet) => Promise<any>;
    let check: (_account: Wallet | string) => Promise<any>;

    beforeEach(() => {
      subject = (_account: Wallet | string, _sender: Wallet) =>
        context.adminRole.connect(_sender).removeAdmin(typeof _account === 'string' ? _account : _account.address);
      check = (_account: Wallet | string) =>
        context.adminRole.isAdmin(typeof _account === 'string' ? _account : _account.address);
    });

    describe('works and', () => {
      it('emits the admin removed event', async () => {
        await expect(subject(actors.adminSecond(), actors.owner()))
          .to.emit(context.adminRole, 'AdminRemoved')
          .withArgs(actors.adminSecond().address);
      });

      it('removes the admin', async () => {
        await subject(actors.adminSecond(), actors.owner());
        expect(await check(actors.adminSecond())).to.be.false;
      });
    });

    describe('fails when', () => {
      it('not called by the owner', async () => {
        await expect(subject(actors.adminSecond(), actors.other())).to.be.reverted;
      });

      it('passing a zero address as an admin', async () => {
        await expect(subject(AddressZero, actors.owner())).to.be.reverted;
      });

      it('passing a non-admin address', async () => {
        await expect(subject(actors.other(), actors.owner())).to.be.reverted;
      });
    });
  });
});
