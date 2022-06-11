namespace secretroom{
    export interface IRoom{
        /** 房间的唯一ID*/
        id: number;
        /** 房间通关目标*/
        target: string;
        /** 房间所在的层级*/
        layer: Laya.Sprite;
        /** 进入房间*/
        enter(sign: number,id: number,layer: Laya.Sprite): void;
        /**
         * 更新房间某个道具的状态
         * @param key 道具的唯一ID
         * @param status 道具状态 1-未被触发 触发了
         */
        updateItem(key: string,status: number): void;
        /** 退出房间*/
        exit(): void;
    }
}