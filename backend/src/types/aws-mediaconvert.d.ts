/**
 * Type declaration for @aws-sdk/client-mediaconvert.
 * Allows tsc to compile without the package in node_modules (e.g. in CI/deploy).
 * Runtime still requires: npm install @aws-sdk/client-mediaconvert
 */
declare module '@aws-sdk/client-mediaconvert' {
  export class MediaConvertClient {
    constructor(config?: { region?: string; endpoint?: string });
    send(command: unknown): Promise<{ Job?: Job; Endpoints?: Array<{ Url?: string }> }>;
  }

  export class CreateJobCommand {
    constructor(input: {
      Role: string;
      UserMetadata?: Record<string, string>;
      Settings?: unknown;
    });
  }

  export class GetJobCommand {
    constructor(input: { Id: string });
  }

  export class DescribeEndpointsCommand {
    constructor(input?: { Mode?: string });
  }

  export interface Job {
    Id?: string;
    Status?: string;
    ErrorCode?: number;
    ErrorMessage?: string;
  }
}
