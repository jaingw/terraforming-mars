export class UnexpectedInput extends Error {
  private inputstr:string = 'UnexpectedInput';
  constructor(public override message: string) {
    super(message);
    this.name = 'UnexpectedInput';
  }

  public getInput() :string {
    return this.inputstr;
  }
}
