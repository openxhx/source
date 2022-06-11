namespace odeToJay{

    enum Status{
        NORMAL,
        ANGER_1,
        ANGER_5
    }

    /**
     * 欢乐颂
     * odeToJay.OdeToJayModule
     */
    export class OdeToJayModule extends ui.odeToJay.OdeToJayModuleUI{

        private readonly TALKS: string[] = [
            '你这里还不错的样子嘛',
            '如果我离开太久，莱妮丝会来找我吧',
            '上次的紫萝饼怎么没带来',
            '要我帮忙大扫除？我可是要收费的',
            '这次不准摸我的头……只一下下就原谅你',
            '好了啦！摸太多了！',
            '有个地方能偷懒真是太棒了！'
        ];

        private _model: OdeToJayModel;
        private _control: OdeToJayControl;
        private _bone: clientCore.Bone;

        //面板
        private _perciousPanel: PreciousPanel;
        private _cleanGamePanel: CleanGamePanel;
        private _linkGamePanel: LinkGamePanel;
        private _bossPanel: BossPanel;
        private _exchangePanel: ExchangePanel;

        private _normalFace: number; //兔子的初始表情
        private _normalTalk: number; //兔子的初始话语
        private _clickTimes: number = 0; //点击次数
        private _status: number;
        
        constructor(){ super(); }
        init(data: number): void{
            super.init(data);
            this.sign = clientCore.CManager.regSign(new OdeToJayModel(),new OdeToJayControl());
            this._model = clientCore.CManager.getModel(this.sign) as OdeToJayModel;
            this._control = clientCore.CManager.getControl(this.sign) as OdeToJayControl;
            this.addPreLoad(this._control.checkFrist(this._model));
            this.addPreLoad(this._control.getInfo(this._model));
        }

        destroy(): void{
            Laya.timer.clearAll(this);
            this._bone?.dispose();
            this._bone = null;
            this._linkGamePanel = this._perciousPanel = this._cleanGamePanel = this._bossPanel = this._exchangePanel = null;
            this._model = this._control = null;
            clientCore.CManager.unRegSign(this.sign);
            super.destroy();
        }

        addEventListeners(): void{
            BC.addEvent(this,this.hitArea,Laya.Event.CLICK,this,this.onClick);
            BC.addEvent(this,this.btnBack,Laya.Event.CLICK,this,this.destroy);
            BC.addEvent(this,this.btnRule,Laya.Event.CLICK,this,this.onRule);
            BC.addEvent(this,this.btnClean,Laya.Event.CLICK,this,this.openCleanGame);
            BC.addEvent(this,this.btnLink,Laya.Event.CLICK,this,this.openLinkGame);
            BC.addEvent(this,this.btnBoss,Laya.Event.CLICK,this,this.openBoss);
            BC.addEvent(this,this.btnPrecious,Laya.Event.CLICK,this,this.openPrecious);
            BC.addEvent(this,this.btnGift,Laya.Event.CLICK,this,this.onDaily);
            BC.addEvent(this,this.btnExchange,Laya.Event.CLICK,this,this.openExchange);
        }

        removeEventListeners(): void{
            BC.removeEvent(this);
        }

        onPreloadOver(): void{
            if(this._model.isFristTime){
                clientCore.MedalManager.setMedal([{id: MedalConst.OED_TO_JAY_OPEN,value: 1}]);
                this._normalFace = 3;
            }else{
                let random: number = _.random(0,100);
                this._normalFace = random < 50 ? 3 : (random < 85 ? 2 : 1);
            }
            this._normalTalk = this._normalFace == 1 ? 6 : _.random(0,3);
            this.status = Status.NORMAL;
            this.updateDaily();
            this.checkOpen();
        }

        popupOver(): void{
            clientCore.Logger.sendLog('2021年4月30日活动', '【主活动】欢乐颂', '打开主活动面板');
            if(this._data){
                switch(this._data){
                    case 1:
                        this.openCleanGame();
                        break;
                    case 2:
                        this.openLinkGame();
                        break;
                    case 3:
                        this.openBoss();
                        break;
                }
            }
        }
        
        /**
         * 更新表情
         * @param face 
         */
        private updateFace(face: number): void{
            for(let i:number=1; i<=3; i++){
                this[`img_${i}`].visible = face == i;
            }
        }

        /**
         * 更新说话
         * @param index 
         */
        private updateTalk(index: number): void{
            this.tipsTxt.text = this.TALKS[index];
        }

        private onClick(): void{
            clientCore.Logger.sendLog('2021年4月30日活动', '【主活动】欢乐颂', '点击兔子摩卡的头');
            if(this.status == Status.ANGER_5)return;
            if(this.status == Status.NORMAL) this.status = Status.ANGER_1;
            if(this.status == Status.ANGER_1 && ++this._clickTimes > 5) this.status = Status.ANGER_5;
        }

        private onRule(): void{
            clientCore.Logger.sendLog('2021年4月30日活动', '【主活动】欢乐颂', '点击活动规则');
            alert.showRuleByID(1153);
        }

        private checkOpen(): void{
            this.btnBoss.disabled = this.btnLink.disabled = this.boxLock_1.visible = this.boxLock_2.visible = !this._model.checkOpen();
        }

        private updateDaily(): void{
            this.boxReward.visible = this._model.hasReward;
        }

        /** 每日领奖*/
        private onDaily(): void{
            this._model.hasReward = true;
            this.updateDaily();
            this._control.getDaily();
        }

        /**
         * 打开摩卡的宝藏
         */
        private openPrecious(): void{
            clientCore.Logger.sendLog('2021年4月30日活动', '【主活动】欢乐颂', '点击摩卡的宝藏');
            this._perciousPanel = this._perciousPanel || new PreciousPanel();
            this._perciousPanel.show(this.sign);
        }

        /**
         * 打开清理游戏
         */
        private openCleanGame(): void{
            clientCore.Logger.sendLog('2021年4月30日活动', '【主活动】欢乐颂', '点击劳动节大扫除');
            this._cleanGamePanel = this._cleanGamePanel || new CleanGamePanel();
            this._cleanGamePanel.show(this.sign);
        }

        /**
         * 打开水果连连看
         */
        private openLinkGame(): void{
            clientCore.Logger.sendLog('2021年4月30日活动', '【主活动】欢乐颂', '点击水果连连看');
            this._linkGamePanel = this._linkGamePanel || new LinkGamePanel();
            this._linkGamePanel.show(this.sign);
        }

        /**
         * 打开boss挑战
         */
        private openBoss(): void{
            clientCore.Logger.sendLog('2021年4月30日活动', '【主活动】欢乐颂', '点击莱妮丝的挑战');
            this._bossPanel = this._bossPanel || new BossPanel();
            this._bossPanel.show(this.sign);
        }

        /**
         * 打开兑换
         */
        private openExchange(): void{
            clientCore.Logger.sendLog('2021年4月30日活动', '【主活动】欢乐颂', '点击奖励兑换');
            this._exchangePanel = this._exchangePanel || new ExchangePanel();
            this._exchangePanel.show(this.sign);
        }

        private enterAnger(type: number): void{
            if(type == 1){
                this._status = Status.ANGER_1;
                this._clickTimes = 0;
                this.updateTalk(4);
                this.updateFace(2);
                Laya.timer.once(3000,this,this.enterNormal);
            }else{
                this._status = Status.ANGER_5;
                this.updateTalk(5);
                this.updateFace(3);
                Laya.timer.once(5000,this,this.enterNormal);
            }
        }

        private enterNormal(): void{
            this._status = Status.NORMAL;
            this.updateFace(this._normalFace);
            this.updateTalk(this._normalTalk);
            Laya.timer.once(8000,this,this.showAnimate);
        }

        private set status(value: Status){
            if(this._status == value)return; 
            Laya.timer.clearAll(this);
            switch(value){
                case Status.NORMAL:
                    this.enterNormal();
                    break;
                case Status.ANGER_1:
                    this.enterAnger(1);
                    break;
                case Status.ANGER_5:
                    this.enterAnger(5);
                    break;
            }
        }

        private get status(): Status{
            return this._status;
        }

        private showAnimate(): void{
            if(!this._bone){
                this._bone = clientCore.BoneMgr.ins.play(pathConfig.getActivityAnimate('moka'),0,true,this.spBone);
                this._bone.pos(420,667);
            }
            this.img = false;
            this.ani1.index = 0;
            this.hitArea.mouseEnabled = false;
            BC.addOnceEvent(this,this,Laya.Event.CLICK,this,this.hideAnimate);
        }

        private hideAnimate(): void{
            this.img = true;
            this.hitArea.mouseEnabled = true;
            this.ani1.play(0,false);
        }

        private set img(value: boolean){
            for(let i:number=1; i<4; i++){
                this[`img_${i}`].visible = value;
            }
            this._bone && (this._bone.visible = !value);
        }
    }
}