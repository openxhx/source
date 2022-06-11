namespace afternoonTime {
    /**
     * 11.26
     * 主活动感恩午后时光
     * afternoonTime.MakeCookPanel
     */
    export class MakeCookPanel extends ui.afternoonTime.panel.MakeCookPanelUI {
        private week: number;
        private time0: number = util.TimeUtil.formatTimeStrToSec("2021-11-19 00:00:00");
        private time1: number = util.TimeUtil.formatTimeStrToSec("2021-11-26 00:00:00");
        private msgInfo: any;
        private aniMakeCook: clientCore.Bone;
        constructor() {
            super();
            this.sideClose = true;
        }

        init() {
            if (clientCore.ServerManager.curServerTime < this.time0) this.week = 1;
            else if (this.time0 < clientCore.ServerManager.curServerTime && clientCore.ServerManager.curServerTime < this.time1) this.week = 2;
            else this.week = 3;
            this.addPreLoad(this.getInfo());
            clientCore.UIManager.setMoneyIds([9900267]);
            clientCore.UIManager.showCoinBox();
        }

        onPreloadOver() {
            this.updataLab();
        }

        addEventListeners() {
            BC.addEvent(this, this.btnMake, Laya.Event.CLICK, this, this.onMake);
            BC.addEvent(this, this.btnTip0, Laya.Event.CLICK, this, this.showTips, [0, 9900265]);
            BC.addEvent(this, this.btnTip1, Laya.Event.CLICK, this, this.showTips, [1, 730007]);
            BC.addEvent(this, this.btnTip2, Laya.Event.CLICK, this, this.showTips, [2, 9900266]);

        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            this.aniMakeCook?.dispose();
            this.aniMakeCook = null;
            this.msgInfo = null;
            clientCore.UIManager.releaseCoinBox();
            super.destroy();
        }

        private getInfo() {
            return net.sendAndWait(new pb.cs_thanks_afternoon_info({ week: this.week })).then((data: pb.sc_thanks_afternoon_info) => {
                this.msgInfo = data;
            });
        }

        /**物品提示 */
        private showTips(num: number, id: number) {
            clientCore.ToolTip.showTips(this['btnTip' + num], { id: id });
        }
        /**点击制作 */
        private onMake() {
            if (this.msgInfo.dailycookie < 10) {
                let cost: xls.pair[] = [{ v1: 9900265, v2: 20 }, { v1: 9900266, v2: 10 }, { v1: 730007, v2: 1 }];
                let data = _.filter(cost, (v) => {
                    return v.v2 > clientCore.ItemsInfo.getItemNum(v.v1);
                });
                if (data.length > 0) {
                    for (let i = 0; i < data.length; i++) {
                        if (data[i].v1 == 730007) {
                            alert.mtrNotEnough([{ v1: 730007, v2: 1 }], Laya.Handler.create(this, this.getCook));
                        } else {
                            alert.showFWords(clientCore.ItemsInfo.getItemName(data[i].v1) + "不足~");
                            return;
                        }
                    }

                } else {
                    this.getCook();
                }
            }
            else {
                alert.showSmall("今日制作已达上限！");
            }
        }
        private getCook() {
            this.sideClose = false;
            this.mouseEnabled = false;
            this.imgNPC.visible = false;
            this.labSpeak.visible = false;
            net.sendAndWait(new pb.cs_thanks_afternoon_make_cookie()).then((data: pb.sc_thanks_afternoon_make_cookie) => {
                this.aniMakeCook = clientCore.BoneMgr.ins.play("res/animate/afternoonTime/luna.sk", 0, false, this.aniNPC);
                this.aniMakeCook.once(Laya.Event.COMPLETE, this, () => {
                    this.labSpeak.visible = true;
                    this.imgNPC.visible = true;
                    this.msgInfo.dailycookie++;
                    this.updataLab();
                    alert.showReward(data.item);
                    this.sideClose = true;
                    this.mouseEnabled = true;
                    this.aniMakeCook?.dispose();
                });
            });
        }
        /**文字显示 */
        private updataLab() {
            this.labSpeak.text = `给我这些材料，我们就能制作饼干咯~今日已制作：${this.msgInfo.dailycookie}/10次`;
            this.labNum0.text = `${clientCore.ItemsInfo.getItemNum(9900265)}/20`;
            this.labNum1.text = `${clientCore.ItemsInfo.getItemNum(730007)}/1`;
            this.labNum2.text = `${clientCore.ItemsInfo.getItemNum(9900266)}/10`;
            if (clientCore.ItemsInfo.getItemNum(9900265) >= 20) { this.labNum0.color = "#5ffd06"; }
            else { this.labNum0.color = "#f56a6a"; }
            if (clientCore.ItemsInfo.getItemNum(730007) >= 1) { this.labNum1.color = "#5ffd06"; }
            else { this.labNum1.color = "#f56a6a"; }
            if (clientCore.ItemsInfo.getItemNum(9900266) >= 10) { this.labNum2.color = "#5ffd06"; }
            else { this.labNum2.color = "#f56a6a"; }
        }

    }
}