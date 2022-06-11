namespace earthPercious{
    /**
     * 银河图鉴·碧星的宝藏
     * earthPercious.EarthPerciousModule
     * 策划案：\\newfiles\Taomee\B01互动游戏事业部\18-风信子项目部\102、策划讨论案--大家直接看\0312\【主活动】碧星的宝藏.xlsx
     */
    export class EarthPerciousModule extends ui.earthPercious.EarthPerciousModuleUI{
        private _model: EarthPerciousModel;
        private _control: EarthPerciousControl;
        init(): void{
            this.list.renderHandler = new Laya.Handler(this,this.listRender,null,false);
            this.list.mouseHandler = new Laya.Handler(this,this.listMouse,null,false);
            this.sign = clientCore.CManager.regSign(new EarthPerciousModel(),new EarthPerciousControl());
            this._model = clientCore.CManager.getModel(this.sign) as EarthPerciousModel;
            this._control = clientCore.CManager.getControl(this.sign) as EarthPerciousControl;
            this.addPreLoad(this._control.getInfo());
        }
        destroy(): void{
            this._model = this._control = null;
            clientCore.CManager.unRegSign(this.sign);
            clientCore.UIManager.releaseCoinBox();
            super.destroy();
        }
        addEventListeners(): void{
            BC.addEvent(this,this.btnHome,Laya.Event.CLICK,this,this.onClick);
            BC.addEvent(this,this.btnRule,Laya.Event.CLICK,this,this.onClick);
            BC.addEvent(this,this.btnSeach,Laya.Event.CLICK,this,this.onClick);
            BC.addEvent(this,this.btnEarth,Laya.Event.CLICK,this,this.onClick);
            BC.addEvent(this,this.btnCultivate,Laya.Event.CLICK,this,this.onClick);
        }
        removeEventListeners(): void{
            BC.removeEvent(this);
        }
        onPreloadOver(): void{
            clientCore.Logger.sendLog('2021年3月12日活动', '【主活动】碧星的宝藏', '打开活动面板');
            let info: {level: number,current: number,target: number} = clientCore.EarthPerciousMgr.getInfo();
            this.imgPlant.skin = `res/earthPercious/plant/${info.level}.png`;
            this.levelTxt.changeText(`x${clientCore.EarthPerciousMgr.level}`);
            
            if(info.target != 0){
                this.progressTxt.changeText(`${info.current}/${info.target}`);
                this.imgBar.width = info.current / info.target * 217;
            }else{
                this.progressTxt.changeText('最高阶');
                this.imgBar.width = 217;
            }
            
            this.boxReward.visible = info.level < 6;
            if(this.boxReward.visible){
                let cfg: xls.commonAward = _.filter(xls.get(xls.commonAward).getValues(),(element: xls.commonAward)=>{ return element.type == 128; })[info.level];
                this.list.array = clientCore.LocalInfo.sex == 1 ? cfg.femaleAward : cfg.maleAward;
            }
            //展示剧情
            this.showPlot();
            //代币显示
            clientCore.UIManager.setMoneyIds([clientCore.EarthPerciousMgr.ITEM_ID]);
            clientCore.UIManager.showCoinBox();
        }

        private onClick(e: Laya.Event): void{
            switch(e.currentTarget){
                case this.btnHome:
                    this.destroy();
                    break;
                case this.btnRule:
                    clientCore.Logger.sendLog('2021年3月12日活动', '【主活动】碧星的宝藏', '打开规则面板');
                    alert.showRuleByID(1133);
                    break;
                case this.btnSeach:
                    clientCore.Logger.sendLog('2021年3月12日活动', '【主活动】碧星的宝藏', '打开探索日志面板');
                    clientCore.ToolTip.gotoMod(244,"3");
                    break;
                case this.btnEarth:
                    clientCore.Logger.sendLog('2021年3月12日活动', '【主活动】碧星的宝藏', '打开星球全景面板');
                    clientCore.ToolTip.gotoMod(244,"4");
                    break;
                case this.btnCultivate:
                    clientCore.Logger.sendLog('2021年3月12日活动', '【主活动】碧星的宝藏', '打开培育弹窗');
                    clientCore.ToolTip.gotoMod(244,"1");
                    break;
            }
        }

        private listRender(item: ui.commonUI.item.RewardItemUI,index: number): void{
            let data: xls.pair = this.list.array[index];
            clientCore.GlobalConfig.setRewardUI(item,{id: data.v1,cnt: data.v2,showName: false});
        }

        private listMouse(e: Laya.Event,index: number): void{
            if(e.type != Laya.Event.CLICK)return;
            let data: xls.pair = this.list.array[index];
            clientCore.ToolTip.showTips(e.target,{id: data.v1});
        }

        private showPlot(): void{
            clientCore.MedalManager.getMedal([MedalConst.EARTH_PERCIOUS_OPEN]).then((data: pb.ICommonData[])=>{
                if(data[0].value == 0){
                    let dialog: PlotPanel = new PlotPanel();
                    dialog.show();
                    clientCore.MedalManager.setMedal([{id: MedalConst.EARTH_PERCIOUS_OPEN,value: 1}]);
                }
            });
        }
    }
}