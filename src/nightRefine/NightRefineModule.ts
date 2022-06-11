namespace nightRefine{
    /**
     * 夜的炼成术
     * nightRefine.NightRefineModule
     */
    export class NightRefineModule extends ui.nightRefine.NightRefineModuleUI{

        private _model: NightRefineModel;
        private _control: NightRefineControl;
        private _t: time.GTime;
        private _selects: number[] = [];

        private _runePanel: RunePanel;
        private _darkMap: DarkMapPanel;
        private _fightPanel: FightPanel;
        private _tips: Tips;

        private _walk: Walk;

        private _role: clientCore.Bone;
        private _waiting: boolean;
        private _isApeHold: boolean;

        constructor(){ super(); }
        init(data: number): void{
            super.init(data);
            this.boxNan.visible = clientCore.LocalInfo.sex == 2;
            this.boxNv.visible = clientCore.LocalInfo.sex == 1;
            this.sign = clientCore.CManager.regSign(new NightRefineModel(), new NightRefineControl());
            this._model = clientCore.CManager.getModel(this.sign) as NightRefineModel;
            this._control = clientCore.CManager.getControl(this.sign) as NightRefineControl;
            this.addPreLoad(this._control.getInfo(this._model));
        }

        onPreloadOver(): void{
            this._t = time.GTimeManager.ins.getTime(globalEvent.TIME_ON, 1000, this, this.onTime);
            this._t.start();
            this.onTime();
            this.initTask();
            this.updateRefineBtn();
            this.updateFight();
            //创建人物
            this._role = clientCore.BoneMgr.ins.play(pathConfig.getActivityAnimate('andrew'), 'walk' ,true, this.down);
            this._role.pos(138,228);
            this._role.stop();
            this._role.once(Laya.Event.START, this, ()=>{ this._role.stop(); })
        }

        popupOver(): void{
            clientCore.Logger.sendLog('2021年6月4日活动', '【主活动】夜与炼成术', '打开主活动面板');
            clientCore.UIManager.setMoneyIds([this._model.ITEM_ID]);
            clientCore.UIManager.showCoinBox();
            this._data && this.openFight();
        }

        addEventListeners(): void{
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.btnRule, Laya.Event.CLICK, this, this.onClick);
            BC.addEvent(this, this.btnTry, Laya.Event.CLICK, this, this.onClick);
            BC.addEvent(this, this.btnBook, Laya.Event.CLICK, this, this.onClick);
            BC.addEvent(this, this.btnReward, Laya.Event.CLICK, this, this.onClick);
            BC.addEvent(this, this.btnFight, Laya.Event.CLICK, this, this.onClick);
            BC.addEvent(this, this.btnRefine, Laya.Event.CLICK, this, this.onClick);
            BC.addEvent(this, this, Laya.Event.CLICK, this, this.walk);
            BC.addEvent(this, EventManager, Constant.UPDATE_FIGHT_TIMES, this, this.updateFight);
            BC.addEvent(this, EventManager, globalEvent.REFINE_TASK_STATE_CHANGE, this, this.updateTask);
            let length: number = this.boxRune.numChildren;
            for(let i: number=0; i<length; i++){
                let item: ui.nightRefine.render.RuneRenderUI = this.boxRune.getChildAt(i) as ui.nightRefine.render.RuneRenderUI;
                BC.addEvent(this, item, Laya.Event.CLICK, this, this.onRune, [i + 1]);
                BC.addEvent(this, item, Laya.Event.MOUSE_DOWN, this, this.onMouseDown, [i + 1]);
            }
        }

        removeEventListeners(): void{
            BC.removeEvent(this);
        }

        destroy(): void{
            Laya.timer.clear(this, this.onHold);
            clientCore.UIManager.releaseCoinBox();
            clientCore.CManager.unRegSign(this.sign);
            this._control = this._model = null;
            this._t?.dispose();
            this._t = null;
            this._selects.length = 0;
            this._selects = null;
            this._runePanel = null;
            this._darkMap = null;
            this._fightPanel = null;
            this._walk?.dispose();
            this._walk = null;
            this._role?.dispose();
            this._role = null;
            this._tips?.dispose();
            this._tips = null;
            super.destroy();
        }

        private onTime(): void{
            let dtime: number = clientCore.ServerManager.curServerTime - this._model.gettime;
            let count: number = Math.min(Math.floor(dtime / 3600) * 5, 50);
            this.ani1.index = count > 0 ? 1 : 0;
            count > 0 ? this.txNum.changeText(`x${count}`) : this.txTime.changeText(util.StringUtils.getTime(3600 - dtime, '{min}:{sec}') + '后可领取');
        }

        private initTask(): void{
            _.forEach(this._model.tasks, (element: pb.ITask)=>{
                let index: number = element.taskid - this._model.BASE_TASK;
                let item: ui.nightRefine.render.RuneRenderUI = this.boxRune.getChildAt(index - 1) as ui.nightRefine.render.RuneRenderUI;
                item.imgIco.skin = `nightRefine/${index}.png`;
                item.ani1.index = 0;
                this.updateItem(index, element.state == clientCore.TASK_STATE.REWARDED ? 1 : (element.state == clientCore.TASK_STATE.COMPLETE ? 2 : 0));
            })
        }

        /**
         * 更新状态
         * @param index 
         * @param value 0-未解锁 1-解锁 2-可解锁
         */
        private updateItem(index: number,value: number): void{
            let item: ui.nightRefine.render.RuneRenderUI = this.boxRune.getChildAt(index - 1) as ui.nightRefine.render.RuneRenderUI;
            item.imgIco.gray = value != 1;
            if(value == 2){
                item.ani1.play(0, true);
            }else{
                item.ani1.stop();
                item.ani1.index = 0;
            }
            item.imgSel.skin = 'nightRefine/weixuanzhong.png';
        }

        private selectItem(index: number): void{
            let item: ui.nightRefine.render.RuneRenderUI = this.boxRune.getChildAt(index - 1) as ui.nightRefine.render.RuneRenderUI;
            let isSel: boolean = item.imgSel.skin == 'nightRefine/xuanzhong.png';
            item.imgSel.skin = isSel ? 'nightRefine/weixuanzhong.png' : 'nightRefine/xuanzhong.png';
            this._selects[index - 1] = !isSel ? index : null;
            this.updateRefineBtn();
        }
        
        /** 更新战斗奖励*/
        private updateFight(): void{
            this.ani2.index = 0;
            this._model.fighttimes < 3 && this.ani2.play(0, false);
        }

        private onClick(e: Laya.Event): void{
            switch(e.currentTarget){
                case this.btnRule:
                    alert.showRuleByID(this._model.RULE_ID);
                    break;
                case this.btnTry:
                    alert.showCloth(this._model.SUIT_ID);
                    break;
                case this.btnRefine: //炼制
                    if(this._waiting){
                        alert.showFWords('正在炼制中哦');
                        return;
                    }
                    let array: number[] = _.compact(this._selects);
                    if(array.length <= 0)return;
                    if(!clientCore.ItemsInfo.checkItemsEnough([{itemID: this._model.ITEM_ID, itemNum: array.length * 25}])){
                        alert.showFWords('道具数量不足');
                        return;
                    }
                    this._waiting = true;
                    this._control.refine(array, new Laya.Handler(this, (msg: pb.sc_night_and_alchemy_refining)=>{
                        _.forEach(array, (element: number)=>{ this.selectItem(element); })
                        if(!msg){
                            this._waiting = false;
                            return;
                        }
                        this.refineResult(msg.type == 1 ? 'success' : 'fail', ()=>{ 
                            this._waiting = false;
                            alert.showReward(msg.items);
                        });
                    }));
                    break;
                case this.btnBook: //图鉴
                    clientCore.Logger.sendLog('2021年6月4日活动', '【主活动】夜与炼成术', '点击黑暗图鉴按钮');
                    this._darkMap = this._darkMap || new DarkMapPanel();
                    this._darkMap.show(this.sign);
                    break;
                case this.btnReward:
                    if(this.ani1.index == 0)return;
                    this._control.getReward(this._model, new Laya.Handler(this, ()=>{
                        let element: pb.ITask = this._model.getTask(this._model.BASE_TASK + 4);
                        this.updateItem(4, element.state == clientCore.TASK_STATE.REWARDED ? 1 : (element.state == clientCore.TASK_STATE.COMPLETE ? 2 : 0));
                    }));
                    break;
                case this.btnFight:
                    this.openFight();
                    break;
            }
        }

        /**
         * 符文选择
         * @param index 
         */
        private onRune(index: number): void{
            this._model.checkStatus(index) == clientCore.TASK_STATE.REWARDED ? this.selectItem(index) : this.openRune(index);
        }

        private onMouseDown(index: number): void{
            if(this._model.checkStatus(index) == clientCore.TASK_STATE.REWARDED){
                BC.addEvent(this, Laya.stage, Laya.Event.MOUSE_UP, this, this.onApeRelease);
                Laya.timer.once(1000, this, this.onHold, [index]);
            }
        }

        private onHold(index: number): void{
            let id: number = this._model.BASE_TASK + index;
            let cfg: xls.taskData = xls.get(xls.taskData).get(id);
            this._isApeHold = true;
            this._tips = this._tips || new Tips();
            this._tips.show({
                parent: this,
                x: this.mouseX,
                y: this.mouseY,
                name: cfg.task_title,
                desc: cfg.task_content,
                path: `nightRefine/${index}.png`
            });
        }

        private onApeRelease(): void{
            if(this._isApeHold){
                this._isApeHold = false;
                this._tips.removeSelf();
            }else{
                Laya.timer.clear(this, this.onHold);
            }
            BC.removeEvent(this, Laya.stage, Laya.Event.MOUSE_UP, this, this.onApeRelease);
        }

        private updateTask(id: number): void{
            let idx: number = id - this._model.BASE_TASK;
            this.updateItem(idx,1);
        }

        /** 更新炼制按钮显示*/
        private updateRefineBtn(): void{
            let len: number = _.compact(this._selects).length;
            this.btnRefine.visible = len > 1;
            this.txCount.changeText(len * 25 + '');
        }

        private openRune(index: number): void{
            this._runePanel = this._runePanel || new RunePanel();
            this._runePanel.show(this._model.BASE_TASK + index, this.sign);
        }

        /** 打开战斗*/
        private openFight(): void{
            clientCore.Logger.sendLog('2021年6月4日活动', '【主活动】夜与炼成术', '点击通缉小兔子狸藻按钮');
            this._fightPanel = this._fightPanel || new FightPanel();
            this._fightPanel.show(this.sign);
        }

        private walk(): void{
            let ret: number = this.hit();
            this._role.play('walk', true);
            this._walk = this._walk || new Walk(this._role, this.up, this.down);
            this._walk.start([this.mouseX - 212,this.mouseY - 381], new Laya.Handler(this, ()=>{
                if(ret == -1){
                    this._role.stop();
                }else{
                    this._role.play('magic', false, new Laya.Handler(this, ()=>{ this._role.stop(); }));
                }
            }));
        }

        private hit(): number{
            for(let i:number=0; i<6; i++){
                let item: ui.nightRefine.render.RuneRenderUI = this.boxRune.getChildAt(i) as ui.nightRefine.render.RuneRenderUI;
                if(item.hitTestPoint(Laya.stage.mouseX, Laya.stage.mouseY) && !item.imgIco.gray) return i;
            }
            return -1;
        }

        /**
         * 炼制结果
         * @param type  success | fail
         */
        private refineResult(type: string, callFunc: Function): void{
            let bone: clientCore.Bone = clientCore.BoneMgr.ins.play(pathConfig.getActivityAnimate('luzi'), type, false, this.imglz);
            bone.pos(92, 180);
            bone.once(Laya.Event.COMPLETE, this, callFunc);
        }
    }
}