/*
 * Lightweight in-memory database to mimic the original sqflite layer.
 * This lets the feature logic stay close to the Flutter implementation
 * while we migrate the rest of the stack to React Native.
 */

export type TableRecord = Record<string, any> & { _id?: string };

const randomId = () => Math.random().toString(36).slice(2, 10);

export class DatabaseService {
  private static instance: DatabaseService;
  private tables: Map<string, TableRecord[]> = new Map();
  private initialised = false;

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  async database(): Promise<DatabaseService> {
    if (!this.initialised) {
      await this.init();
    }
    return this;
  }

  private async init(): Promise<void> {
    if (this.initialised) return;

    this.tables.set("persona", [
      {
        _id: randomId(),
        nombre: "usuario1",
        correo: "a@a.com",
        contrasena: "123456",
      },
      {
        _id: randomId(),
        nombre: "usuario2",
        correo: "b@a.com",
        contrasena: "123456",
      },
      {
        _id: randomId(),
        nombre: "usuario3",
        correo: "c@a.com",
        contrasena: "123456",
      },
    ]);

    const firstProfessor = this.tables.get("persona")?.[0]?._id ?? randomId();

    this.tables.set("curso", [
      {
        _id: randomId(),
        nombre_asignatura: "curso1",
        descripcion: "Curso de prueba",
        profesor_id: firstProfessor,
        codigo: "123456",
        created_at: new Date().toISOString(),
      },
    ]);

    const firstCourse = this.tables.get("curso")?.[0]?._id ?? randomId();

    this.tables.set("categoria", []);
    this.tables.set("grupo", []);
    this.tables.set("categoria_estudiante", []);
    this.tables.set("actividad", []);
    this.tables.set("evaluacion", []);
    this.tables.set("criterio", []);
    this.tables.set("estudiante_curso", [
      {
        _id: randomId(),
        estudiante_id: this.tables.get("persona")?.[1]?._id ?? randomId(),
        curso_id: firstCourse,
      },
    ]);

    // New endpoints in Roble API expect these tables
    this.tables.set("enrollments", []);
    this.tables.set("groups", []);
    this.tables.set("group_members", []);
    this.tables.set("activities", []);

    this.initialised = true;
  }

  async read(tableName: string): Promise<TableRecord[]> {
    await this.database();
    return [...(this.tables.get(tableName) ?? [])];
  }

  async insert(tableName: string, records: TableRecord[]): Promise<void> {
    await this.database();
    const table = this.tables.get(tableName) ?? [];
    const enriched = records.map((record) => ({
      ...record,
      _id: record._id ?? randomId(),
    }));
    this.tables.set(tableName, [...table, ...enriched]);
  }

  async update(
    tableName: string,
    id: string,
    updates: Partial<TableRecord>
  ): Promise<void> {
    await this.database();
    const table = this.tables.get(tableName) ?? [];
    const updated = table.map((record) =>
      record._id === id ? { ...record, ...updates } : record
    );
    this.tables.set(tableName, updated);
  }

  async delete(tableName: string, id: string): Promise<void> {
    await this.database();
    const table = this.tables.get(tableName) ?? [];
    const filtered = table.filter((record) => record._id !== id);
    this.tables.set(tableName, filtered);
  }

  async clear(tableName: string): Promise<void> {
    await this.database();
    this.tables.set(tableName, []);
  }

  async reset(): Promise<void> {
    this.tables.clear();
    this.initialised = false;
    await this.init();
  }
}

export const databaseService = DatabaseService.getInstance();
