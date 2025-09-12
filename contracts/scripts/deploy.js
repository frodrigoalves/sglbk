const hre = require('hardhat');
async function main(){
  const AvatarBase = await hre.ethers.getContractFactory('AvatarBase');
  const base = await AvatarBase.deploy(); await base.deployed();
  const WalletLink = await hre.ethers.getContractFactory('AvatarWalletLink');
  const wl = await WalletLink.deploy(); await wl.deployed();
  const TimeCapsule = await hre.ethers.getContractFactory('TimeCapsule');
  const tc = await TimeCapsule.deploy(); await tc.deployed();
  const DigitalLegacy = await hre.ethers.getContractFactory('DigitalLegacy');
  const dl = await DigitalLegacy.deploy(); await dl.deployed();
  console.log('AvatarBase', base.address);
  console.log('AvatarWalletLink', wl.address);
  console.log('TimeCapsule', tc.address);
  console.log('DigitalLegacy', dl.address);
}
main().catch((e)=>{console.error(e);process.exit(1)});
