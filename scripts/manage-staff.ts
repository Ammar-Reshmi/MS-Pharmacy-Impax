import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";
import { hash } from "@node-rs/argon2";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../src/db/schema";

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
  console.log("     MS PHARMA IMPEX — STAFF CREDENTIALS MANAGER       ");
  console.log("=======================================================\n");

  const client = postgres(connectionString, { max: 1 });
  const db = drizzle(client, { schema });

  try {
    const args = process.argv.slice(2);

    // Command-line flag shortcuts:
    // --list
    if (args.includes("--list")) {
      const staffList = await db.query.staffUsers.findMany({
        orderBy: (users, { asc }) => [asc(users.role), asc(users.email)]
      });
      console.log("Current Staff Users in Database:");
      staffList.forEach((s, idx) => {
        console.log(` ${idx + 1}. [${s.role.toUpperCase()}] ${s.email} | Name: ${s.name} | Active: ${s.active ? "Yes" : "No"} | MFA: ${s.mfaEnabled ? "Enabled" : "Disabled"}`);
      });
      console.log("");
      return;
    }

    // --set-password <email> <password>
    if (args.includes("--set-password")) {
      const idx = args.indexOf("--set-password");
      const email = args[idx + 1];
      const newPassword = args[idx + 2];
      if (!email || !newPassword) {
        console.error("Usage: npm run staff:manage -- --set-password <email> <newPassword>\n");
        return;
      }
      const staff = await db.query.staffUsers.findFirst({
        where: eq(schema.staffUsers.email, email.toLowerCase())
      });
      if (!staff) {
        console.error(`User with email '${email}' not found.\n`);
        return;
      }
      const passwordHash = await hash(newPassword);
      await db.update(schema.staffUsers).set({
        passwordHash,
        updatedAt: new Date()
      }).where(eq(schema.staffUsers.id, staff.id));
      console.log(`Successfully updated password for ${email}!\n`);
      return;
    }

    // Interactive Menu
    while (true) {
      const staffList = await db.query.staffUsers.findMany({
        orderBy: (users, { asc }) => [asc(users.role), asc(users.email)]
      });

      console.log("Current Staff Accounts:");
      staffList.forEach((s, idx) => {
        console.log(`  ${idx + 1}. [${s.role.toUpperCase()}] ${s.email} (${s.name}) — Active: ${s.active ? "Yes" : "No"} | MFA: ${s.mfaEnabled ? "ON" : "OFF"}`);
      });

      console.log("\nWhat would you like to do?");
      console.log("  1. Change password for Super Admin");
      console.log("  2. Change password for Sales Staff");
      console.log("  3. Create a new staff account (custom email, password, role)");
      console.log("  4. Toggle active status for an account");
      console.log("  5. Exit\n");

      const choice = await prompt("Select an option (1-5): ");

      if (choice === "1") {
        const superAdmins = staffList.filter((s) => s.role === "super_admin");
        let targetEmail = superAdmins[0]?.email;
        if (superAdmins.length > 1) {
          targetEmail = await prompt(`Which Super Admin email (${superAdmins.map((s) => s.email).join(", ")}): `);
        } else if (!targetEmail) {
          targetEmail = await prompt("Enter Super Admin email: ");
        }

        const newPass = await prompt(`Enter new password for ${targetEmail}: `);
        if (!newPass || newPass.length < 6) {
          console.log("Password must be at least 6 characters long.\n");
          continue;
        }

        const staff = await db.query.staffUsers.findFirst({
          where: eq(schema.staffUsers.email, targetEmail.toLowerCase())
        });
        if (!staff) {
          console.log(`Staff ${targetEmail} not found.\n`);
          continue;
        }

        const passwordHash = await hash(newPass);
        await db.update(schema.staffUsers).set({
          passwordHash,
          updatedAt: new Date()
        }).where(eq(schema.staffUsers.id, staff.id));

        console.log(`\n>>> Password successfully updated for Super Admin: ${targetEmail}!\n`);
      } else if (choice === "2") {
        const salesStaff = staffList.filter((s) => s.role === "sales");
        let targetEmail = salesStaff[0]?.email;
        if (salesStaff.length > 1) {
          targetEmail = await prompt(`Which Sales email (${salesStaff.map((s) => s.email).join(", ")}): `);
        } else if (!targetEmail) {
          targetEmail = await prompt("Enter Sales staff email: ");
        }

        const newPass = await prompt(`Enter new password for ${targetEmail}: `);
        if (!newPass || newPass.length < 6) {
          console.log("Password must be at least 6 characters long.\n");
          continue;
        }

        const staff = await db.query.staffUsers.findFirst({
          where: eq(schema.staffUsers.email, targetEmail.toLowerCase())
        });
        if (!staff) {
          console.log(`Staff ${targetEmail} not found.\n`);
          continue;
        }

        const passwordHash = await hash(newPass);
        await db.update(schema.staffUsers).set({
          passwordHash,
          updatedAt: new Date()
        }).where(eq(schema.staffUsers.id, staff.id));

        console.log(`\n>>> Password successfully updated for Sales: ${targetEmail}!\n`);
      } else if (choice === "3") {
        const email = await prompt("Enter work email for new user: ");
        if (!email || !email.includes("@")) {
          console.log("Invalid email address.\n");
          continue;
        }

        const existing = await db.query.staffUsers.findFirst({
          where: eq(schema.staffUsers.email, email.toLowerCase())
        });
        if (existing) {
          console.log(`A user with email ${email} already exists!\n`);
          continue;
        }

        const name = await prompt("Enter full name: ");
        const password = await prompt("Enter initial password (min 6 characters): ");
        if (!password || password.length < 6) {
          console.log("Password must be at least 6 characters long.\n");
          continue;
        }

        console.log("Select role: 1. super_admin | 2. sales | 3. catalogue_manager");
        const roleChoice = await prompt("Role [1/2/3, default: 2]: ");
        const role = roleChoice === "1" ? "super_admin" : roleChoice === "3" ? "catalogue_manager" : "sales";

        const passwordHash = await hash(password);
        await db.insert(schema.staffUsers).values({
          email: email.toLowerCase(),
          name: name || "Staff User",
          passwordHash,
          role,
          active: true,
          emailVerifiedAt: new Date(),
          mfaEnabled: false
        });

        console.log(`\n>>> Successfully created new ${role} user: ${email}!\n`);
      } else if (choice === "4") {
        const email = await prompt("Enter email of user to toggle active/inactive: ");
        const staff = await db.query.staffUsers.findFirst({
          where: eq(schema.staffUsers.email, email.toLowerCase())
        });
        if (!staff) {
          console.log(`Staff ${email} not found.\n`);
          continue;
        }

        const newStatus = !staff.active;
        await db.update(schema.staffUsers).set({
          active: newStatus,
          updatedAt: new Date()
        }).where(eq(schema.staffUsers.id, staff.id));

        console.log(`\n>>> User ${email} is now ${newStatus ? "ACTIVE" : "INACTIVE"}.\n`);
      } else {
        console.log("Exiting.\n");
        break;
      }
    }
  } catch (err) {
    console.error("Error managing staff:", err);
  } finally {
    await client.end();
  }
}

main();
