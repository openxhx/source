namespace scene.animation {

    import BoneMemory = clientCore.BoneMemory;
    /**
     * 骨骼动画渲染
     */
    export class BoneRender extends Laya.Sprite {

        // private static _templetMap: util.HashMap<Laya.Templet> = new util.HashMap<Laya.Templet>();

        private _tmp: Laya.Templet;
        /** 骨骼动画*/
        private _sk: Laya.Skeleton;
        /** 动画停止（一般用于不循环动画结束的回调）*/
        private _stopHandler: Laya.Handler;
        /** label事件回调*/
        private _labelHandler: Laya.Handler;
        /** 动画数据*/
        private _data: AnimationData;
        private _disposed: boolean;

        /** 当前期待播放的标签*/
        private _currentLabel: string = "";

        constructor() { super(); }

        /**
         * 初始化动画
         * @param data 数据
         * @param complete 初始化完成回调
         */
        public init(data: AnimationData, complete: Laya.Handler): void {
            this._data = data;
            this._disposed = false;
            let templet: Laya.Templet = BoneMemory.ins.getTemp(data.path);
            if (!templet) {
                templet = new Laya.Templet();
                templet.once(Laya.Event.COMPLETE, this, this.parseData, [templet, complete]);
                templet.loadAni(data.path);
            } else {
                this.renderBone(templet, complete);
            }
        }

        private parseData(templet: Laya.Templet, complete: Laya.Handler): void {
            if (this._data && templet) {
                templet.lock = true; //+锁 防止清理
                this.renderBone(templet, complete);
            }
        }

        private renderBone(templet: Laya.Templet, complete: Laya.Handler): void {
            this._tmp = templet;
            this.showBone();
            this._data.isRate && this.registerRate();
            complete && complete.run();
            BoneMemory.ins.remove(this._data.path, templet);
        }

        private showBone(): void {
            this._sk = this._tmp.buildArmature(0);
            this._sk.on(Laya.Event.STOPPED, this, this.onStoped);
            this._sk.on(Laya.Event.LABEL, this, this.onLabeled);
            this.addChild(this._sk);
        }

        /**
         * 播放动作
         * @param nameOrIndex 
         * @param isLoop 是否循环
         * @param complete 
         */
        public playAni(nameOrIndex: any, isLoop: boolean, complete?: Laya.Handler): void {
            if (this._sk) {
                this._stopHandler = complete;
                this._sk.play(nameOrIndex, isLoop);
            }
        }

        /**
         * 标签播放
         * @param nameOrIndex 
         * @param isLoop 
         * @param complete 
         * @param callLabel 
         */
        public playLabel(nameOrIndex: any, isLoop, complete: Laya.Handler, callLabel: Laya.Handler): void {
            if (this._sk) {
                this._stopHandler = complete;
                this._labelHandler = callLabel;
                this._sk.play(nameOrIndex, isLoop);
            }
        }

        public playLabel2(nameOrIndex: any, isLoop, complete: Laya.Handler, callLabel: Laya.Handler, label: string): void {
            if (this._sk) {
                this._currentLabel = label;
                this._stopHandler = complete;
                this._labelHandler = callLabel;
                this._sk.play(nameOrIndex, isLoop);
            }
        }

        /** 设置播放速率*/
        public playbackRate(value: number): void {
            this._sk && this._sk.playbackRate(value);
        }

        /** 注册变速*/
        public registerRate(): void {
            this._data.rateId = AnimationControl.ins.boneRegister(this);
        }

        /** 暂停*/
        public pause(): void {
            this._sk && this._sk.paused();
        }

        /** 恢复*/
        public resume(): void {
            this._sk && this._sk.resume();
        }

        /** 反转*/
        public reversal(): void {
            this.scaleX = -1;
        }

        /** 检查是否有Attack2*/
        public checkAttack2(): boolean {
            if (!this._tmp) return;
            let len: number = this._tmp.getAnimationCount();
            for (let i: number = 0; i < len; i++) {
                let ani: any = this._tmp.getAnimation(i);
                if (ani && unit.ActionEnum.ATTACK_2 == ani.name) {
                    return true;
                }
            }
            return false;
        }

        /** 是否被清理了*/
        public get disposed(): boolean {
            return this._disposed;
        }

        /**
         * dispose
         * @param isForse 是否强行清理模板数据 默认false 
         */
        public dispose(isForse?: boolean): void {
            this._disposed = true;
            this._data.isRate && AnimationControl.ins.removeBone(this._data.rateId);
            this._stopHandler = this._labelHandler = null;
            this._sk && this._sk.destroy();
            this._tmp && this._tmp.off(Laya.Event.COMPLETE, this, this.parseData);
            if (isForse) {
                BoneMemory.ins.delete(this._data.path);
                if (this._tmp) {
                    this._tmp.lock = false;
                    this._tmp.destroy();
                }
            } else {
                BoneMemory.ins.add(this._data.path);
            }
            this._data = this._tmp = this._sk = null;
            this.x = this.y = 0;
            this.scaleY = this.scaleX = 1;
            this._currentLabel = "";
            this.removeSelf();
            Laya.Pool.recover("BoneRender", this);
        }

        private onStoped(): void {
            if (this._stopHandler) {
                this._stopHandler.run();
                this._stopHandler = null;
            }
        }

        private onLabeled(data: Laya.EventData): void {
            if (this._labelHandler && (this._currentLabel == "" || this._currentLabel == data.name)) {
                this._labelHandler.run();
                this._labelHandler = null;
                this._currentLabel = "";
            }
        }

        public static create(): BoneRender {
            return Laya.Pool.getItemByClass("BoneRender", BoneRender);
        }
    }
}