namespace scene.animation {
    /**
     * 动画数据
     */
    export class AnimationData {
        /** 动画ID*/
        public id: number;
        /** 动画地址*/
        public path: string;
        /** 是否参与变速*/
        public isRate: boolean;
        /** 变速id*/
        public rateId: number;

        constructor() { }

        public dispose(): void {
            this.id = this.rateId = -1;
            this.isRate = false;
            this.path = "";
            Laya.Pool.recover("AnimationData", this);
        }

        public static create(): AnimationData {
            return Laya.Pool.getItemByClass("AnimationData", AnimationData);
        }
    }
}