namespace loginAds {
    /**
     * 登录强弹
     * loginAds.LoginAdsModule
     * 参数传 ads表中的id
     */
    export class LoginAdsModule extends ui.loginAds.LoginAdsModuleUI {
        private _xlsInfo: xls.ads;
        private _notShow: boolean;
        private _channel: Laya.SoundChannel;
        init(d: any) {
            super.init(d);
            this.sideClose = true;
            this.isMod = true;
            this.addPreLoad(xls.load(xls.ads));
            this.addPreLoad(xls.load(xls.characterVoice));
            this.addPreLoad(clientCore.MedalManager.getMedal([MedalDailyConst.LOGIN_ADS_NOT_SHOW]).then((v) => {
                this._notShow = v[0].value == 1;
            }))
        }

        onPreloadOver() {
            this._xlsInfo = xls.get(xls.ads).get(this._data);
            this.showView(this._xlsInfo);
            this.imgGou.visible = this._notShow;
        }

        private showView(info: xls.ads) {
            switch (info.type) {
                case 0:
                    let panel0 = new ui.loginAds.panel.AdsFirstPanelUI();
                    panel0.mouseThrough = true;
                    panel0.img.skin = `res/vipAds/alertAds/1_${clientCore.LocalInfo.sex}.png`;
                    panel0.imgRwd.skin = `loginAds/rwd_${clientCore.LocalInfo.sex}.png`
                    this.addChildAt(panel0, 0);
                    BC.addEvent(this, panel0.btn, Laya.Event.CLICK, this, this.onShowDetailClick);
                    break;
                case 1:
                    let panel1 = new ui.loginAds.panel.AdsChargePanelUI();
                    panel1.txtPrice.value = info.cost + '元';
                    panel1.mouseThrough = true;
                    let url1 = info.sex ? `${info.id}_${clientCore.LocalInfo.sex}` : info.id;
                    panel1.img.skin = `res/vipAds/alertAds/${url1}.png`;
                    this.addChildAt(panel1, 0);
                    panel1.btnDes.visible = info.suitsId > 0;
                    BC.addEvent(this, panel1.btnDes, Laya.Event.CLICK, this, this.onShowSuitLClick);
                    BC.addEvent(this, panel1.btn, Laya.Event.CLICK, this, this.onShowDetailClick);
                    break;
                case 2:
                    let panel2 = new ui.loginAds.panel.AdsVipPanelUI();
                    panel2.txtVip.value = info.description.replace('VIP', '');
                    panel2.mouseThrough = true;
                    let url = info.suitsId ? `${info.id}_${clientCore.LocalInfo.sex}` : info.id;
                    panel2.img.skin = `res/vipAds/alertAds/${url}.png`;
                    panel2.boxDetail.visible = info.suitsId != 0;
                    if (info.suitsId != 0) {
                        panel2.imgTitle.skin = `res/vipAds/alertAds/${info.id}_title.png`;
                    }
                    this.addChildAt(panel2, 0);
                    panel2.btnVoice.visible = info.voiceId > 0;
                    BC.addEvent(this, panel2.btnDetail, Laya.Event.CLICK, this, this.onShowSuitLClick);
                    BC.addEvent(this, panel2.btnVoice, Laya.Event.CLICK, this, this.onPlayVoice);
                    BC.addEvent(this, panel2.btn, Laya.Event.CLICK, this, this.onShowDetailClick);
                    break;
                case 3:
                    let panel3 = new ui.loginAds.panel.AdsPetPanelUI();
                    let petStr = info.id == 2 ? '奇妙花宝' : '闪耀花宝';
                    panel3.imgDes.skin = `loginAds/${petStr}文字.png`;
                    panel3.imgPet.skin = `loginAds/${petStr}.png`;
                    panel3.mouseThrough = true;
                    this.addChildAt(panel3, 0);
                    BC.addEvent(this, panel3.btn, Laya.Event.CLICK, this, this.onShowDetailClick);
                    break;
                case 4:
                    let panel4 = new ui.loginAds.panel.AdHllnPanelUI();
                    panel4.imgNan.visible = clientCore.LocalInfo.sex == 2;
                    panel4.imgNv.visible = clientCore.LocalInfo.sex == 1;
                    BC.addEvent(this, panel4.btnGo, Laya.Event.CLICK, this, this.jumpAnniversary);
                    BC.addEvent(this, panel4.imgNan, Laya.Event.CLICK, this, this.destroy);
                    BC.addEvent(this, panel4.imgNv, Laya.Event.CLICK, this, this.destroy);
                    this.addChildAt(panel4, 0);
                    this.setAnniversary(panel4);
                    break;
                default:
                    break;
            }
        }

        private jumpAnniversary() {
            clientCore.ModuleManager.closeAllOpenModule();
            clientCore.ModuleManager.open("anniversary.AnniversaryModule");
        }

        private async setAnniversary(panel: ui.loginAds.panel.AdHllnPanelUI) {
            net.sendAndWait(new pb.cs_year_of_flower_love_stream_top_cloud_get_info()).then((msg: pb.sc_year_of_flower_love_stream_top_cloud_get_info) => {
                let curOff = 10;
                if (msg.oneDiscount > 0) {
                    curOff = 1;
                } else if (msg.threeDiscount > 0) {
                    curOff = 3;
                } else if (msg.fiveDiscount > 0) {
                    curOff = 5;
                } else if (msg.sevenDiscount > 0) {
                    curOff = 7;
                } else if (msg.nineDiscount > 0) {
                    curOff = 9;
                }
                panel.imgZhe.visible = curOff > 1;
                panel.imgNoOff.visible = curOff == 10;
                if (curOff < 10) {
                    panel.imgOff.skin = "loginAds/" + curOff + ".png";
                } else {
                    panel.imgOff.visible = false;
                }
                panel.labPrice.text = (640 * curOff / 10).toString();
                let start = this.checkYyzdSell();
                if (start < 0) start = 0;
                panel.imgOnSell.visible = start <= 0;
                panel.labTime.text = (`${util.StringUtils.getDateStr2(start, '{hour}:{min}:{sec}')}`);
                if (start > 0 && !this._t) {
                    this._t = time.GTimeManager.ins.getTime(globalEvent.TIME_ON, 1000, this, this.onTime, [panel]);
                    this._t.start();
                }
            });
        }
        private _t: time.GTime;
        /**检查套装是否开卖 */
        private checkYyzdSell() {
            let endT: number = util.TimeUtil.formatTimeStrToSec("2020/8/7 18:00:00");
            return endT - clientCore.ServerManager.curServerTime;
        }

        /**秒级刷新 */
        private onTime(panel: ui.loginAds.panel.AdHllnPanelUI) {
            if (this.checkYyzdSell() > 0) {
                panel.labTime.text = (`${util.StringUtils.getDateStr2(this.checkYyzdSell(), '{hour}:{min}:{sec}')}`);
            } else {
                this._t.dispose();
                panel.labTime.text = "00:00:00";
                panel.imgOnSell.visible = true;
            }
        }

        private onPlayVoice() {
            if (this._xlsInfo.voiceId) {
                let info = xls.get(xls.characterVoice).get(this._xlsInfo.voiceId);
                if (info) {
                    this._channel?.stop();
                    this._channel = core.SoundManager.instance.playSound(`res/sound/role/${info.characterId}/${info.oggId}.ogg`, 1);
                }
            }
        }

        private onNotShowClick() {
            this.imgGou.visible = !this.imgGou.visible;
            clientCore.MedalManager.setMedal([{ id: MedalDailyConst.LOGIN_ADS_NOT_SHOW, value: this.imgGou.visible ? 1 : 0 }]);
        }

        private onShowSuitLClick() {
            clientCore.ModuleManager.open('rewardDetail.PreviewModule', this._xlsInfo.suitsId);
        }

        private onShowDetailClick() {
            let goId = parseInt(this._xlsInfo.channelType[0].split('/')[1]);
            clientCore.ToolTip.gotoMod(goId);
        }

        addEventListeners() {
            BC.addEvent(this, this.boxNotShow, Laya.Event.CLICK, this, this.onNotShowClick);
        }

        removeEventListeners() {
            BC.removeEvent(this);
            this._channel?.stop();
        }

        destroy(): void {
            this._t?.dispose();
            // this.checkQcs();
            // EventManager.event();
            EventManager.event(globalEvent.CHECK_NEXT_ADS);
            super.destroy();
        }

        private async checkQcs(): Promise<void> {
            if (!channel.ChannelControl.ins.isOfficial) {
                EventManager.event(globalEvent.CHECK_NEXT_ADS);
                return;
            }
            if (!clientCore.GlobalConfig.isFristQcs && this._xlsInfo && (this._xlsInfo.type == 0 || this._xlsInfo.type == 1 || this._xlsInfo.type == 4)) {
                clientCore.GlobalConfig.isFristQcs = true;
                let show: pb.ICommonData[] = await clientCore.MedalManager.getMedal([MedalDailyConst.QCS_ALERT_DAILY]);
                // show[0].value == 0 && clientCore.ModuleManager.open('loginAds.LoginQcsModule');
                if (show[0].value == 0) {
                    clientCore.ModuleManager.open('loginAds.LoginQcsModule');
                } else {
                    EventManager.event(globalEvent.CHECK_NEXT_ADS);
                }
            } else {
                EventManager.event(globalEvent.CHECK_NEXT_ADS);
            }
        }
    }
}