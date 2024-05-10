// 用来精简error日志,  避免打印过多换行
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
