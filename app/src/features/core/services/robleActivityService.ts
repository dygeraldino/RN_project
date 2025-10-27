import { robleDatabaseService } from "./robleDatabaseService";

export interface ActivityRecord extends Record<string, any> {}

export class RobleActivityService {
  constructor(private readonly database = robleDatabaseService) {}

  async getActivitiesByCourse(courseId: string): Promise<ActivityRecord[]> {
    try {
      const activities = await this.database.read("activities");
      const filtered = activities.filter(
        (activity) => activity["course_id"] === courseId
      );

      const processed = filtered.map((activity) => {
        const clone: ActivityRecord = { ...activity };
        const dueDateRaw = clone["due_date"];
        if (dueDateRaw) {
          const dueDate = new Date(dueDateRaw);
          if (!Number.isNaN(dueDate.getTime())) {
            clone["due_date_object"] = dueDate;
            clone["formatted_due_date"] = `${dueDate.getDate()}/${
              dueDate.getMonth() + 1
            }/${dueDate.getFullYear()}`;
          } else {
            clone["formatted_due_date"] = "Fecha inválida";
          }
        }
        return clone;
      });

      for (const activity of processed) {
        if (activity["category_id"]) {
          const categoryInfo = await this.getCategoryInfo(
            activity["category_id"]
          );
          if (categoryInfo) {
            activity["category_name"] = categoryInfo["name"];
            activity["category_type"] = categoryInfo["type"];
          }
        }
      }

      processed.sort((a, b) => {
        const dateA = a["due_date_object"] as Date | undefined;
        const dateB = b["due_date_object"] as Date | undefined;
        if (!dateA && !dateB) return 0;
        if (!dateA) return 1;
        if (!dateB) return -1;
        return dateA.getTime() - dateB.getTime();
      });

      return processed;
    } catch (error) {
      console.warn("Error obteniendo actividades del curso", error);
      return [];
    }
  }

  private async getCategoryInfo(
    categoryId: string
  ): Promise<ActivityRecord | null> {
    try {
      const categories = await this.database.read("categories");
      return (
        categories.find((category) => category["_id"] === categoryId) ?? null
      );
    } catch (error) {
      console.warn("Error obteniendo categoría", error);
      return null;
    }
  }

  async getActivityById(activityId: string): Promise<ActivityRecord | null> {
    try {
      const activities = await this.database.read("activities");
      return (
        activities.find((activity) => activity["_id"] === activityId) ?? null
      );
    } catch (error) {
      console.warn("Error obteniendo actividad por id", error);
      return null;
    }
  }

  async getActivityStatsByCourse(
    courseId: string
  ): Promise<Record<string, number>> {
    try {
      const activities = await this.getActivitiesByCourse(courseId);
      const now = new Date();

      let pending = 0;
      let overdue = 0;

      activities.forEach((activity) => {
        const dueDate = activity["due_date_object"] as Date | undefined;
        if (dueDate) {
          if (dueDate < now) {
            overdue += 1;
          } else {
            pending += 1;
          }
        }
      });

      return {
        total: activities.length,
        pending,
        overdue,
      };
    } catch (error) {
      console.warn("Error calculando estadísticas de actividades", error);
      return { total: 0, pending: 0, overdue: 0 };
    }
  }
}

export const robleActivityService = new RobleActivityService();
