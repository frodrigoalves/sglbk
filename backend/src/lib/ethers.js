import { JsonRpcProvider, Wallet, Contract } from 'ethers';
import { cfg } from '../config.js';
import avatarBaseAbi from '../abi/AvatarBase.json' assert { type: 'json' };
import walletLinkAbi from '../abi/AvatarWalletLink.json' assert { type: 'json' };
import timeCapsuleAbi from '../abi/TimeCapsule.json' assert { type: 'json' };
import legacyAbi from '../abi/DigitalLegacy.json' assert { type: 'json' };
export const provider = new JsonRpcProvider(cfg.rpcUrl, cfg.chainId);
export const signer = new Wallet(cfg.pk, provider);
export const contracts = {
  avatarBase: () => new Contract(cfg.contracts.avatarBase, avatarBaseAbi, signer),
  walletLink: () => new Contract(cfg.contracts.walletLink, walletLinkAbi, signer),
  timeCapsule: () => new Contract(cfg.contracts.timeCapsule, timeCapsuleAbi, signer),
  legacy: () => new Contract(cfg.contracts.legacy, legacyAbi, signer),
};
