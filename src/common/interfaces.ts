export interface Result<Ok, Err> {
  ok?: Ok;
  error?: Err;
}

export interface BaseResult {
  ok?: boolean;
  error?: string;
}

export type AnyObject = Record<string, unknown>;
