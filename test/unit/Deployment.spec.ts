import { provider } from '../shared/provider';
import { AdminRoleMock, Registry } from '../../typechain-types';
import { ActorFixture } from '../shared';
import { ethers } from 'hardhat';
import { expect } from 'chai';
import { Contract, ContractFactory, Wallet } from 'ethers';

describe('unit/Deployment', () => {
  const actors = new ActorFixture(provider.getWallets(), provider);

  describe('AdminRole', () => {
    let factory: ContractFactory;
    let deploy: (_params: Wallet[]) => Promise<Contract>;

    before(async () => {
      factory = await ethers.getContractFactory('AdminRoleMock');
      deploy = (_params: Wallet[]) => factory.connect(actors.deployer()).deploy(_params.map((p) => p.address));
    });

    it('deploys and has an address', async () => {
      const admin = (await deploy([])) as AdminRoleMock;
      expect(admin.address).to.be.a.string;
    });

    it('does not revert if deployer is in the list of admins', async () => {
      await expect(deploy([actors.deployer()])).to.not.be.reverted;
    });

    it('sets the initial state', async () => {
      const admin = (await deploy([actors.adminFirst(), actors.adminSecond()])) as AdminRoleMock;

      expect(await admin.owner()).to.be.eq(actors.owner().address);
      expect(await admin.isAdmin(actors.adminFirst().address)).to.be.true;
      expect(await admin.isAdmin(actors.adminSecond().address)).to.be.true;
    });
  });

  describe('Registry', () => {
    let factory: ContractFactory;
    let deploy: (_admins: Wallet[]) => Promise<Contract>;

    before(async () => {
      factory = await ethers.getContractFactory('Registry');
      deploy = (_admins: Wallet[]) => factory.connect(actors.deployer()).deploy(_admins.map((a) => a.address));
    });

    it('deploys and has an address', async () => {
      const registry = (await deploy([])) as Registry;
      expect(registry.address).to.be.a.string;
    });
  });
});
