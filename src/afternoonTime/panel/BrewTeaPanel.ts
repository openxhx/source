namespace afternoonTime {
    /**
     * 11.5
     * 主活动感恩午后时光
     * afternoonTime.BrewTeaPanel
     */
    export class BrewTeaPanel extends ui.afternoonTime.panel.BrewTeaPanelUI {
        private week: number;
        private time0: number = util.TimeUtil.formatTimeStrToSec("2021-11-19 00:00:00");
        private time1: number = util.TimeUtil.formatTimeStrToSec("2021-11-26 00:00:00");
        private num: number;
        constructor() {
            super();
            this.sideClose = true;
        }
        init() {
            if (clientCore.ServerManager.curServerTime < this.time0) this.week = 1;
            else if (this.time0 < clientCore.ServerManager.curServerTime && clientCore.ServerManager.curServerTime < this.time1) this.week = 2;
            else this.week = 3;
            this.addPreLoad(xls.load(xls.activityshop));
            this.addPreLoad(this.getInfo());
        }
        onPreloadOver() {

        }

        addEventListeners() {
            BC.addEvent(this, this.btnBrewTea, Laya.Event.CLICK, this, this.onBrewTea);
            BC.addEvent(this, this.imgFlower, Laya.Event.CLICK, this, this.tips);
        }
        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            super.destroy();
        }
        /**提示Tips */
        private tips() {
            let times: number = this.num == 10 ? 10 : this.num + 1
            let config = xls.get(xls.activityshop).get(times);
            clientCore.ToolTip.showTips(this.imgFlower, { id: config.meterial[1].v1 });
        }
        /**获取面板信息并初始化面板 */
        private getInfo() {
            return net.sendAndWait(new pb.cs_thanks_afternoon_info({ week: this.week })).then((data: pb.sc_thanks_afternoon_info) => {
                this.num = data.dailyTea;
                this.labBrewTea.text = `今日剩余烹茶杯数：${10 - data.dailyTea}/10`;
                if (clientCore.ItemsInfo.getItemNum(9900262) < 10) this.labNum0.color = "#fb033e";
                else this.labNum0.color = "#2bfb03";
                this.labNum0.text = `${clientCore.ItemsInfo.getItemNum(9900262)}/10`;
                let times: number = data.dailyTea == 10 ? 10 : data.dailyTea + 1
                let config = xls.get(xls.activityshop).get(times);
                this.labNum1.text = `${clientCore.ItemsInfo.getItemNum(config.meterial[1].v1)}/${config.meterial[1].v2}`;
                if (clientCore.ItemsInfo.getItemNum(config.meterial[1].v1) < config.meterial[1].v2) this.labNum1.color = "#fb033e";
                else this.labNum1.color = "#2bfb03";
                this.imgFlower.skin = clientCore.ItemsInfo.getItemIconUrl(config.meterial[1].v1);
                if (data.dailyTea >= 10) {
                    this.box0.visible = false;
                    this.labSpeak.text = "今天烹制了好多茶呢，休息一下吧~"
                }
                else {
                    this.box0.visible = true;
                    this.labSpeak.text = "你接得花露足够了吗？\n那我们试试烹茶吧！"
                }
            })
        }
        /**煮茶 */
        private onBrewTea() {
            if (this.num < 10) {
                this.mouseEnabled = false;
                net.sendAndWait(new pb.cs_thanks_afternoon_game({ week: this.week, id: this.num + 1 })).then((data: pb.sc_thanks_afternoon_game) => {
                    clientCore.BasketManager.ins._getTeaNum++;
                    alert.showReward(data.item);
                    this.mouseEnabled = true;
                    this.getInfo();
                });
            } else {
                alert.showSmall("明日再来");
            }

        }

    }
}