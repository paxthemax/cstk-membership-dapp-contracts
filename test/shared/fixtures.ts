import { BigNumber, BigNumberish } from 'ethers';
import { waffle } from 'hardhat';
import { Fixture } from 'ethereum-waffle';

import {
  AdminRoleMock,
  IRegistry,
  AdminRoleMock__factory,
  TestERC20__factory,
  Registry__factory,
  IERC20,
} from '../../typechain-types';

import { ActorFixture } from './actors';
import { provider } from './provider';
import { log } from './logging';

const { abi: RegistryABI, bytecode: RegistryBytecode } = Registry__factory;
const { abi: AdminRoleMockABI, bytecode: AdminRoleMockBytecode } = AdminRoleMock__factory;
const { abi: TestERC20ABI, bytecode: TestERC20Bytecode } = TestERC20__factory;

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

export type TokenFixture = {
  token: IERC20;
  params: {
    amountToMint: BigNumber;
  };
};

export const tokenFixture: Fixture<TokenFixture> = async ([wallet]) => {
  const amountToMint = BigNumber.from(2).pow(255);
  const token = (await waffle.deployContract(
    wallet,
    {
      bytecode: TestERC20Bytecode,
      abi: TestERC20ABI,
    },
    [amountToMint]
  )) as IERC20;

  return {
    token,
    params: {
      amountToMint,
    },
  };
};

export type RegistryFixture = {
  registry: IRegistry;
  params: {
    admins: string[];
    cstkTokenAddress: string;
  };
  state: {
    contributors: {
      address: string;
      maxTrust: BigNumberish;
    }[];
  };
};

export const registryFixture: Fixture<RegistryFixture> = async ([wallet]) => {
  const actors = new ActorFixture(provider.getWallets(), provider);
  const admins = [actors.adminFirst().address, actors.adminSecond().address];

  const { token } = await tokenFixture([wallet], provider);

  const registry = (await waffle.deployContract(
    wallet,
    {
      bytecode: RegistryBytecode,
      abi: RegistryABI,
    },
    [admins, token.address]
  )) as IRegistry;

  const contributors = [
    { address: actors.contributorFirst().address, maxTrust: 1000, pendingBalance: 500 },
    { address: actors.contrbutorSecond().address, maxTrust: 2000, pendingBalance: 1500 },
  ];

  await registry
    .connect(actors.adminFirst())
    .registerContributors(
      2,
      [contributors[0].address, contributors[1].address],
      [contributors[0].maxTrust, contributors[1].maxTrust],
      [contributors[0].pendingBalance, contributors[1].pendingBalance]
    );

  return {
    registry,
    params: {
      admins,
      cstkTokenAddress: token.address,
    },
    state: {
      contributors,
    },
  };
};
