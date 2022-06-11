namespace springSummberAppoint{
    /**
     * 春日甜饼-圣诗白鸽
     */
    export class CakePanel2 extends ui.springSummberAppoint.panel.CakePanel2UI implements IPanel{

        private readonly SUIT_1: number = 2110349;
        private readonly SUIT_2: number = 2110348;
        private readonly BGSHOW_ID: number = 1000105;

        ruleId: number = 1155;

        constructor(){
            super();
            this.imgReward.skin = clientCore.ItemsInfo.getItemIconUrl(clientCore.LocalInfo.sex == 1 ? 138009 : 138010);
            this.pos(-33,-107);
            this.addEvents();
            this.updateView();
            for(let i:number=1; i<3; i++){
                this[`imgNv_${i}`].visible = clientCore.LocalInfo.sex == 1;
                this[`imgNan_${i}`].visible = clientCore.LocalInfo.sex == 2;
            }
        }

        show(sign:number,parent: Laya.Sprite): void{
            parent.addChild(this);
        }
        hide(): void{
            this.removeSelf();
        }
        dispose(): void{
            this.removeEvents();
        }

        private addEvents(): void{
            for(let i:number=1; i<4; i++){
                if(i<3)
                    BC.addEvent(this,this[`btnBuy_${i}`],Laya.Event.CLICK,this,this.onBuy,[i]);
                BC.addEvent(this,this[`btnTry_${i}`],Laya.Event.CLICK,this,this.onTry,[i]);
            }
            BC.addEvent(this,this.btnGet,Laya.Event.CLICK,this,this.onGet);
            BC.addEvent(this,this.btnReward,Laya.Event.CLICK,this,this.onReward);
        }

        private removeEvents(): void{
            BC.removeEvent(this);
        }

        private onTry(index: number): void{
            switch(index){
                case 1:
                    alert.showCloth(this.SUIT_1);
                    break;
                case 2:
                    clientCore.ModuleManager.open('previewBG.PreviewBGModule', { id: this.BGSHOW_ID, condition: '雪融背景秀' });
                    break;
                case 3:
                    alert.showCloth(this.SUIT_2);
                    break;
            }
        }

        private onBuy(index: number): void{
            alert.showSmall(`是否花费灵豆x${this[`ftPrice_${index}`].value}购买套装？`,{
                callBack: {
                    caller: this,
                    funArr: [()=>{
                        net.sendAndWait(new pb.cs_common_exchange({activityId: 141,exchangeId: this[`id_${index}`]})).then((msg: pb.sc_common_exchange)=>{
                            alert.showReward(msg.item);
                            this.updateView();
                        });
                    }]
                }
            })
        }

        private onGet(): void{
            net.sendAndWait(new pb.cs_season_appoint_panel_get_cloth({module: 1,term: 2})).then((msg: pb.sc_season_appoint_panel_get_cloth)=>{
                alert.showReward(msg.items);
                this.btnGet.visible = false;
            })
        }

        private onReward(): void{
            net.sendAndWait(new pb.cs_season_appoint_panel_get_cloth({module: 0,term: 2})).then((msg: pb.sc_season_appoint_panel_get_cloth)=>{
                alert.showReward(msg.items);
                this.updateReward();
            })
        }

        private hasCloth_1: boolean;
        private hasCloth_2: boolean;
        private id_1: number;
        private id_2: number;
        private updateView(): void{
            // this.hasCloth_1 = clientCore.SuitsInfo.checkHaveSuits(this.SUIT_1);
            this.hasCloth_1 = this.checkCloth();
            this.hasCloth_2 = clientCore.SuitsInfo.checkHaveSuits(this.SUIT_2);
            let ids: number[] = [2575,2573];
            for(let i:number=1; i<3; i++){
                let has: boolean = this[`hasCloth_${i}`];
                this[`btnBuy_${i}`].visible = !has;
                this[`imgHas_${i}`].visible = has;
                if(!has){
                    this[`id_${i}`] = ids[i-1] + (this[`hasCloth_${i == 1 ? 2 : 1}`] ? 1 : 0);
                    this[`ftPrice_${i}`].value = xls.get(xls.eventExchange).get(this[`id_${i}`]).cost[0].v2;
                }
            }
            this.btnGet.visible = !clientCore.ItemsInfo.checkHaveItem(this.BGSHOW_ID) && this.hasCloth_1 && this.hasCloth_2;
            this.updateReward();
        }

        private updateReward(): void{
            let hasCloth: boolean = this.checkCloth();
            let hasHead: boolean = clientCore.LocalInfo.checkHaveCloth(clientCore.LocalInfo.sex == 1 ? 138009 : 138010);
            this.boxReward.visible = hasCloth && !hasHead;
        }

        private checkCloth(): boolean{
            return clientCore.LocalInfo.checkHaveCloth(clientCore.LocalInfo.sex == 1 ? 137571 : 137579);
        }
    }
}