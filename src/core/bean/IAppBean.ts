namespace core {
    export interface IAppBean {
        start(data?: any): Promise<any>;
    }
}