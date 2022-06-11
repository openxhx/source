namespace playground {
    export interface IMove {
        start(unit: Unit, param: any, movement: Movement): void;
        /**
         * 更新动作
         * @param passTime 经过时间（毫秒） 
         */
        update(passTime: number): void;
        dispose(): void;
    }
}