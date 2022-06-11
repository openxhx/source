namespace newYearEggGame {
    /**
     * 一只蛋的一生
     */
    export class Egg {
        public isActive: boolean = false; //是否启动
        public isHide: boolean = false; //是否被打了
        private _object: Laya.Image;
        private _appearTime: number;
        private _continuedTime: number;
        private _leaveTime: number;
        private _type: number;
        private _source: number;
        private _bone: clientCore.Bone;
        private _isClick: boolean = false;
        private index:number[] = [2 , 4 , 1 , 3]
        constructor(object: Laya.Image) {
            this._object = object;
            this._object.y = 185;
        }

        show(data: xls.gameWhackMole, prop: number): void {
            if (this.isActive || this._isClick) return;
            this.isActive = true;
            this.isHide = false;
            this._type = data.id;
            this._object.visible = true;
            this._object.y = 185;
            this._appearTime = 1000 * data.appearTime * prop;
            this._continuedTime = 1000 * data.continuedTime * prop;
            this._leaveTime = 1000 * data.leaveTime * prop;
            this._source = data.integral.v1 == 0 ? -data.integral.v2 : data.integral.v2;
            this._object.skin = `newYearEggGame/${data.id}.png`;
            console.log('type：' + data.name + ' time: ' + (this._continuedTime + this._appearTime + this._leaveTime));
            util.TweenUtils.creTween(this._object, { y: 0 }, this._appearTime, Laya.Ease.quintOut, this, () => { Laya.timer.once(this._continuedTime, this, this.hide); }, 'NewYearEggGameModule');
        }

        hide(): void {
            this._object.y = 0;
            util.TweenUtils.creTween(this._object, { y: 185 }, this._leaveTime, Laya.Ease.quintIn, this, this.reset, 'NewYearEggGameModule');
        }

        reset(): void {
            this.isHide = false;
            this.isActive = false;
            this._object.visible = false;
        }

        click(parent: Laya.Sprite, x: number, y: number): void {
            this._isClick = true;
            this._object.visible = false;
            Laya.timer.clear(this, this.hide);
            this._bone?.dispose();
            this._bone = clientCore.BoneMgr.ins.play(`res/animate/eggGame/huabao${this.index[this._type-1]}.sk`, 0, false, parent);
            this._bone.pos(x, y - 10);
            this._bone.scaleX = this._bone.scaleY = 0.65;
            if(this._type <= 3){
                this._bone.scaleX = -0.65;
            }
            this._bone.once(Laya.Event.COMPLETE, this, () => {
                this._isClick = false;
                this.reset();
            });
        }

        dispose(): void {
            Laya.timer.clear(this, this.hide);
            this._bone?.dispose();
            this._bone = this._object = null;
        }

        get source(): number {
            return this._source;
        }
    }
}