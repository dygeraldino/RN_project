export class RobleConfig {
  static readonly baseUrl = "https://roble-api.openlab.uninorte.edu.co";
  static readonly dbName = "movilapp_a4de2ed3d7";

  // Auth endpoints
  static get loginEndpoint(): string {
    return `/auth/${RobleConfig.dbName}/login`;
  }

  static get signupEndpoint(): string {
    return `/auth/${RobleConfig.dbName}/signup`;
  }

  static get signupDirectEndpoint(): string {
    return `/auth/${RobleConfig.dbName}/signup-direct`;
  }

  static get refreshTokenEndpoint(): string {
    return `/auth/${RobleConfig.dbName}/refresh-token`;
  }

  static get verifyEmailEndpoint(): string {
    return `/auth/${RobleConfig.dbName}/verify-email`;
  }

  static get forgotPasswordEndpoint(): string {
    return `/auth/${RobleConfig.dbName}/forgot-password`;
  }

  static get resetPasswordEndpoint(): string {
    return `/auth/${RobleConfig.dbName}/reset-password`;
  }

  static get logoutEndpoint(): string {
    return `/auth/${RobleConfig.dbName}/logout`;
  }

  static get verifyTokenEndpoint(): string {
    return `/auth/${RobleConfig.dbName}/verify-token`;
  }

  // Database endpoints
  static get databaseEndpoint(): string {
    return `/database/${RobleConfig.dbName}`;
  }

  static get readEndpoint(): string {
    return `${RobleConfig.databaseEndpoint}/read`;
  }

  static get insertEndpoint(): string {
    return `${RobleConfig.databaseEndpoint}/insert`;
  }

  static get updateEndpoint(): string {
    return `${RobleConfig.databaseEndpoint}/update`;
  }

  static get deleteEndpoint(): string {
    return `${RobleConfig.databaseEndpoint}/delete`;
  }

  static defaultHeaders(): Record<string, string> {
    return {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
  }

  static authHeaders(token: string): Record<string, string> {
    return {
      ...RobleConfig.defaultHeaders(),
      Authorization: `Bearer ${token}`,
    };
  }
}
