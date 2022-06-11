namespace anniversaryShow {
    /**
     * 周年庆典服装秀
     * anniversaryShow.AnniversaryShowModule
     */
    export class AnniversaryShowModule extends ui.anniversaryShow.AnniversaryShowModuleUI {
        private curTimes: number;//当前游戏次数
        private dayLevels: number[];//今天关卡ids
        private person: clientCore.Person;

        private _shareImgCanvas: Laya.HTMLCanvas;
        private _flashSp: Laya.Sprite;
        private _isReward: boolean;
        init(d: { type: string, data: any }) {
            super.init(d);
            this.addPreLoad(xls.load(xls.shineTripStage));
            this.addPreLoad(this.getTodayLevel());
            this.addPreLoad(this.getShareRewardFlag());
            this.shareFrame.visible = false;
            this.boxTip.visible = true;
            this.closeBtn.visible = true;
        }

        private getTodayLevel() {
            return net.sendAndWait(new pb.cs_second_anniversary_celebration_customsId()).then((msg: pb.sc_second_anniversary_celebration_customsId) => {
                this.dayLevels = msg.customsId;
                this.curTimes = msg.showTime;
            })
        }

        private getShareRewardFlag() {
            return clientCore.MedalManager.getMedal([MedalConst.ANNIVERSARY_SHOW_SHARE]).then((msg: pb.ICommonData[]) => {
                this._isReward = msg[0].value == 1;
            })
        }

        onPreloadOver() {
            let curLevel: xls.shineTripStage;
            if (this._data.type == "level") {
                curLevel = xls.get(xls.shineTripStage).get(this.dayLevels[this.curTimes]);
                this.person = new clientCore.Person(clientCore.LocalInfo.sex, clientCore.LocalInfo.wearingClothIdArr);
                this.btnChange.visible = true;
                this.boxResult.visible = false;
                this.labTalk.text = curLevel.desc;
            } else if (this._data.type == "result") {
                this.btnNext.visible = this.curTimes < 9;
                curLevel = xls.get(xls.shineTripStage).get(this.dayLevels[this.curTimes]);
                this.person = new clientCore.Person(clientCore.LocalInfo.sex, this._data.cloth);
                this.btnChange.visible = false;
                this.boxResult.visible = true;
                let result: pb.sc_second_anniversary_celebration_score = this._data.data;
                for (let i = 1; i <= 3; i++) {
                    this["star" + i].visible = i <= result.star;
                }
                this.labTalk.text = curLevel["comment" + result.star];
                this.imgBadge.visible = result.isGet == 1;
                this.labPoint.text = "庆典积分+" + result.score;
                this.btnShare.visible = result.star == 3 && this.checkCanShare();
                this.imgTip.visible = this.btnShare.visible && !this._isReward;
                if (result.star == 0) {
                    this.btnRechange.visible = true;
                    this.btnNext.x = this.btnOver.x = 320;
                } else {
                    this.btnRechange.visible = false;
                    this.btnNext.x = this.btnOver.x = 158;
                    this.curTimes++;
                    this.sendOver();
                }
            }
            this.labTimes.text = (10 - this.curTimes) + "/10";
            this.imgBg.skin = `res/bg/anniversaryShow/${curLevel.id}.png`;
            this.person.scale(0.6, 0.6);
            this.role.addChild(this.person);
        }

        /**前往搭配 */
        private goChangeCloth() {
            let curLevel = xls.get(xls.shineTripStage).get(this.dayLevels[this.curTimes]);
            this.destroy();
            clientCore.ModuleManager.open('clothChange.ClothChangeModule', { cfg: curLevel, noData: true });
        }

        /**下一关 */
        private next() {
            if (this.btnRechange.visible) {
                this.sendOver();
            }
            let curLevel: xls.shineTripStage = xls.get(xls.shineTripStage).get(this.dayLevels[this.curTimes]);
            this.btnChange.visible = true;
            this.boxResult.visible = false;
            this.labTalk.text = curLevel.desc;
            this.imgBg.skin = `res/bg/anniversaryShow/${curLevel.id}.png`;
            this.shareFrame.visible = false;
            this.boxTip.visible = true;
            this.closeBtn.visible = true;
        }

        private sendOver() {
            net.send(new pb.cs_second_anniversary_celebration_next());
        }

        private onCloseClick() {
            this.destroy();
            clientCore.ModuleManager.open("anniversary2022.Anniversary2022Module");
        }

        private onOverClick() {
            if (this.btnRechange.visible) {
                this.sendOver();
            }
            this.onCloseClick();
        }

        /**分享 */
        private shareClick() {
            this.btnShare.visible = this.imgTip.visible = false;
            this.shareFrame.labName.text = clientCore.LocalInfo.userInfo.nick;
            this.shareFrame.imgHead.skin = clientCore.LocalInfo.headImgUrl;
            this.shareFrame.btnQQ.visible = this.shareFrame.btnQzone.visible = Laya.Browser.onIOS;
            this.boxTip.visible = false;
            this.labTimes.visible = false;
            this.closeBtn.visible = false;
            this.boxBtn.visible = false;
            this.shareFrame.visible = true;
            clientCore.LayerManager.disableClickEffect();
        }

        private checkCanShare() {
            return clientCore.GlobalConfig.canShare;
        }

        private shareBack() {
            this.boxTip.visible = true;
            this.labTimes.visible = true;
            this.closeBtn.visible = true;
            this.boxBtn.visible = true;
            this.shareFrame.visible = false;
        }

        private async createUI() {
            this.shareFrame.boxShare.visible = false;
            await this.flashScreen();
            //截图
            this._shareImgCanvas = this.equalCanvas(Laya.stage.drawToCanvas(this.imgSize.width, this.imgSize.height, -clientCore.LayerManager.OFFSET, 0));
        }

        private async flashScreen() {
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

        private equalCanvas(canvas: Laya.HTMLCanvas): Laya.HTMLCanvas {
            if (Laya.Browser.onIOS) return canvas;
            let sp: Laya.Sprite = new Laya.Sprite();
            let texture: Laya.Texture = canvas.getTexture();
            sp.graphics.drawTexture(texture);
            sp.scaleY = -1;
            return sp.drawToCanvas(texture.width, texture.height, 0, texture.height);
        }

        private get imgSize(): { width: number, height: number } {
            let _width = 1334;
            let _height = 750;
            if (Laya.Browser.width / Laya.Browser.height < 1.77) {
                _width = Laya.Browser.width;
                _height = 750 * Laya.Browser.width / 1334;
            }
            return { width: _width, height: _height };
        }

        private async goShare(platform: string) {
            await this.createUI();
            let base64 = this._shareImgCanvas.toBase64('image/png', 0.9);
            if (!Laya.Render.isConchApp) {
                SaveFile.saveFile(`share_${platform}.png`, this.base64ToBlob(base64, "png"));
                this.onShareOver();
            }
            else {
                BC.addOnceEvent(this, EventManager, 'ios_share_over', this, this.onShareOver);
                clientCore.NativeMgr.instance.shareImage(base64, platform, 'hengping');
            }
            clientCore.Logger.sendLog('系统', '分享', `分享至${platform}`);
        }

        private onShareOver() {
            this.shareBack();
            if (!this._isReward) {
                net.sendAndWait(new pb.cs_second_anniversary_celebration_share()).then((msg: pb.sc_second_anniversary_celebration_share) => {
                    alert.showReward(msg.item);
                    this._isReward = true;
                    clientCore.MedalManager.setMedal([{ id: MedalConst.ANNIVERSARY_SHOW_SHARE, value: 1 }]);
                });
            }
        }

        private base64ToBlob(urlData, type) {
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

        private showRule() {
            alert.showRuleByID(1242);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnChange, Laya.Event.CLICK, this, this.goChangeCloth);
            BC.addEvent(this, this.btnRechange, Laya.Event.CLICK, this, this.goChangeCloth);
            BC.addEvent(this, this.btnShare, Laya.Event.CLICK, this, this.shareClick);
            BC.addEvent(this, this.btnNext, Laya.Event.CLICK, this, this.next);
            BC.addEvent(this, this.closeBtn, Laya.Event.CLICK, this, this.onCloseClick);
            BC.addEvent(this, this.btnOver, Laya.Event.CLICK, this, this.onOverClick);
            BC.addEvent(this, this.btnRule, Laya.Event.CLICK, this, this.showRule);
            BC.addEvent(this, this.shareFrame.btnQQ, Laya.Event.CLICK, this, this.goShare, ['qq']);
            BC.addEvent(this, this.shareFrame.btnQzone, Laya.Event.CLICK, this, this.goShare, ['qZone']);
            BC.addEvent(this, this.shareFrame.btnWeibo, Laya.Event.CLICK, this, this.goShare, ['sina']);
            BC.addEvent(this, this.shareFrame.btnWeixin, Laya.Event.CLICK, this, this.goShare, ['wechat']);
            BC.addEvent(this, this.shareFrame.btnTimeline, Laya.Event.CLICK, this, this.goShare, ['wechatTimeLine']);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            super.destroy();
            this.person.destroy();
            this.person = null;
            this.dayLevels = null;
            this._shareImgCanvas?.destroy();
            this._flashSp?.destroy();
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