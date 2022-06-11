namespace clientCore{
    export interface ICommand{
        Execute():Promise<any>;
    }
}