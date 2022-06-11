

namespace component {
    /**
     * hua按钮
     */
    export class HuaButton extends Laya.Button {

        private _font: Laya.Image;
        private _scaleTime: number = 100;

        private _copyScaleX: number;
        private _copyScaleY: number;
        private _lock: boolean; //锁定动画
        private _tween: Laya.Tween;
        private _sound: string;

        //----red
        private _redImgPos: number[];
        private _redPointArr: number[] = [];
        private _redImg: Laya.Image;
        private _redSkin: string;

        //----systemOpen
        private _openId: number;
        private _openImg: Laya.Image;

        // -- 是否沉默
        public silent: boolean = false;

        constructor(skin: string = null, label: string = "") {
            super(skin, label);
            this.stateNum = 1;
            this.anchorX = this.anchorY = 0.5;
            this.on(Laya.Event.MOUSE_DOWN, this, this.onMouseDown);
            //红点
            this._redImgPos = [0, 0];
            this._redSkin = 'commonRes/red.png';
        }

        public set isScale(bool: boolean) {
            if (bool) {
                this.on(Laya.Event.MOUSE_DOWN, this, this.scaleSmall);
            } else {
                this.off(Laya.Event.MOUSE_DOWN, this, this.scaleSmall);
                this.off(Laya.Event.MOUSE_UP, this, this.scaleBig);
                this.off(Laya.Event.MOUSE_OUT, this, this.scaleBig);
            }
        }

        public set sound(str: string) {
            if (this._sound != str) {
                this._sound = str;
            }
        }

        //--------------文字图片----------------------------------
        public set fontSkin(url: string) {
            if(url == '')return;
            this.createFontImg();
            this._font.skin = url;
        }

        public get fontSkin(): string {
            return this._font ? this._font.skin : '';
        }

        public set fontX(x: number) {
            this.createFontImg();
            this._font.x = x;
        }

        public set fontY(y: number) {
            this.createFontImg();
            this._font.y = y;
        }

        private createFontImg() {
            if (!this._font)
                this._font = new Laya.Image();
            this.addChild(this._font);
        }

        //--------------红点----------------------------------
        /**是否启用红点(启用了还是受到监听管理的 不一定显示) */
        public set enableRed(b: boolean) {
            if (b) {
                this.createRedImg();
            }
            else {
                if (this._redImg) {
                    this._redImg = null;
                }
            }
        }
        /**当前是否红点 */
        public get isRed() {
            return this._redImg && this._redImg.visible;
        }
        //UI里面不支持数组， 这个只给UI那边赋值用
        public set redPoint(str: string) {
            this.redPointArr = str.split(',').map((s) => { return parseInt(s) });
        }
        /**监控红点ID数组 */
        public set redPointArr(arr: number[]) {
            this._redPointArr = arr.slice();
            util.RedPoint.regBtn(this, this._redPointArr);
            //有图片了就刷新下显示
            if (!this._redImg)
                this.createRedImg();
            else
                this._redImg.visible = util.RedPoint.checkShow(this._redPointArr);
        }
        /**监控红点ID数组 */
        public get redPointArr(): number[] {
            return this._redPointArr;
        }
        /**红点坐标X */
        public set redX(x: number) {
            this._redImgPos[0] = x == undefined ? 0 : x;
            this.setRedPos();
        }
        /**红点坐标Y */
        public set redY(y: number) {
            this._redImgPos[1] = y == undefined ? 0 : y;
            this.setRedPos();
        }
        /**设置红点素材 */
        public set redSkin(url: string) {
            this._redSkin = url;
            if (this._redImg)
                this._redImg.skin = url;
        }
        /**红点素材*/
        public get redSkin() {
            return this._redImg ? this._redImg.skin : '';
        }
        private createRedImg() {
            if (!this._redImg) {
                this._redImg = new Laya.Image();
                this._redImg.skin = this._redSkin;
                this.setRedPos();
                this.addChild(this._redImg);
                util.RedPoint.regBtn(this, this._redPointArr);
                this._redImg.visible = util.RedPoint.checkShow(this._redPointArr) && this.checkCanShowRed();
            }
        }
        private setRedPos() {
            if (this._redImg) {
                this._redImg.pos(this._redImgPos[0], this._redImgPos[1], true);
            }
        }
        /**红点数据变动回调，只有enableRed==true才有效（不要自己调用这个） */
        onRedChange(b: boolean) {
            if (this._redImg && this.checkCanShowRed())
                this._redImg.visible = b;
        }

        // ---------自身消亡
        set removeId(value: number) {
            value != 0 && EventManager.event(globalEvent.REG_REMOVE, [value, this]);
        }

        //-----------------------系统开放--------------------
        set sysOpen(id: number) {
            if (id) {
                this._openId = id;
                if (!this._openImg) {
                    this._openImg = new Laya.Image('commonUI/mcLock.png');
                    this._openImg.anchorX = this._openImg.anchorY = 0.5;
                    this._openImg.pos(this.width / 2, this.height / 2, true);
                    this._openImg.visible = false;
                    this.addChild(this._openImg);
                    this._openImg.on(Laya.Event.CLICK, this, (e: Laya.Event) => {
                        e.stopPropagation();
                        EventManager.event(globalEvent.SHOW_SYSTEM_LOCK_INFO, this._openId);
                    });
                    Laya.timer.frameOnce(3, this, () => {
                        var hitArea = new Laya.HitArea();
                        var graphics = new Laya.Graphics();
                        graphics.drawRect(-10, -this.height / 2 - 10, this.width + 20, this.height + 20, "#ff9900");
                        hitArea.hit = graphics;
                        this._openImg.hitArea = hitArea;
                    });
                }
                //查询这个开放id是否已开启(这里用事件防止引用clientCore中的SystemOpenManager)
                EventManager.on(globalEvent.SYSTEM_OPEN_CHANGED, this, this.onSysOpenChange);
                EventManager.event(globalEvent.CHECK_SYSTEM_OPEN, [this._openId]);
            }
        }

        /**判断是否显示红点（系统开放了才显示） */
        private checkCanShowRed() {
            if (this._openImg) {
                return !this._openImg.visible;
            }
            else {
                return true;
            }
        }

        _sizeChanged() {
            super._sizeChanged();
            if (this._openImg) {
                this._openImg.pos(this.width / 2, this.height / 2, true);
            }
        }

        private onSysOpenChange(openId: number, open: boolean) {
            if (this._openId == openId) {
                // this.mouseEnabled = open;
                let xlsInfo = xls.get(xls.systemTable) && xls.get(xls.systemTable).get(openId);
                if (xlsInfo) {
                    if (xlsInfo.lockType == 1)
                        this.visible = open;
                    if (xlsInfo.lockType == 2)
                        this._openImg.visible = !open;
                }
                //系统开放后 也检查下红点
                if (this._redImg)
                    this._redImg.visible = util.RedPoint.checkShow(this._redPointArr) && this.checkCanShowRed();

                //TODO 排行榜特殊处理
                if (openId == 35 && this.visible) {
                    EventManager.event("check_rank_open");
                }
            }
        }

        private scaleSmall(): void {
            if (this._lock) return;
            this._lock = true;
            this.once(Laya.Event.MOUSE_UP, this, this.scaleBig);
            this.once(Laya.Event.MOUSE_OUT, this, this.scaleBig);
            this._copyScaleX = this.scaleX;
            this._copyScaleY = this.scaleY;
            this._tween = Laya.Tween.to(this, { scaleX: 0.8 * this._copyScaleX, scaleY: 0.8 * this._copyScaleY }, this._scaleTime);
        }

        private scaleBig(): void {
            this.off(Laya.Event.MOUSE_UP, this, this.scaleBig);
            this.off(Laya.Event.MOUSE_OUT, this, this.scaleBig);
            this._tween && Laya.Tween.clear(this._tween);
            this._tween = Laya.Tween.to(this, { scaleX: this._copyScaleX, scaleY: this._copyScaleY }, this._scaleTime, null, Laya.Handler.create(this, function (): void {
                this._lock = false;
            }));
        }

        private onMouseDown() {
            if (this._sound)
                core.SoundManager.instance.playBtnSound(this._sound);
        }

        public destory(): void {
            util.RedPoint.unregBtn(this);
            this._redImg && this._redImg.destroy();
            this._font && this._font.destroy();
            this._tween && this._tween.clear();
            this._tween = this._font = null;
            this._openImg && this._openImg.offAll();
            EventManager.off(globalEvent.SYSTEM_OPEN_CHANGED, this, this.onSysOpenChange);
            super.destroy();
        }
    }
}