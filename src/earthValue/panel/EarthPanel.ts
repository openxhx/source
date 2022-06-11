namespace earthValue{
    /**
     * 星球全景
     */
    export class EarthPanel extends ui.earthValue.panel.EarthPanelUI{

        private readonly FRAME_ID: number = 2500035;
        private _timeLine: Laya.TimeLine;

        constructor(){ super(); }

        onEnable(): void{
            this.addEvents();
            this.propTxt.changeText(clientCore.EarthPerciousMgr.step + '');
            this.imgEarth.skin = `res/earthPercious/earth/${this.getState()}.png`;
            this._timeLine = new Laya.TimeLine();
            this._timeLine.to(this.imgEarth,{rotation: 360},8000);
            this._timeLine.play(0,true);
            this.updateView();
        }

        onDisable(): void{
            this._timeLine?.destroy();
            this._timeLine = null;
            this.removeEvents();
        }

        private addEvents(): void{
            BC.addEvent(this,this.btnClose,Laya.Event.CLICK,this,this.dispose);
            BC.addEvent(this,this.btnReward,Laya.Event.CLICK,this,this.onReward);
        }

        private removeEvents(): void{
            BC.removeEvent(this);
        }

        private dispose(): void{
            clientCore.ToolTip.gotoMod(243);
        }

        private getState(): number{
            let prop: number = clientCore.EarthPerciousMgr.step;
            if(prop < 10) return 1;
            if(prop < 30) return 2;
            if(prop < 50) return 3;
            if(prop < 80) return 4;
            return 5;
        }

        private updateView(): void{
            let hasFrame: boolean = clientCore.UserHeadManager.instance.getOneInfoById(this.FRAME_ID).have;
            this.img_1.visible = !hasFrame;
            this.img_2.visible = hasFrame;
            this.btnReward.visible = !hasFrame && (clientCore.EarthPerciousMgr.level == 6 || this.getState() == 5);
        }

        private onReward(): void{
            net.sendAndWait(new pb.cs_treasure_of_planet_get_reward()).then((msg: pb.sc_treasure_of_planet_get_reward)=>{
                util.RedPoint.reqRedPointRefresh(24302);
                alert.showReward(msg.items);
                clientCore.UserHeadManager.instance.getOneInfoById(this.FRAME_ID).have = true;
                this.updateView();
            });
        }
    }
}