namespace net {
    export class ErrorCode {
        id: number;
        desc: string;

        static OUT_TIME = { id: 0, desc: '请求超时！' };
    }
}