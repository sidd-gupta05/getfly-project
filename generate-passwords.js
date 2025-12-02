// generate-passwords.js
const bcrypt = require("bcryptjs");

async function generateHashes() {
  console.log("=== GENERATING PASSWORD HASHES ===\n");

  // Password to hash
  const passwords = {
    admin: "admin123",
    manager: "manager123",
    worker: "worker123",
  };

  for (const [role, password] of Object.entries(passwords)) {
    const hash = await bcrypt.hash(password, 10);
    console.log(`${role}: ${password}`);
    console.log(`Hash: ${hash}\n`);
  }

  console.log("=== UPDATE YOUR SQL SCRIPT WITH THESE HASHES ===");
}

generateHashes().catch(console.error);
