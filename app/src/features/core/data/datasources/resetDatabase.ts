import { databaseService } from "./database";

export async function deleteDatabaseFile(): Promise<void> {
  await databaseService.reset();
  console.info("Base de datos restablecida.");
}
