export class AppError extends Error {
  // 构造函数 new AppError时调用
  constructor(
    message: string, // 人类可读的错误信息
    public readonly code: string, // 机器可读的错误代码
    public readonly cause?: unknown, // 可选的原始错误原因
  ) {
    //调用父类构造函数
    super(message);
    // 设置错误的名称
    this.name = "AppError";
  }
}
