interface ResponseData<T> {
  code: number;
  msg: string;
  data: T;
}

class Request {
  get<T>(url: string, opts?: Record<string, any>) {
    return this.fetch<T>({
      method: 'get',
      ...opts,
    });
  }

  fetch<T, R = ResponseData<T>>(opts: Record<string, any>) {
    return new Promise<T>((resolve) => {
      resolve({} as T);
    });
  }
}

export default new Request();
