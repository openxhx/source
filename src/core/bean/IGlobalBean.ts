namespace core {
    export interface IGlobalBean {
        start(data?: any): void;
        destory(): void;
    }
}