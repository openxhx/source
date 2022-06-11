namespace loveMagic{
    /**
     * 爱的魔法
     * loveMagic.LoveMagicModule
     */
    export class LoveMagicModule extends ui.loveMagic.LoveMagicModuleUI{

        private readonly TALK_1: string[] = [
            '……那个锅里是什么？',
            '今天真是个郊游的好日子。',
            '锅子里传来奇怪的味道……',
            '这些气球是你准备的吗？'
        ];
        private readonly TALK_2: string[] = [
            '总之，交给我就好了。',
            '…………',
            '请不要在意。',
            '嗯…………'
        ]

        private _model: LoveMagicModel;
        private _control: LoveMagicControl;
        private _glowFilter: Laya.GlowFilter = new Laya.GlowFilter('ffff00',10,0,0);
        private _bubbleGamePanel: GameBubblePanel;
        private _collectGamePanel: GamePanel;
        private _makePanel: MakePanel;
        private _bone: clientCore.Bone;

        init(data: number): void{
            super.init(data);
            this.imgNan.visible = clientCore.LocalInfo.sex == 2;
            this.imgNv.visible = clientCore.LocalInfo.sex == 1;
            this.sign = clientCore.CManager.regSign(new LoveMagicModel(),new LoveMagicControl());
            this._model = clientCore.CManager.getModel(this.sign) as LoveMagicModel;
            this._control = clientCore.CManager.getControl(this.sign) as LoveMagicControl;
            //展示对话
            this.showTalk(_.random(0,3));
            //显示服装
            _.filter(xls.get(xls.commonAward).getValues(),(element: xls.commonAward)=>{ return element.type == this._model.ACTIVITY_ID; })
            .forEach((element: xls.commonAward)=>{ this.createItem(element); })
            //进度更新
            this.updateProgress();
            this.updateDisplay();
            this.updateTitle();
            //拉取信息
            this.addPreLoad(this._control.checkFirst(this._model));
            this.addPreLoad(this._control.getInfo(this._model));
            this.addPreLoad(xls.load(xls.eventExchange));
            //代币信息
            clientCore.UIManager.setMoneyIds([this._model.ACTIVITY_ITEM_ID]);
            clientCore.UIManager.showCoinBox();
            //动画
            this._bone = clientCore.BoneMgr.ins.play(pathConfig.getActivityAnimate('cook'),0,true,this.spAni);
            this._bone.pos(1215,596);
        }
        destroy(): void{
            this._bone?.dispose();
            this._bone = null;
            clientCore.UIManager.releaseCoinBox();
            Laya.timer.clearAll(this);
            this._glowFilter = null;
            this._model = this._control = null;
            this._bubbleGamePanel = null;
            this._collectGamePanel = null;
            this._makePanel = null;
            clientCore.CManager.unRegSign(this.sign);
            super.destroy();
        }
        addEventListeners(): void{
            BC.addEvent(this,this.btnRule,Laya.Event.CLICK,this,this.onRule);
            BC.addEvent(this,this.btnBack,Laya.Event.CLICK,this,this.destroy);
            BC.addEvent(this,this.btnTry,Laya.Event.CLICK,this,this.onTry);
            BC.addEvent(this,this.btnGet,Laya.Event.CLICK,this,this.onTitle);
            BC.addEvent(this,this.btnBubble,Laya.Event.CLICK,this,this.openBubbleGame);
            BC.addEvent(this,this.btnCollect,Laya.Event.CLICK,this,this.openCollectGame);
            BC.addEvent(this,this.btnMake,Laya.Event.CLICK,this,this.openMake);
            BC.addEvent(this,EventManager,globalEvent.ITEM_BAG_CHANGE,this,this.updateView);
        }
        removeEventListeners(): void{
            BC.removeEvent(this);
        }
        popupOver(): void{
            this._data && this._data == 1 && this.openCollectGame();
            if(this._model.isFirst){
                clientCore.MedalManager.setMedal([{id: MedalConst.LOVEMAGIC_OPEN,value: 1}]);
                clientCore.AnimateMovieManager.showAnimateMovie(80516,null,null);
            }
            clientCore.Logger.sendLog('2021年4月9日活动', '【主活动】爱的魔法', '打开活动主面板');
        }
        private showTalk(index: number): void{
            for(let i:number = 1; i<3; i++){
                this['talk_' + i].text = this['TALK_' + i][index];
            }
            this.ani1.play(0,false);
            this.ani1.once(Laya.Event.COMPLETE,this,()=>{ Laya.timer.once(5000,this,this.hideTalk); });
        }

        private hideTalk(): void{
            this.ani1.index = 0;
            Laya.timer.once(10000,this,this.showTalk,[_.random(0,3)]);
        }

        private createItem(cfg: xls.commonAward): void{
            let item: ui.loveMagic.item.RewardItemUI = new ui.loveMagic.item.RewardItemUI();
            item.name = cfg.id + '';
            //数据更新
            this.updateItem(item,cfg);
            //显示数量
            let fontSp: Laya.Sprite = new Laya.Sprite();
            util.showTexWord(fontSp,'loveMagic',cfg.num.v2 + '',-20);
            fontSp.pivotX = fontSp.width/2;
            fontSp.pos(item.width/2 - 10,item.height);
            item.addChild(fontSp);
            //加入模块
            item.pos(1258 * cfg.num.v2 / 100 + 9,16);
            this.panel.addChild(item);
        }

        private updateItem(item: ui.loveMagic.item.RewardItemUI, cfg: xls.commonAward): void{
            let reward: xls.pair = clientCore.LocalInfo.sex == 1 ? cfg.femaleAward[0] : cfg.maleAward[0];
            let hasCloth: boolean = clientCore.LocalInfo.checkHaveCloth(reward.v1);
            let canGet: boolean = !hasCloth && clientCore.ItemsInfo.checkItemsEnough([{itemID: cfg.num.v1,itemNum: cfg.num.v2}]);
            item.imgHas.visible = hasCloth
            item.imgTips.visible = canGet;
            item.imgBg.filters = canGet ? [this._glowFilter] : [];
            item.imgIco.skin = clientCore.ItemsInfo.getItemIconUrl(reward.v1);
            BC.removeEvent(this,item,Laya.Event.CLICK,this,this.onReward);
            canGet && BC.addEvent(this,item,Laya.Event.CLICK,this,this.onReward,[cfg.id]);
        }

        /** 进度更新*/
        private updateProgress(): void{
            let hasCnt: number = clientCore.ItemsInfo.getItemNum(this._model.ACTIVITY_ITEM_ID);
            this.imgBar.width = Math.min(hasCnt,100)/100 * 1260;
        }

        private updateView(): void{
            this.updateTitle();
            this.updateDisplay();
            this.updateProgress();
            let hasCnt: number = clientCore.ItemsInfo.getItemNum(this._model.ACTIVITY_ITEM_ID);
            let array: xls.commonAward[] = _.filter(xls.get(xls.commonAward).getValues(),(element: xls.commonAward)=>{ return element.type == this._model.ACTIVITY_ID; });
            let len: number = array.length;
            for(let i: number=0; i<len; i++){
                let element: xls.commonAward = array[i];
                if(element.num.v2 > hasCnt)return;
                this.updateItem(this.panel.getChildByName(element.id+'') as ui.loveMagic.item.RewardItemUI,element);
            }
        }

        /**
         * 领取奖励
         * @param id 
         */
        private onReward(id: number): void{
            let cfg: xls.commonAward = xls.get(xls.commonAward).get(id);
            let reward: xls.pair = clientCore.LocalInfo.sex == 1 ? cfg.femaleAward[0] : cfg.maleAward[0];
            let item: ui.loveMagic.item.RewardItemUI = this.panel.getChildByName(id + '') as ui.loveMagic.item.RewardItemUI;
            let hasCloth: boolean = clientCore.LocalInfo.checkHaveCloth(reward.v1);
            let canGet: boolean = !hasCloth && clientCore.ItemsInfo.checkItemsEnough([{itemID: cfg.num.v1,itemNum: cfg.num.v2}]);
            if(!canGet)return;
            this._control?.getCloth(id - 341,cfg.id,new Laya.Handler(this,()=>{ this.updateItem(item,cfg); }));
        }

        /**
         * 打开吹泡泡游戏
         */
        private openBubbleGame(): void{
            clientCore.Logger.sendLog('2021年4月9日活动', '【主活动】爱的魔法', '点击吹气球按钮');
            this._bubbleGamePanel = this._bubbleGamePanel || new GameBubblePanel();
            this._bubbleGamePanel.show(this.sign);
        }

        /** 打开甜点收集游戏*/
        private openCollectGame(): void{
            clientCore.Logger.sendLog('2021年4月9日活动', '【主活动】爱的魔法', '点击收集甜点按钮');
            this._collectGamePanel = this._collectGamePanel || new GamePanel();
            this._collectGamePanel.show(this.sign);
        }

        /** 打开就餐*/
        private openMake(): void{
            clientCore.Logger.sendLog('2021年4月9日活动', '【主活动】爱的魔法', '点击制作餐点按钮');
            this._makePanel = this._makePanel || new MakePanel();
            this._makePanel.show(this.sign);
        }
        
        /** 服装试穿*/
        private onTry(): void{
            alert.showCloth(2110331);
        }

        private onRule(): void{
            alert.showRuleByID(1147);
        }

        private updateTitle(): void{
            let hasTitle: boolean = clientCore.TitleManager.ins.checkHaveTitle(this._model.ACTIVITY_TITLE_ID);
            this.btnGet.visible = !hasTitle;
            this.imgHas.visible = hasTitle;
            if(!hasTitle){
                let cnt: number = clientCore.ItemsInfo.getItemNum(this._model.ACTIVITY_ITEM_ID);
                this.btnGet.disabled = cnt < 100;
            }
        }

        private onTitle(): void{
            this._control?.getTitle(new Laya.Handler(this,this.updateTitle));
        }

        private updateDisplay(): void{
            let cnt: number = clientCore.ItemsInfo.getItemNum(this._model.ACTIVITY_ITEM_ID);
            for(let i:number=1; i<6; i++){
                this.setVisible('balloon',i,false);
                i < 4 && this.setVisible('dessert',i,false);
            }
            if(cnt >= 20){
                this.setVisible('balloon',1,true);
            }
            if(cnt >= 30){
                this.setVisible('dessert',1,true);
            }
            if(cnt >= 40){
                this.setVisible('balloon',2,true);
            }
            if(cnt >= 60){
                this.setVisible('balloon',3,true);
                this.setVisible('dessert',2,true);
            }
            if(cnt >= 80){
                this.setVisible('balloon',4,true);
            }
            if(cnt >= 100){
                this.setVisible('balloon',5,true);
                this.setVisible('dessert',3,true);
            }
        }

        private setVisible(name: string,index: number,value: boolean): void{
            this[`${name}_${index}_0`].visible = !value;
            this[`${name}_${index}_1`].visible = value;
        }
    }
}