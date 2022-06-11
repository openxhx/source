namespace onePanda {
    /**
     * 排行榜
     * 人手一只大熊猫
     * onePanda.OnePandaModule
     * 2021.9.26
     */



    const ITEM_ID: number = 9900339;
    const TOTAL_IDS = [[604828, 604829, 604830], [604831, 604832, 604833]];
    export const RANK_ID = 38;
    export const ACTIVITY_ID = 241;
    export class OnePandaModule extends ui.onePanda.OnePandaModuleUI {
        private suitId: number = 2110665;
        private ruleId: number = 1045;
        private _bubbleArr: ui.onePanda.renders.OnePandaItemRenderUI[];
        private _rankList: clientCore.RankInfo[] = [];
        private _selfRank: clientCore.RankInfo;
        private _timeInfo: pb.sc_cavel_dream_panel;
        private _buyPanel: OnePandaBuyPanel;

        init(d: any) {
            super.init(d);
            this.addPreLoad(xls.load(xls.commonAward));
            this.addPreLoad(xls.load(xls.eventExchange));
            this.addPreLoad(net.sendAndWait(new pb.cs_cavel_dream_panel()).then((data: pb.sc_cavel_dream_panel) => {
                this._timeInfo = data;
            }))
            this.addPreLoad(clientCore.RankManager.ins.getSrvRank(RANK_ID).then((data) => {
                this._rankList = data;
            }));
            this.addPreLoad(clientCore.RankManager.ins.getUserRank(RANK_ID, clientCore.LocalInfo.uid).then((data) => {
                this._selfRank = data;
            }));
            this.listRank.renderHandler = new Laya.Handler(this, this.listRender);
            this.listRank.mouseHandler = new Laya.Handler(this, this.listMouse);
            clientCore.UIManager.setMoneyIds([clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID]);
            clientCore.UIManager.showCoinBox();
        }

        onPreloadOver() {
            this.initView()
            this.createBubble();
            this.updateView();
            clientCore.Logger.sendLog('2022年6月2日活动', '【付费】罗浮爱恋排行榜', '打开罗浮爱恋排行榜面板');
        }

        addEventListeners() {
            BC.addEvent(this, this.btnTry, Laya.Event.CLICK, this, this.onTry , [0]);
            BC.addEvent(this, this.btnTry1, Laya.Event.CLICK, this, this.onTry , [1]);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.btnDetail, Laya.Event.CLICK, this, this.onRule);
            BC.addEvent(this, this.boxEye, Laya.Event.CLICK, this, this.onGetAll);
            BC.addEvent(this, this.btnRank, Laya.Event.CLICK, this, this.onRank);
            BC.addEvent(this, EventManager, globalEvent.ITEM_BAG_CHANGE, this, this.updateView);
            BC.addEvent(this, this.btnGo, Laya.Event.CLICK, this, this.onGetDream);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            super.destroy();
            clientCore.UIManager.releaseCoinBox();
        }
        /**试装 */
        private onTry(i:number) {
            if(i== 0){
                clientCore.ModuleManager.open('rewardDetail.PreviewModule', this.suitId);
            }else{
                clientCore.ModuleManager.open('previewBG.PreviewBGModule', { id: [1100138 , 1000197], condition: '' });
            }
        }

        /**规则 */
        private onRule() {
            alert.showRuleByID(this.ruleId);
        }
        /**排行榜go */
        private onRank() {
            this.destroy();
            clientCore.ModuleManager.open('onePanda.OnePandaRankModule', null, { openWhenClose: 'onePanda.OnePandaModule' });
        }
        /**领取美瞳 */
        private onGetAll() {
            net.sendAndWait(new pb.cs_cavel_dream_get_extra_reward()).then((data: pb.sc_cavel_dream_get_extra_reward) => {
                alert.showReward(data.item);
                this.updateView();
                util.RedPoint.reqRedPointRefresh(21402);
            })
        }

        /**初始化画面*/
        private initView() {
            this.imgCollect.skin = clientCore.LocalInfo.sex == 1 ? 'onePanda/nv_mei_tong.png' : 'onePanda/nan_mei_tong.png';
            this.imgSuit.skin = `unpack/onePanda/${this.suitId}_${clientCore.LocalInfo.sex}.png`;
            //this.txtMyNick.text = clientCore.LocalInfo.userInfo.nick;
            //this.imgHead.skin = clientCore.LocalInfo.headImgUrl;
            this.listRank.visible = this._rankList.length > 0;
            this.listRank.array = this._rankList.slice(0, 3);
            this.txtMyRank.text = this._selfRank?.msg?.ranking == 0 ? '默默无闻' : this._selfRank?.msg?.ranking.toString();
        }

        /**创建 */
        private createBubble() {
            this._bubbleArr = [];
            let xlsArr = _.filter(xls.get(xls.commonAward).getValues(), o => o.type == ACTIVITY_ID);
            let num = this.boxContain.numChildren;
            for (let i = 0; i < num; i++) {
                let xlsInfo = xlsArr[i];
                let bubble = new ui.onePanda.renders.OnePandaItemRenderUI();
                let ori = this.boxContain.getChildAt(i) as Laya.Sprite;
                ori.visible = false;
                bubble.pos(ori.x, ori.y);
                bubble.dataSource = {
                    id: xlsInfo[clientCore.LocalInfo.sex == 1 ? 'femaleAward' : 'maleAward'][0].v1,
                    need: xlsInfo.num.v2
                };
                bubble.txtNum.text = bubble.dataSource.need;
                bubble.imgIcon.skin = clientCore.ItemsInfo.getItemIconUrl(bubble.dataSource.id);
                BC.addEvent(this, bubble, Laya.Event.CLICK, this, this.onBubbleClick, [i + 1, xlsInfo.id, bubble.dataSource.id]);
                this.boxContain.addChild(bubble);
                this._bubbleArr.push(bubble);
            }
        }

        /**点击领取 */
        private onBubbleClick(pos: number, idx: number) {
            let myDreamNum: number = clientCore.ItemsInfo.getItemNum(ITEM_ID);
            let data: { id: number, need: number } = this._bubbleArr[pos - 1].dataSource;
            let haveCloth = clientCore.LocalInfo.checkHaveCloth(data.id);
            let canGet = myDreamNum >= data.need;
            if (!canGet || haveCloth) {
                clientCore.ToolTip.showTips(this._bubbleArr[pos - 1], { id: data.id });
            }
            else {
                net.sendAndWait(new pb.cs_cavel_dream_get_reward({ idx: idx, pos: pos })).then((data: pb.sc_cavel_dream_get_reward) => {
                    alert.showReward(data.item);
                    this.updateView();
                    util.RedPoint.reqRedPointRefresh(21401)
                })
            }
        }

        /**刷新状态 */
        private updateView() {
            let myDreamNum: number = clientCore.ItemsInfo.getItemNum(ITEM_ID);
            //道具
            this.numTxt.text = myDreamNum.toString();

            //UI
            for (let i = 0; i < this._bubbleArr.length; i++) {
                const bubble = this._bubbleArr[i];
                let data: { id: number, need: number } = bubble.dataSource;
                let haveCloth = clientCore.LocalInfo.checkHaveCloth(data.id);
                let canGet = myDreamNum >= data.need;
                bubble.imgGet.visible = haveCloth;
                bubble.imgClick.visible = canGet && !haveCloth;
                bubble.filters = (!bubble.imgGet.visible && !bubble.imgClick.visible) ? util.DisplayUtil.darkFilter : [];
            }
            let nextIdx = _.findIndex(this._bubbleArr, o => o.filters?.length);
            if (nextIdx > -1) {
                this._bubbleArr[nextIdx].filters = [];
            }
            //集齐奖励
            let totalNum = _.sumBy(this._bubbleArr, o => clientCore.LocalInfo.checkHaveCloth(o.dataSource.id) ? 1 : 0);
            totalNum = Math.min(totalNum, 12);
            let totalIdArr = TOTAL_IDS[clientCore.LocalInfo.sex - 1]
            let haveGetTotalRwd = _.sumBy(totalIdArr, id => clientCore.LocalInfo.checkHaveCloth(id) ? 1 : 0) == totalIdArr.length;
            this.txtCollect.text = totalNum + '/' + 10;
            this.boxEye.mouseEnabled = totalNum >= 10;
            this.btnGetAll.skin = totalNum >= 10 ? 'onePanda/allgw1.png' : 'onePanda/allgw2.png'
            this.btnGetAll.visible = !haveGetTotalRwd;
        }

        /**显示前三 */
        private listRender(cell: ui.onePanda.renders.OnePandaRenderUI, idx: number) {
            let data = cell.dataSource as clientCore.RankInfo;
            let rank = data.msg as pb.IRankInfo;
            cell.txtNick.text = rank.userBase.nick;
            cell.txtScore.text = rank.score.toString();
            cell.imgRank.skin = `onePanda/top${rank.ranking}.png`;
            cell.imgHead.skin = clientCore.ItemsInfo.getItemIconUrl(rank.userBase.headImage);
        }


        private listMouse(e: Laya.Event, idx: number) {
            if (e.type == Laya.Event.CLICK) {
                clientCore.UserInfoTip.showTips(this.listRank.getCell(idx), this.listRank.getItem(idx).msg.userBase);
            }
        }

        /**点击获得竹子 */
        private onGetDream() {
            this._buyPanel = this._buyPanel || new OnePandaBuyPanel();
            this._buyPanel.show(this._timeInfo);
        }
    }
}