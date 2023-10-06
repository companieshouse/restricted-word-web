class RestrictedWordError extends Error {

  errors: string[];

  constructor(message: string, errors: string[]) {
    super(message);
    this.errors = errors;
  }
}

export default RestrictedWordError;