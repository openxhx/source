namespace scene.animation {
    /**
     * 动画控制器
     */
    export class AnimationControl {
        /** 唯一id*/
        private _id: number = 0;
        /** 动画播放速率*/
        private _rate: number = 1;
        /** bone map*/
        private _boneMap: util.HashMap<BoneRender>;
        /** 被暂停次数*/
        private _pasueTimes: number = 0;
        private _copyRate: number;

        constructor() {
            this._boneMap = new util.HashMap<BoneRender>();
        }

        public get rate(): number {
            return this._rate;
        }

        public set rate(value: number) {
            if (this._rate == value) return;
            this._rate = value;
            // 骨骼变速
            let _boneArr: BoneRender[] = this._boneMap.getValues();
            _.forEach(_boneArr, (element: BoneRender) => {
                element && element.playbackRate(value);
            })
        }

        /** 暂停*/
        public pasue(): void {
            if (this._pasueTimes == 0) {
                this._copyRate = this._rate;
            }
            this._pasueTimes++;
            battle.BattleConfig.isPause = true;
            this.rate = 0.000000001; //设置最慢速率 达到暂停效果 不知道为啥直接设置暂停没有用
        }

        /** 恢复暂停*/
        public resume(): void {
            if (!battle.BattleConfig.isPause) return;
            if (--this._pasueTimes == 0) {
                battle.BattleConfig.isPause = false;
                this.rate = this._copyRate;
            }
        }

        /**
         * 骨骼注册变速
         * @param render 
         */
        public boneRegister(render: BoneRender): number {
            if (this._boneMap.has(this._id)) {
                return this._id;
            }
            this._boneMap.add(this._id, render);
            render.playbackRate(battle.BattleConfig.rate);
            return this._id++;
        }

        /**
         * 移除
         * @param id 
         */
        public removeBone(id: number): void {
            this._boneMap.remove(id);
        }


        private static _ins: AnimationControl;
        public static get ins(): AnimationControl {
            return this._ins || (this._ins = new AnimationControl());
        }
    }
}