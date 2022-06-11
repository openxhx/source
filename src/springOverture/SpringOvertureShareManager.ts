namespace springOverture {

    export class SpringOvertureShareManager {
        private static _shareUI: ui.share.ShareHUI;
        private static _loadAtlas: boolean = false;
        private static _shareImgCanvas: Laya.HTMLCanvas;
        private static _shareDirection: 'horizontal' | 'vertical';
        private static _flashSp: Laya.Sprite;
        public static _isReward: boolean;
        /**弹出分享UI，返回bool的promise，标识是否分享成功 */
        static async showShare(direction: 'horizontal' | 'vertical'): Promise<boolean> {
            if (!clientCore.GlobalConfig.canShare) {
                alert.showSmall("应用版本低，请先去升级~");
                return Promise.resolve(false);
            }
            clientCore.LayerManager.disableClickEffect();
            this._shareDirection = direction;
            //没有图集先加载图集
            if (!this._loadAtlas) {
                await clientCore.ModuleManager.loadatlas('share');
                await clientCore.ModuleManager.loadUnpack('share');
                this._loadAtlas = true;
            }
            this._shareUI = new ui.share.ShareHUI() ;
            this._shareUI.x = clientCore.LayerManager.OFFSET;
            this._shareUI.imgCode.visible = false;
            this._shareUI.imgFirst.visible = false;
            this._shareUI.img.texture = Laya.stage.drawToCanvas(this.imgSize.width, this.imgSize.height, -clientCore.LayerManager.OFFSET, 0).getTexture();
            //闪屏动效
            await this.flashScreen();
            //创建分享UI
            this.createUI();
            return Promise.resolve(true);
        }

        /**保存当前截屏 1334x750 */
        static async saveScreenShot(direction: 'horizontal' | 'vertical'): Promise<boolean> {
            if (!clientCore.GlobalConfig.canShare) {
                alert.showSmall("应用版本低，请先去升级~");
                return Promise.resolve(false);
            }
            //闪屏动效
            await this.flashScreen();
            let canvas = this.equalCanvas(Laya.stage.drawToCanvas(this.imgSize.width, this.imgSize.height, -clientCore.LayerManager.OFFSET, 0));
            let base64 = canvas.toBase64('image/png', 0.9);
            if (!Laya.Render.isConchApp) {
                SaveFile.saveFile(`screenshot.png`, this.base64ToBlob(base64, "png"));
            }
            else {
                clientCore.NativeMgr.instance.saveImage(base64, direction == 'horizontal' ? 'hengping' : 'shuping')
            }
            clientCore.Logger.sendLog('系统', '分享', '保存截图');
            return Promise.resolve(true);
        }

        /**
         * 完成合适的canvas
         * @param canvas 
         */
        private static equalCanvas(canvas: Laya.HTMLCanvas): Laya.HTMLCanvas{
            if(Laya.Browser.onIOS)return canvas;
            let sp: Laya.Sprite = new Laya.Sprite();
            let texture: Laya.Texture = canvas.getTexture();
            sp.graphics.drawTexture(texture);
            sp.scaleY = -1;
            return sp.drawToCanvas(texture.width,texture.height,0,texture.height);
        }

        private static createUI() {
            //截图
            this._shareImgCanvas = this.equalCanvas(this._shareUI.boxShareImg.drawToCanvas(this.imgSize.width, this.imgSize.height, 0, 0));
            clientCore.LayerManager.clickEffectLayer.addChild(this._shareUI);
            this._shareUI.ani1.play(0, false);
            //安卓不需要QQ+QZone分享
            this._shareUI.btnQQ.visible = this._shareUI.btnQzone.visible = Laya.Browser.onIOS;
            BC.addEvent(this, this._shareUI.btnClose, Laya.Event.CLICK, this, this.closeShare);
            BC.addEvent(this, this._shareUI.btnQQ, Laya.Event.CLICK, this, this.goShare, ['qq']);
            BC.addEvent(this, this._shareUI.btnQzone, Laya.Event.CLICK, this, this.goShare, ['qZone']);
            BC.addEvent(this, this._shareUI.btnWeibo, Laya.Event.CLICK, this, this.goShare, ['sina']);
            BC.addEvent(this, this._shareUI.btnWeixin, Laya.Event.CLICK, this, this.goShare, ['wechat']);
            BC.addEvent(this, this._shareUI.btnTimeline, Laya.Event.CLICK, this, this.goShare, ['wechatTimeLine']);
        }

        private static get imgSize(): { width: number, height: number } {
            let _width = 1334;
            let _height = 750;
            if (Laya.Browser.width / Laya.Browser.height < 1.77) {
                _width = Laya.Browser.width;
                _height = 750 * Laya.Browser.width / 1334;
            }
            return { width: _width, height: _height };
        }

        private static async flashScreen() {
            if (!this._flashSp) {
                this._flashSp = new Laya.Sprite();
                this._flashSp.graphics.drawRect(0, 0, Laya.stage.width, Laya.stage.height, '0xffffff');
            }
            clientCore.LayerManager.clickEffectLayer.addChild(this._flashSp);
            this._flashSp.visible = true;
            for (let i = 0; i < 3; i++) {
                await util.TimeUtil.awaitTime(50);
                this._flashSp.visible = !this._flashSp.visible;
            }
            this._flashSp.removeSelf();
            await util.TimeUtil.awaitTime(200);
        }

        private static closeShare() {
            this._shareImgCanvas.destroy();
            this._shareUI.destroy();
            BC.removeEvent(this, this._shareUI);
            clientCore.LayerManager.enableClickEffect();
        }

        private static goShare(platform: string) {
            let base64 = this._shareImgCanvas.toBase64('image/png', 0.9);
            if (!Laya.Render.isConchApp) {
                SaveFile.saveFile(`share_${platform}.png`, this.base64ToBlob(base64, "png"));
            }
            else {
                BC.addOnceEvent(this, EventManager, 'ios_share_over', this, this.onShareOver);
                clientCore.NativeMgr.instance.shareImage(base64, platform, this._shareDirection == 'horizontal' ? 'hengping' : 'shuping')
            }
            clientCore.Logger.sendLog('系统', '分享', `分享至${platform}`);
        }

        private static onShareOver(state: number) {
            this.closeShare();
            // alert.showFWords('分享状态' + state);
            if (!this._isReward) {
                net.sendAndWait(new pb.cs_overture_of_spring_share_get_reawd()).then((msg: pb.sc_overture_of_spring_share_get_reawd) => {
                    alert.showReward(msg.items);
                    clientCore.MedalManager.setMedal([{ id: MedalConst.SHARE_FIRST, value: 1 }]);
                    this._isReward = true;
                    //this.updateReward();
                    EventManager.event(globalEvent.FIRST_SHARE_BACK);
                });
            }
        }

        private static updateReward() {
            this._shareUI.imgFirst.visible = false;
        }

        private static base64ToBlob(urlData, type) {
            let arr = urlData.split(',');
            let mime = arr[0].match(/:(.*?);/)[1] || type;
            // 去掉url的头，并转化为byte
            let bytes = window.atob(arr[1]);
            // 处理异常,将ascii码小于0的转换为大于0
            let ab = new ArrayBuffer(bytes.length);
            // 生成视图（直接针对内存）：8位无符号整数，长度1个字节
            let ia = new Uint8Array(ab);
            for (let i = 0; i < bytes.length; i++) {
                ia[i] = bytes.charCodeAt(i);
            }
            return new Blob([ab], {
                type: mime
            });
        }

    }

    class SaveFile {
        public static fake_click(obj) {
            var ev = document.createEvent("MouseEvents");
            ev.initMouseEvent(
                "click", true, false, window, 0, 0, 0, 0, 0
                , false, false, false, false, 0, null
            );
            obj.dispatchEvent(ev);
        }
        public static saveFile(name, data) {
            let urlObject: any = window.URL || window["webkitURL"] || window;

            let downloadData = new Blob([data]);

            let save_link = document.createElementNS("http://www.w3.org/1999/xhtml", "a");
            save_link["href"] = urlObject.createObjectURL(downloadData);
            save_link["download"] = name;
            this.fake_click(save_link);
        }
    }
}