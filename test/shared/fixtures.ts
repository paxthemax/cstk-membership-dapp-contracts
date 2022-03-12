import { BigNumberish } from 'ethers';
import { waffle } from 'hardhat';
import { Fixture } from 'ethereum-waffle';

import { AdminRoleMock, IRegistry, AdminRoleMock__factory, Registry__factory } from '../../typechain-types';

import { ActorFixture } from './actors';
import { provider } from './provider';

const { abi: RegistryABI, bytecode: RegistryBytecode } = Registry__factory;
const { abi: AdminRoleMockABI, bytecode: AdminRoleMockBytecode } = AdminRoleMock__factory;

export type AdminRoleMockFixture = {
  adminRole: AdminRoleMock;
  admins: string[];
};

export const adminRoleMockFixture: Fixture<AdminRoleMockFixture> = async ([wallet]) => {
  const actors = new ActorFixture(provider.getWallets(), provider);
  const admins = [actors.adminFirst().address, actors.adminSecond().address];
  const adminRole = (await waffle.deployContract(
    wallet,
    {
      bytecode: AdminRoleMockBytecode,
      abi: AdminRoleMockABI,
    },
    [admins]
  )) as AdminRoleMock;

  return {
    adminRole,
    admins,
  };
};

export type RegistryFixture = {
  registry: IRegistry;
  admins: string[];
  contributors: {
    address: string;
    maxTrust: BigNumberish;
  }[];
};

export const registryFixture: Fixture<RegistryFixture> = async ([wallet]) => {
  const actors = new ActorFixture(provider.getWallets(), provider);
  const admins = [actors.adminFirst().address, actors.adminSecond().address];
  const registry = (await waffle.deployContract(
    wallet,
    {
      bytecode: RegistryBytecode,
      abi: RegistryABI,
    },
    [admins]
  )) as IRegistry;

  const contributors = [
    { address: actors.contributorFirst().address, maxTrust: 1000 },
    { address: actors.contrbutorSecond().address, maxTrust: 2000 },
  ];

  await registry
    .connect(actors.adminFirst())
    .registerContributors(
      2,
      [contributors[0].address, contributors[1].address],
      [contributors[0].maxTrust, contributors[1].maxTrust]
    );

  return {
    registry,
    admins,
    contributors,
  };
};
