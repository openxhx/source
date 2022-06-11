namespace oceanicSong{

    const PRICE: number[] = [
        360,
        360,
        200
    ];
    const EXCHANGE_ID: number[] = [
        2672,
        2673,
        2674
    ];
    const CLOTHS: number[][] = [
        [2110399],
        [2110400],
        [1000116, 1100083]
    ]
    /**
     * 星辰微光
     */
    export class StarPanel extends ui.oceanicSong.panel.StarPanelUI implements IPanel{
        ruleId: number = 1184;
        constructor(){
            super();
            this.pos(98, 15);
            this.ani1.index = clientCore.LocalInfo.sex == 1 ? 0 : 1;
            this.list.renderHandler = new Laya.Handler(this, this.listRender, null, false);
            this.list.mouseHandler = new Laya.Handler(this, this.listMouse, null, false);
            this.list.array = ['夏色莲套装', '星辰微光套装', '海之语舞台+背景秀'];
            this.addEvents();
        }
        init(sign: number): void{

        }
        show(parent: Laya.Sprite): void{
            EventManager.event(EventType.UPDATE_TIME, '活动时间:6月18日~7月1日');
            clientCore.Logger.sendLog('2021年6月18日活动', '【付费】海洋之歌第二期', '打开星辰微光面板');
            parent.addChildAt(this, 0);
        }
        hide(): void{
            this.removeSelf();
        }
        dispose(): void{
            this.removeEvents();
        }
        private addEvents(): void{
            BC.addEvent(this, this.btnBuy, Laya.Event.CLICK, this, this.onBuy);
            for(let i:number=0; i<3; i++){
                BC.addEvent(this, this[`btnTry_${i}`], Laya.Event.CLICK, this, this.onTry, [i]);
            }
        }
        private removeEvents(): void{
            BC.removeEvent(this);
        }
        private listRender(item: ui.oceanicSong.item.ShopItemUI, index: number): void{
            item.imgSel.visible = false;
            item.imgHas.visible = clientCore.ItemsInfo.checkHaveItem(CLOTHS[index][0]);
            item.txName.text = this.list.array[index];
        }
        private listMouse(e: Laya.Event, index: number): void{
            if(e.type != Laya.Event.CLICK || e.target['imgHas'].visible)return;
            let img: Laya.Image = e.target['imgSel'];
            img.visible = !img.visible;
            this.calcuatePrice();
        }
        /** 计算价格*/
        private calcuatePrice(): void{
            let len: number = this.list.length;
            let hasIds: number[] = [];
            let buyIds: number[] = [];
            for(let i:number=0; i<len; i++){
                let item: any = this.list.getCell(i);
                item['imgSel'].visible && buyIds.push(i);
                item['imgHas'].visible && hasIds.push(i);
            }
            let all: number = buyIds.length + hasIds.length;
            let disc: number = [1, 0.7, 0.65][all - 1];
            let hasDisc: number = [1, 0.7, 0.65][hasIds.length - 1];
            let buyPrice: number = 0;
            let hasPrice: number = 0;
             _.forEach(_.concat(buyIds, hasIds), (element: number)=>{ buyPrice += PRICE[element] * disc; });
             _.forEach(hasIds, (element: number)=>{ hasPrice += PRICE[element] * hasDisc; });
             this.txPrice.changeText(`${Math.round(buyPrice - hasPrice)}`);
        }
        private onBuy(): void{
            let len: number = this.list.length;
            let buyIds: number[] = [];
            for(let i:number=0; i<len; i++){
                let item: any = this.list.getCell(i);
                item['imgSel'].visible && buyIds.push(EXCHANGE_ID[i]);
            }
            if(buyIds.length <= 0) return;
            alert.showSmall(`是否花费 x${parseInt(this.txPrice.text)} 灵豆购买？`, {
                callBack: {
                    caller: this,
                    funArr: [()=>{
                        net.sendAndWait(new pb.cs_ocean_song_buy_cloth({period: 2, idxs: buyIds})).then((msg: pb.sc_ocean_song_buy_cloth)=>{
                            alert.showReward(msg.items);
                            this.list.refresh();
                            this.txPrice.changeText('0');
                        });
                    }]
                }
            })
        }
        private onTry(idx: number): void{
            switch(idx){
                case 0:
                case 1:
                    alert.showCloth(CLOTHS[idx][0]);
                    break;
                case 2:
                    clientCore.ModuleManager.open('previewBG.PreviewBGModule', { id: CLOTHS[idx], condition: '海之语背景秀+舞台'});
                    break;
            }
        }
    }
}