namespace clientCore{
    /**
     * 新年活动NPC
     */
    export class NpcAvatar extends Avatar{
        private _name: ui.commonNewYear.NameUI;
        private _bone: Bone;
        private _npcId: number;
        constructor(){ super(); }
        init(data: number){
            super.init(data);
            this._name = new ui.commonNewYear.NameUI();
            this._name.pos(-78,-155);
            this._name.img_1.skin = this._name.img_2.skin = `commonNewYear/der_${_.random(1,5)}.png`;
            this._name.namTxt.changeText(xls.get(xls.characterId).get(data).name);
            this._display.addChild(this._name);
            this._bone = BoneMgr.ins.play(`res/animate/randomEvent/${data}/0000.sk`,0,true,this._display,null,true);
            this._bone.on(Laya.Event.CLICK,this,this.onClick);
            this._npcId = data;
        }

        dispose(): void{
            this._name?.destroy();
            this._name = null;
            this._bone?.dispose();
            this._bone = null;
            super.dispose();
        }

        private onClick(): void{
            if(NewYearManager.instance.npcCache[this._npcId]){
                alert.showFWords('已经和他拜过年了，再去找找其他伙伴吧~');
                return;
            }
            AnimateMovieManager.showAnimateMovie(parseInt(`${this._npcId}`.replace('14100','805')),this,()=>{ this.sendMsg(); });
        }

        private sendMsg(): void{
            net.sendAndWait(new pb.cs_common_activity_draw({moduleId: 244,times: 1})).then((msg: pb.sc_common_activity_draw)=>{
                NewYearManager.instance.npcCache[this._npcId] = true;
                msg.item && msg.item.length > 0 && this.parseRewards(msg.item);
            });
        }

        private parseRewards(msg: pb.IdrawReward[]): void{
            alert.showReward(GoodsInfo.createArray(_.map(msg,(element: pb.IdrawReward)=>{
                 let cfg: xls.godTree = xls.get(xls.godTree).get(element.id);
                 let reward: xls.pair = clientCore.LocalInfo.sex == 1 ? cfg.item : cfg.itemMale;
                 return reward;
            }),true));
        }
    }
}