export class ArgumentError extends Error {
  constructor(name: string, value: any, additionalMessage?: string) {
    super();
    this.message = `Invalid value for argument \`${name}\`: "${value}"`;
    if (additionalMessage) {
      this.message += ` ${additionalMessage}`;
    }
  }
}