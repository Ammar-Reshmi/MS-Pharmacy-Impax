import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import { generateSecret, generateURI, verify as verifyTotp } from "otplib";
import postgres from "postgres";
import QRCode from "qrcode";
import * as schema from "../src/db/schema";
import { decryptMfaSecret, encryptMfaSecret } from "../src/lib/secrets";

// Load .env variables
const envPath = path.resolve(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const match = trimmed.match(/^([\w.-]+)\s*=\s*(.*)$/);
    if (match) {
      const key = match[1];
      let val = match[2];
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (process.env[key] === undefined) {
        process.env[key] = val;
      }
    }
  }
}

const connectionString = process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/ms_pharma_impex";

function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function main() {
  console.log("\n=======================================================");
  console.log("   MS PHARMA IMPEX — MULTI-FACTOR AUTHENTICATION (MFA) ");
  console.log("=======================================================\n");

  if (!process.env.MFA_ENCRYPTION_KEY) {
    console.error("ERROR: MFA_ENCRYPTION_KEY is missing in your .env file!");
    console.error("Please add a 32-byte base64 key to .env, for example:");
    console.error("MFA_ENCRYPTION_KEY=" + Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString("base64") + "\n");
    process.exit(1);
  }

  const client = postgres(connectionString, { max: 1 });
  const db = drizzle(client, { schema });

  try {
    const args = process.argv.slice(2);
    const disableFlag = args.includes("--disable");
    let targetEmail = args.find((a) => !a.startsWith("--"));

    const allStaff = await db.query.staffUsers.findMany({
      orderBy: (users, { asc }) => [asc(users.role), asc(users.email)]
    });

    if (allStaff.length === 0) {
      console.log("No staff accounts found. Please run 'npm run db:seed' first.\n");
      return;
    }

    if (!targetEmail) {
      console.log("Available staff accounts:");
      allStaff.forEach((s, idx) => {
        const mfaStatus = s.mfaEnabled ? "[MFA: ENABLED]" : "[MFA: DISABLED]";
        console.log(`  ${idx + 1}. ${s.email} (${s.name}) - Role: ${s.role} ${mfaStatus}`);
      });
      console.log("");
      const selection = await prompt("Enter staff email or number to configure MFA: ");
      const num = parseInt(selection, 10);
      if (!isNaN(num) && num >= 1 && num <= allStaff.length) {
        targetEmail = allStaff[num - 1].email;
      } else {
        targetEmail = selection.toLowerCase();
      }
    }

    const staff = allStaff.find((s) => s.email.toLowerCase() === targetEmail?.toLowerCase());
    if (!staff) {
      console.error(`\nError: Staff user '${targetEmail}' was not found in the database.\n`);
      return;
    }

    console.log(`\nSelected staff member: ${staff.name} <${staff.email}>`);
    console.log(`Role: ${staff.role} | Current MFA status: ${staff.mfaEnabled ? "ENABLED" : "DISABLED"}\n`);

    if (disableFlag) {
      await db.update(schema.staffUsers).set({
        mfaEnabled: false,
        mfaSecretEncrypted: null,
        updatedAt: new Date()
      }).where(eq(schema.staffUsers.id, staff.id));
      console.log(`>>> Multi-Factor Authentication has been DISABLED for ${staff.email}.\n`);
      return;
    }

    if (staff.mfaEnabled && !args.includes("--force")) {
      console.log("MFA is ALREADY ENABLED for this account.");
      const action = await prompt("Do you want to (1) Reconfigure / replace QR code, or (2) Disable MFA? [1/2/cancel]: ");
      if (action === "2") {
        await db.update(schema.staffUsers).set({
          mfaEnabled: false,
          mfaSecretEncrypted: null,
          updatedAt: new Date()
        }).where(eq(schema.staffUsers.id, staff.id));
        console.log(`>>> Multi-Factor Authentication has been DISABLED for ${staff.email}.\n`);
        return;
      } else if (action !== "1") {
        console.log("Operation cancelled.\n");
        return;
      }
    }

    // Generate new TOTP secret
    const secret = generateSecret();
    const uri = generateURI({
      secret,
      label: staff.email,
      issuer: "MS Pharma Impex"
    });

    console.log("-------------------------------------------------------");
    console.log("STEP 1: Scan this QR Code with your Authenticator app");
    console.log("       (Google Authenticator, Microsoft Authenticator, etc.)");
    console.log("-------------------------------------------------------\n");

    try {
      const qrTerminal = await QRCode.toString(uri, { type: "terminal", small: true });
      console.log(qrTerminal);
    } catch {
      // If terminal QR rendering fails, continue with manual code
    }

    console.log("Or enter the setup key manually in your authenticator app:");
    console.log(`Key:    ${secret.match(/.{1,4}/g)?.join(" ") ?? secret}`);
    console.log(`Type:   Time-based (TOTP)`);
    console.log(`Issuer: MS Pharma Impex\n`);
    console.log(`Full URI: ${uri}\n`);

    console.log("-------------------------------------------------------");
    console.log("STEP 2: Verify the 6-digit code from your app");
    console.log("-------------------------------------------------------");
    const code = await prompt("Enter the 6-digit code shown on your phone: ");

    if (!code || code.length !== 6 || !/^\d{6}$/.test(code)) {
      console.error("\nInvalid code format. Expected 6 digits. MFA was NOT enabled.\n");
      return;
    }

    const verification = await verifyTotp({ secret, token: code });
    if (!verification.valid) {
      console.error("\nCode verification failed! The code did not match.");
      console.error("Please ensure your phone clock is synchronized and try again. MFA was NOT enabled.\n");
      return;
    }

    // Encrypt secret and store
    const encryptedSecret = encryptMfaSecret(secret);
    await db.update(schema.staffUsers).set({
      mfaEnabled: true,
      mfaSecretEncrypted: encryptedSecret,
      updatedAt: new Date()
    }).where(eq(schema.staffUsers.id, staff.id));

    console.log("\n=======================================================");
    console.log(` SUCCESS! MFA is now ENABLED for ${staff.email}`);
    console.log("=======================================================");
    console.log("\nHow to log in now:");
    console.log("1. Go to http://localhost:3000/admin/login");
    console.log(`2. Enter Work Email: ${staff.email}`);
    console.log("3. Enter your Password");
    console.log("4. Enter the current 6-digit Authenticator Code from your phone");
    console.log("5. Click 'Sign in to portal'\n");

  } catch (err) {
    console.error("Error setting up MFA:", err);
  } finally {
    await client.end();
  }
}

main();
