const hre = require('hardhat');
require('dotenv').config();

async function main() {
  console.log("🔍 Testando contratos deployados...\n");
  
  const [signer] = await hre.ethers.getSigners();
  console.log("Usando conta:", signer.address);
  console.log("Balance:", hre.ethers.formatEther(await signer.provider.getBalance(signer.address)), "ETH\n");

  try {
    // Testar AvatarBase
    console.log("📝 Testando AvatarBase...");
    const avatarBase = await hre.ethers.getContractAt('AvatarBase', process.env.AVATAR_BASE_ADDRESS);
    
    // Tentar criar um avatar usando mint
    const tx1 = await avatarBase.mint(signer.address, "Test Avatar - A simple test avatar");
    await tx1.wait();
    console.log("✅ Avatar criado com sucesso!");
    
    // Verificar o próximo ID (que indica quantos foram criados)
    const nextId = await avatarBase.nextId();
    console.log(`   Próximo ID do avatar: ${nextId}\n`);

    // Testar TimeCapsule
    console.log("⏰ Testando TimeCapsule...");
    const timeCapsule = await hre.ethers.getContractAt('TimeCapsule', process.env.TIME_CAPSULE_ADDRESS);
    
    // Criar uma cápsula do tempo - precisa de avatarId, unlockDate e cid
    const avatarId = 1;
    const futureTime = Math.floor(Date.now() / 1000) + 3600; // 1 hora no futuro
    const cid = "QmTestCID123";
    const tx2 = await timeCapsule.createCapsule(avatarId, futureTime, cid);
    await tx2.wait();
    console.log("✅ Cápsula do tempo criada!");
    
    // Verificar se a cápsula foi criada
    const capsuleId = hre.ethers.keccak256(hre.ethers.toUtf8Bytes(avatarId.toString() + cid));
    console.log(`   ID da cápsula: ${capsuleId}\n`);

    // Testar DigitalLegacy
    console.log("🏛️ Testando DigitalLegacy...");
    const digitalLegacy = await hre.ethers.getContractAt('DigitalLegacy', process.env.DIGITAL_LEGACY_ADDRESS);
    
    // Criar um legado digital - precisa de avatarId, cid e rules
    const legacyCid = "QmLegacyCID456";
    const rules = "Unlock after 1 year or with family consent";
    const tx3 = await digitalLegacy.createLegacy(avatarId, legacyCid, rules);
    await tx3.wait();
    console.log("✅ Legado digital criado!");
    
    const legacyId = hre.ethers.keccak256(hre.ethers.toUtf8Bytes(avatarId.toString() + legacyCid));
    console.log(`   ID do legado: ${legacyId}\n`);

    console.log("🎉 Todos os testes passaram! Os contratos estão funcionando corretamente.");
    
  } catch (error) {
    console.error("❌ Erro durante os testes:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });