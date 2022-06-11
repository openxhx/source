namespace cp {
    export interface ISupporter<T> {
        show(data?: T): void;
        addPreLoad(promise: Promise<T>): void;
        hide(): void;
    }
}