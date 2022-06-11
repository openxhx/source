namespace core {
    export interface IMapBean {
        start(ui?:any,data?: any): void;
        touch():void;
        redPointChange():void;
        destroy(): void;
    }
}