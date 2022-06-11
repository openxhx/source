namespace meteorShower {
    /**
     * 一起来看流星雨
     * meteorShower.MeteorShowerModule
     * 策划案：\\10.1.1.98\incoming\B01互动游戏事业部\18-风信子项目部\102、策划讨论案--大家直接看\1127\一起去看流星雨_connie.xlsx
     */
    export class MeteorShowerModule extends ui.meteorShower.MeteorShowModuleUI {
        private _model: MeteorShowerModel;
        private _control: MeteorShowerControl;
        private _exchangePanel: ExchangePanel;
        private _convertPanel: ConvertPanel;
        constructor() { super(); }
        init(): void {
            this.sign = clientCore.CManager.regSign(new MeteorShowerModel(), new MeteorShowerControl());
            this._model = clientCore.CManager.getModel(this.sign) as MeteorShowerModel;
            this._control = clientCore.CManager.getControl(this.sign) as MeteorShowerControl;
            this.ani1.gotoAndStop(0);
            this.imgNan.visible = clientCore.LocalInfo.sex == 2;
            this.imgNv.visible = clientCore.LocalInfo.sex == 1;
            this.initHtmlTxt();
            this.initRank();
            this.addPreLoad(Promise.all([
                this._control.getInfo(this.sign),
                this._control.getSvrRank(this.sign),
                this._control.getMyRank(this.sign)
            ]));
            this.onAwardStateChange();
        }

        private onAwardStateChange() {
            this.imgAward.visible = clientCore.LimitActivityMgr.checkCanExchangeByType(99);
        }

        addEventListeners(): void {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.btnEx, Laya.Event.CLICK, this, this.onChange);
            BC.addEvent(this, this.btnConvert, Laya.Event.CLICK, this, this.onConvert);
            BC.addEvent(this, this.btnTry, Laya.Event.CLICK, this, this.onTry);
            BC.addEvent(this, this.btnGame, Laya.Event.CLICK, this, this.onGame);
            BC.addEvent(this, this.btnRule, Laya.Event.CLICK, this, this.onRule);
            BC.addEvent(this, this.list.scrollBar, Laya.Event.CHANGE, this, this.onScrollChange);
            BC.addEvent(this, EventManager, globalEvent.ITEM_BAG_CHANGE, this, this.onUpdateItem);
            BC.addEvent(this, EventManager, globalEvent.HAVE_COMMONAWARD_TO_GET, this, this.onAwardStateChange);
            BC.addEvent(this, EventManager, Constant.UPDATE_CONVERT_COUNT, this, this.onUpdateConvert);
            for (let i: number = 1; i < 5; i++) {
                BC.addEvent(this, this['reward_' + i], Laya.Event.CLICK, this, this.onReward, [i]);
            }
        }
        removeEventListeners(): void {
            BC.removeEvent(this);
        }
        destroy(): void {
            clientCore.CManager.unRegSign(this.sign);
            this._model = this._control = this._exchangePanel = this._convertPanel = null;
            super.destroy();
        }
        onPreloadOver(): void {
            this.onUpdateItem();
            this.onUpdateConvert();
            this.htmlGt.innerHTML = util.StringUtils.getColorText3(`{${this._model.msg.gameGain}}/${clientCore.FlowerPetInfo.petType > 0 ? 150 : 100}`, '#ffffff', '#fffc00');
            //排行榜赋值
            this.list.array = this._model.ranks;
            this.setRankInfo(this.myRankView, this._model.myRank);
        }
        popupOver(): void {
            clientCore.Logger.sendLog('2020年11月27日活动', '【主活动】一起来看流星雨', '打开活动面板');
            this.ani1.play(0, false);
        }
        private initRank(): void {
            this.list.vScrollBarSkin = '';
            this.list.renderHandler = new Laya.Handler(this, this.itemRender, null, false);
        }
        private itemRender(item: ui.meteorShower.render.RankItemUI, index: number): void {
            this.setRankInfo(item, this.list.array[index]);
        }
        private setRankInfo(item: ui.meteorShower.render.RankItemUI, data: clientCore.RankInfo): void {
            let rank: number = data.msg.ranking;
            let top3: boolean = rank > 0 && rank < 4;
            item.rankImg.visible = top3;
            item.rankTxt.visible = !top3;
            item.nameTxt.changeText(data.userName);
            item.sourceTxt.changeText(data.msg.score + '');
            if (top3) {
                item.rankImg.skin = `meteorShower/top${rank}.png`;
            } else {
                item.rankTxt.changeText(rank == 0 ? '未上榜' : rank + '');
            }
        }
        private initHtmlTxt(): void {
            this.htmlEx.style.fontSize = 20;
            this.htmlGt.style.fontSize = 20;
        }
        private onUpdateConvert(): void {
            this.htmlEx.innerHTML = util.StringUtils.getColorText3(`{${this._model.msg.exchangeGain}}/50`, '#ffffff', '#fffc00');
        }
        /** 打开兑换界面*/
        private onChange(): void {
            this._exchangePanel = this._exchangePanel || new ExchangePanel();
            this._exchangePanel.show(this.sign);
        }

        /** 打开交换界面*/
        private onConvert(): void {
            this._convertPanel = this._convertPanel || new ConvertPanel();
            this._convertPanel.show(this.sign);
        }

        /** 前往小游戏*/
        private onGame(): void {
            this.destroy();
            clientCore.ModuleManager.open('meteorShowerGame.MeteorShowerGameModule', 3208001);
        }

        /** 奖励*/
        private onReward(index: number): void {
            let rewards: number[] = [9900104, 134873, 109934, 9900001];
            clientCore.ToolTip.showTips(this['reward_' + index], { id: rewards[index - 1] });
        }

        private onRule(): void {
            clientCore.Logger.sendLog('2020年11月27日活动', '【主活动】一起来看流星雨', '点击查看规则');
            alert.showRuleByID(1109);
        }

        private onTry(): void {
            clientCore.Logger.sendLog('2020年11月27日活动', '【主活动】一起来看流星雨', '试穿套装');
            clientCore.ModuleManager.open("rewardDetail.PreviewModule", 2110199);
        }

        private onUpdateItem(): void {
            this.numTxt.changeText(`${clientCore.ItemsInfo.getItemNum(9900103)}`);
        }

        private onScrollChange(): void {
            let scroll: Laya.ScrollBar = this.list.scrollBar;
            if (scroll.max == 0) return;
            this.scrollImg.y = 234 + scroll.value / scroll.max * 270;
        }
    }
}