export class TestArgumentError extends Error {
  constructor(name: string, value: any, additionalMessage?: string) {
    super();
    this.message = `Invalid value for argument \`${name}\`: "${value}"`;
    if (additionalMessage) {
      this.message += ` ${additionalMessage}`;
    }
  }
}

export interface Callback {
  (errors?: Error[], result?: any): any;
}