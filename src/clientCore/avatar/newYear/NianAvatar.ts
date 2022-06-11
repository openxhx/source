namespace clientCore{
    /**
     * 年兽
     */
    export class NianAvatar extends Avatar{
        private _expeling: boolean = false;
        private _ui: ui.commonNewYear.NianUI;
        private _bone: Bone;
        constructor(){ super(); }
        init(data: any): void{
            super.init(data);
            this._bone = BoneMgr.ins.play(pathConfig.getActivityAnimate('nian'),'idle',true,this._display,null,true);
            this.addEvents();
            this.updateView();
        }
        dispose(): void{
            this.removeEvents();
            this._bone?.dispose();
            this._bone = null;
            super.dispose();
        }
        private addEvents(): void{
            BC.addEvent(this,this._bone,Laya.Event.CLICK,this,this.onClick);
        }
        private removeEvents(): void{
            BC.removeEvent(this);
        }

        private onClick(): void{
            if(this._ui == null){
                this._ui = new ui.commonNewYear.NianUI();
                this._ui.pos(26,-218);
                BC.addEvent(this,this._ui.btnExpel,Laya.Event.CLICK,this,this.onExpel);
            }
            if(this._ui.parent){
                this._ui.removeSelf();
            }else{
                this.updateView();
                this._display.addChild(this._ui);
            }
        }

        /** 驱逐年兽*/
        private onExpel(): void{
            clientCore.Logger.sendLog('2021年2月8日活动', '【主活动】迎福纳彩贺新春', '点击驱逐年兽按钮');
            if(this._expeling)return;
            this._expeling = true;
            let count: number = Math.min(clientCore.ItemsInfo.getItemNum(1511031),10);
            net.sendAndWait(new pb.cs_common_activity_draw({moduleId: 241,times: count})).then((msg: pb.sc_common_activity_draw)=>{
                this.updateView();
                this.showEffects(count,msg.item);
            }).catch(()=>{
                this._expeling = false;
            });
        }

        private showEffects(cnt: number,items: pb.IdrawReward[]): void{
            // 放鞭炮
            core.SoundManager.instance.playSound(pathConfig.getSoundUrl('bomb'));
            for(let i:number=0; i<cnt; i++){
                let bone: Bone = BoneMgr.ins.play(pathConfig.getActivityAnimate('crarker'),0,false,this._display);
                bone.pos(_.random(-186,86),_.random(-260,-100));
            }
            // 年兽动作
            this._bone.play(`hurt${cnt > 5 ? 2 : 1}`,false,new Laya.Handler(this,()=>{
                this._bone.play('idle',true); 
                this._expeling = false;
                items && items.length > 0 && this.parseRewards(items);
            }));
        }
    
        private parseRewards(msg: pb.IdrawReward[]): void{
            alert.showReward(clientCore.GoodsInfo.createArray(_.map(msg,(element: pb.IdrawReward)=>{
                 let cfg: xls.godTree = xls.get(xls.godTree).get(element.id);
                 let reward: xls.pair = clientCore.LocalInfo.sex == 1 ? cfg.item : cfg.itemMale;
                 return reward;
            }),true));
        }

        private updateView(): void{
            if(!this._ui)return;
            let has: number = clientCore.ItemsInfo.getItemNum(1511031);
            this._ui.numTxt.changeText(`${Math.min(has,10)}/${has}`);
            this._ui.btnExpel.disabled = has == 0;
        }
    }
}