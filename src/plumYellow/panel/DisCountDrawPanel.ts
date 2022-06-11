namespace plumYellow {

    export class DiscountDrawData {
        public stage :number;
        public suitId:number;
        public giftArr:number[];
        public ruleId:number;
        public time:string;
        public price:number;
        public index:number

        constructor(stage: number , suitId:number , giftArr:number[] , ruleId:number ,price:number, index:number , time:string) {
            this.stage = stage;
            this.suitId = suitId;
            this.giftArr = giftArr;
            this.ruleId = ruleId;
            this.price = price;
            this.index = index;
            this.time = time;
        }
    }

    const DISCOUNT_STRING = [
        'yuan_jia',
        'wu_zhe',
        'qi_zhe',
        'jiu_zhe',
        'yi_zhe'
    ];
    /**
     * 碧玉妆成-彼岸浮灯
     */
    export class DisCountDrawPanel extends ui.plumYellow.panel.DisCountDrawPanelUI {

        private _rotating: boolean = false;
        private currPrice: number = 0;
        private refreshTimes: number = 0;
        private coin: number = 9900334;
        private cfg:DiscountDrawData;
        private DISCOUNT_PRICE420 = [
            420,
            210,
            294,
            378,
            42
        ];
    
         private DISCOUNT_PRICE450 = [
            450,
            225,
            315,
            405,
            45
        ];

        constructor(date:DiscountDrawData) {
            super();
            this.cfg = date;
            this.addEventListeners();
            this.initView();
        }

        async show(box: any) {
            clientCore.UIManager.setMoneyIds([this.coin , 0]);
            clientCore.UIManager.showCoinBox();
            if(this.cfg.stage == 1){
                clientCore.Logger.sendLog('2022年5月27日活动', '【付费】梅子黄时', '打开夏转年年面板');
            }else{
                clientCore.Logger.sendLog('2022年5月20日活动', '【付费】梅子黄时', '打开夏转年年-晚节气小满面板');
            }
            await net.sendAndWait(new pb.cs_star_sakura({ activeId: PlumYellowModel.instance.activityId, stage: this.cfg.index })).then((data: pb.sc_star_sakura) => {
                this.currPrice = data.num;
                this.refreshTimes = data.times;
                let toId = this["DISCOUNT_PRICE" + this.cfg.price].indexOf(data.num);
                this.btnTurn.rotation = (toId * 72)%360;
            })
            this.updateView();
            EventManager.event(CHANGE_TIME, this.cfg.time);
            box.addChild(this);
        }

        hide() {
            clientCore.UIManager.releaseCoinBox();
            this.removeSelf();
        }

        initView(){
            this.giftName.skin = `plumYellow/DisCountDrawPanel/gift_name${this.cfg.stage}.png`;
            this.gift.skin = `plumYellow/DisCountDrawPanel/gift${this.cfg.stage}.png`;
            this.suitName.skin = `plumYellow/DisCountDrawPanel/suit_name${this.cfg.stage}.png`;
            this.di.skin = `plumYellow/DisCountDrawPanel/di${this.cfg.stage}.png`;
            this.btnTurn1.skin = `plumYellow/DisCountDrawPanel/zhuan_lun${this.cfg.stage}.png`;
            this.imgSuit.skin = `res/rechargeCloth/${this.cfg.suitId}_${clientCore.LocalInfo.sex}.png`;
            this.price.skin = `plumYellow/DisCountDrawPanel/di_${this.cfg.price}.png`;
            if(this.cfg.stage == 1){
                this.di1.skin = `plumYellow/DisCountDrawPanel/di_xz1.png`;
                this.di2.skin = `plumYellow/DisCountDrawPanel/di_xz0.png`;
                this.btnTry0.y = 414;
            }else{
                this.di1.skin = `plumYellow/DisCountDrawPanel/di_xz0.png`;
                this.di2.skin = `plumYellow/DisCountDrawPanel/di_xz1.png`;
                this.btnTry0.y = 466;
            }
            this.tab2.visible = false;
        }

        private updateView() {
            this.labCost.text = this.currPrice.toString();
            let discountIdx = this["DISCOUNT_PRICE" + this.cfg.price].indexOf(this.currPrice);
            this.imgFirst.visible = this.refreshTimes == 0;
            this.imgCost.visible = this.boxBuy.visible = this.refreshTimes > 0;
            this.btnTurn.disabled = this.btnTurn1.disabled = this.imgGot.visible = clientCore.ItemsInfo.getItemNum(this.cfg.suitId)>0;
            this.boxBuy.visible = !this.imgGot.visible;
        }

        private onBuy() {
            if (this._rotating)
                return;
            if (this.imgGot.visible) {
                this.boxBuy.visible = false;
                return;
            }
            let beanNum = clientCore.ItemsInfo.getItemNum(this.coin);
            if (beanNum < this.currPrice) {
                alert.showSmall(`所需${clientCore.ItemsInfo.getItemName(this.coin)}不足,是否前往补充?`, { callBack: { funArr: [() => { PlumYellowModel.instance.openCoinGiftBuy() }], caller: this } });
            }
            else {
                alert.showSmall(`是否花费${this.currPrice}${clientCore.ItemsInfo.getItemName(this.coin)}购买吗?`, { callBack: { caller: this, funArr: [this.sureBuy] } });
            }
        }

        private sureBuy() {
            clientCore.LoadingManager.showSmall();
            net.sendAndWait(new pb.cs_star_sakura_buy_clothes({ activeId: PlumYellowModel.instance.activityId, stage: this.cfg.index })).then((data: pb.sc_star_sakura_buy_clothes) => {
                clientCore.LoadingManager.hideSmall(true);
                alert.showReward(data.items);
                PlumYellowModel.instance.coinCost(this.currPrice);
                this.updateView();
            }).catch(() => {
                clientCore.LoadingManager.hideSmall(true);
            })
        }

        private onSuit(i: number) {
            if (i == 0) {
                clientCore.ModuleManager.open('rewardDetail.PreviewModule', this.cfg.suitId);
            } 
        }

        private onTurn() {
            if (this._rotating)
                return;
            if (this.refreshTimes == 0) {
                this.startTurn();
            }
            else {
                let beanNum = clientCore.ItemsInfo.getItemNum(this.coin);
                if (beanNum < 10) {
                    alert.showSmall(`所需${clientCore.ItemsInfo.getItemName(this.coin)}不足,是否前往补充?`, { callBack: { funArr: [() => { PlumYellowModel.instance.openCoinGiftBuy() }], caller: this } });
                }
                else {
                    alert.showSmall(`确定要花费10个${clientCore.ItemsInfo.getItemName(this.coin)}来刷新一次折扣吗？`, { callBack: { caller: this, funArr: [this.startTurn] } });
                }
            }
        }

        private startTurn() {
            this._rotating = true;
            net.sendAndWait(new pb.cs_refresh_star_sakura({ activeId: PlumYellowModel.instance.activityId, stage: this.cfg.index })).then((data: pb.sc_refresh_star_sakura) => {
                let toId = this["DISCOUNT_PRICE" + this.cfg.price].indexOf(data.num);
                if (toId == -1) {
                    console.error('返回的价格错误!!');
                    return;
                }
                let cur = this["DISCOUNT_PRICE" + this.cfg.price].indexOf(this.currPrice);
                this.currPrice = data.num;
                if (this.refreshTimes > 0) PlumYellowModel.instance.coinCost(10);
                this.refreshTimes += 1;
                this.btnTurn.disabled = true;
                this.btnTurn1.disabled = true;
                //this.showTurnAni(cur, toId, 10);
                this.btnTurn.rotation = this.btnTurn.rotation % 360;
                let angle = toId * 72 + _.random(5, 8, false) * 360;
                Laya.Tween.to(this.btnTurn, { rotation: angle }, angle / 360 * 300, Laya.Ease.cubicInOut, new Laya.Handler(this, () => {
                    this._rotating = false;
                    this.btnTurn.disabled = false;
                    this.btnTurn1.disabled = false;
                    this.updateView();
                }));
            })
        }

        private async showTurnAni(start: number, target: number, time: number) {
            while (true) {
                await util.TimeUtil.awaitTime(time);
                if (time >= 300 && (Math.abs(target - start) <= 3 || target + 5 - start <= 3)) {
                    time = 400;
                } else {
                    time += 10;
                }
                this['zhe_' + start].skin = `PlumYellowModel/DisCountDrawPanel/${DISCOUNT_STRING[start]}0.png`;
                this['di' + start].skin = `PlumYellowModel/DisCountDrawPanel/di0.png`;
                start++;
                start = start % 5;
                this['zhe_' + start].skin = `PlumYellowModel/DisCountDrawPanel/${DISCOUNT_STRING[start]}1.png`;
                this['di' + start].skin = `PlumYellowModel/DisCountDrawPanel/di1.png`;
                if (time == 400 && start == target) {
                    this._rotating = false;
                    this.btnTurn.disabled = false;
                    this.btnTurn1.disabled = false;
                    this.updateView();
                    return;
                }
            }
        }

        private onDetail() {
            alert.showRuleByID(this.cfg.ruleId);
        }

        private openOther(i:number) {
            if(i == this.cfg.stage){
                return;
            }
             EventManager.event(CHANGE_PANEL, subpanel["discountDraw" + i]);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnBuy, Laya.Event.CLICK, this, this.onBuy);
            BC.addEvent(this, this.btnTry0, Laya.Event.CLICK, this, this.onSuit , [0]);
            BC.addEvent(this, this.btnTurn, Laya.Event.CLICK, this, this.onTurn);
            BC.addEvent(this, this.btnTurn1, Laya.Event.CLICK, this, this.onTurn);
            BC.addEvent(this, this.btnRule, Laya.Event.CLICK, this, this.onDetail);
            BC.addEvent(this, this.tab1, Laya.Event.CLICK, this, this.openOther , [1]);
            BC.addEvent(this, this.tab2, Laya.Event.CLICK, this, this.openOther , [2]);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            this.removeEventListeners();
            super.destroy();
        }
    }
}