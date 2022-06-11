namespace anniversaryRank {
    /**
     * 眠花祈福排行榜
     * anniversaryRank.AnniversaryRankModule
     * 策划案：\\newfiles\Taomee\B01互动游戏事业部\18-风信子项目部\102、策划讨论案--大家直接看\0205\【付费】人鱼之恋20210205_Inory
     */
    export class AnniversaryRankModule extends ui.anniversaryRank.AnniversaryRankModuleUI {
        private _t: time.GTime;
        private readonly RANK_ID: number = 20;
        constructor() { super(); }
        init(): void {
            this.progressBar.imgBg.height = 494;
            this.list.vScrollBarSkin = '';
            this.list.renderHandler = new Laya.Handler(this, this.listRender, null, false);
            this.addPreLoad(clientCore.RankManager.ins.getSrvRank(this.RANK_ID).then((ranks: clientCore.RankInfo[]) => {
                this.list.array = ranks;
            }))
            this.addPreLoad(clientCore.RankManager.ins.getUserRank(this.RANK_ID, clientCore.LocalInfo.uid).then((rank: clientCore.RankInfo) => {
                let ranking: number = rank.msg.ranking;
                this.rankTxt.changeText(`${ranking == 0 ? '默默无闻' : ranking}`);
            }))
        }
        onPreloadOver(): void {
            let cfg: xls.rankInfo = xls.get(xls.rankInfo).get(this.RANK_ID);
            let closeTime: number = util.TimeUtil.formatTimeStrToSec(cfg.closeTime);
            if (clientCore.ServerManager.curServerTime < closeTime) {
                this._t = time.GTimeManager.ins.getTime(globalEvent.TIME_ON, 1000, this, this.onTime, [closeTime]);
                this._t.start();
            } else {
                this.timeTxt.changeText('已截榜');
            }
            this.ani1.index = 0;
            Laya.timer.once(5000, this, this.updateChoice);
        }
        addEventListeners(): void {
            BC.addEvent(this, this.list.scrollBar, Laya.Event.CHANGE, this, this.onScrollBarChange);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.btnTry, Laya.Event.CLICK, this, this.onTry);
            for (let i: number = 1; i <= 3; i++) {
                BC.addEvent(this, this['btn_' + i], Laya.Event.CLICK, this, this.updateChoice, [i - 1]);
            }
        }
        removeEventListeners(): void {
            BC.removeEvent(this);
        }
        private onTime(closeTime: number): void {
            let dt: number = closeTime - clientCore.ServerManager.curServerTime;
            if (dt <= 0) {
                this.timeTxt.changeText('已截榜');
                this._t.dispose();
                this._t = null;
                return;
            }
            this.timeTxt.changeText(util.StringUtils.getDateStr2(dt, '{hour}:{min}:{sec}'));
        }
        destroy(): void {
            Laya.timer.clear(this, this.updateChoice);
            this._t?.dispose();
            this._t = null;
            super.destroy();
        }
        private listRender(item: ui.mermaidRank.render.RankItemUI, index: number): void {
            let info: clientCore.RankInfo = this.list.array[index];
            let isTop3: boolean = info.msg.ranking < 4;
            item.imgRank.visible = isTop3;
            item.rankTxt.visible = !isTop3;
            if (isTop3)
                item.imgRank.skin = `anniversaryRank/top${info.msg.ranking}.png`;
            else
                item.rankTxt.changeText('' + info.msg.ranking);
            item.nameTxt.changeText(info.userName);
            // item.familyTxt.changeText(info.familyName);
            item.scoreTxt.changeText('' + info.msg.score);
        }
        private updateChoice(index?: number): void {
            Laya.timer.clear(this, this.updateChoice);
            let current: number = this.ani1.index;
            let next: number = index != void 0 ? index : (current == 2 ? 0 : current + 1);
            this.ani1.index = next;
            Laya.timer.once(5000, this, this.updateChoice);
        }
        private onTry(): void {
            clientCore.ModuleManager.open('previewBG.PreviewBGModule', { id: [1200012, 1100061], condition: '眠花祈福排行榜前十' });
        }
        private onScrollBarChange(): void {
            let scrollBar: Laya.ScrollBar = this.list.scrollBar;
            if (scrollBar.max == 0) return;
            this.progressBar.imgValue.y = 420 * scrollBar.value / scrollBar.max;
        }
    }
}