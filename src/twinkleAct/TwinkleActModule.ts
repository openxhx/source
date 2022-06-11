namespace twinkleAct{
    /**
     * 荣耀成就
     * twinkleAct.TwinkleActModule
     */
    export class TwinkleActModule extends ui.twinkleAct.TwinkleActModuleUI{
        private _rewardInfo: pb.IrewardInfo[];
        constructor(){ super(); }
        init(): void{
            this.list.hScrollBarSkin = '';
            this.list.renderHandler = new Laya.Handler(this,this.listRender,null,false);
            this.list.mouseHandler = new Laya.Handler(this,this.listMouse,null,false);
            this.addPreLoad(xls.load(xls.shineTripAchieve));
            this.addPreLoad(this.getInfo());
        }
        addEventListeners(): void{
            BC.addEvent(this,this.btnBack,Laya.Event.CLICK,this,this.destroy);
            BC.addEvent(this,this.btnNpc,Laya.Event.CLICK,this,this.onMerge);
            BC.addEvent(this,EventManager,globalEvent.ITEM_BAG_CHANGE,this,this.updateProgress);
        }
        removeEventListeners(): void{
            BC.removeEvent(this);
        }
        onPreloadOver(): void{
            this.updateProgress();
            this.list.array = _.uniq(_.map(xls.get(xls.shineTripAchieve).getValues(),(element: xls.shineTripAchieve)=>{ return element.charpter; }));
        }
        destroy(): void{
            this._rewardInfo.length = 0;
            this._rewardInfo = null;
            super.destroy();
        }
        private listRender(item: ui.twinkleAct.item.ActItemUI,index: number): void{
            let msg: pb.IrewardInfo = this._rewardInfo[index];
            item.btnPass.visible = msg.chapterPass != 2;
            item.btnThreePass.visible = msg.starPass != 2;
            item.btnPass.visible && (item.btnPass.disabled = msg.chapterPass == 0);
            item.btnThreePass.visible && (item.btnThreePass.disabled = msg.starPass == 0);
            item.imgBG.skin = `unpack/twinkleAct/${index + 1}-${clientCore.LocalInfo.sex}.png`;
        }
        private listMouse(e: Laya.Event,index: number): void{
            if(e.type != Laya.Event.CLICK)return;
            let item: any = this.list.getCell(index);
            switch(e.target){
                case item.btnPass: //领取通关奖励
                    this.getReward(index,1);
                    break;
                case item.btnThreePass: //领取全三星奖励
                    this.getReward(index,2);
                    break;
                default:
                    break;
            }
        }

        private updateProgress(): void{
            let cfg: xls.commonMerge = xls.get(xls.commonMerge).get(3);
            let hasRole: boolean = clientCore.RoleManager.instance.getRoleById(cfg.mergeResult.v1) != null;
            this.boxProgress.visible = !hasRole;
            this.imgHas.visible = hasRole;
            if(!hasRole){
                let has: number = clientCore.ItemsInfo.getItemNum(cfg.mergeRequire.v1);
                this.progressTxt.changeText(has + '');
                this.imgProgress.width = Math.min(has / cfg.mergeRequire.v2, 1) * 162;;
            }
        }

        private getInfo(): Promise<void>{
            return net.sendAndWait(new pb.cs_shine_change_achievement_panel()).then((msg: pb.sc_shine_change_achievement_panel)=>{
                this._rewardInfo = msg.info;
            }); 
        }

        private onMerge(): void{
            let merge: xls.commonMerge = xls.get(xls.commonMerge).get(3);
            //合成材料不足 跳转预览界面
            if (clientCore.ItemsInfo.getItemNum(merge.mergeRequire.v1) < merge.mergeRequire.v2) {
                alert.showFWords('集齐30个雪露灵魂碎片后可获得该角色！');
            } else {
                alert.showSmall('是否合成雪露？', {
                    callBack: {
                        caller: this,
                        funArr: [() => { this.mergeRole(merge.mergeId); }]
                    }
                })
            }
        }

        private mergeRole(id: number): void{
            net.sendAndWait(new pb.cs_common_merge_item({ id: id })).then((msg: pb.sc_common_merge_item) => {
                alert.showReward([msg.item]);
                this.updateProgress();
            });
        }

        /**
         * 领奖
         * @param index 索引 
         * @param type 1通关奖励 2全三星奖励
         */
        private getReward(index: number,type: number): void{
            net.sendAndWait(new pb.cs_shine_change_get_achievement_reward({chapterId: index + 1,type: type})).then((msg: pb.sc_shine_change_get_achievement_reward)=>{
                alert.showReward(msg.items);
                if(type == 1){
                    this._rewardInfo[index].chapterPass = 2;
                }else{
                    this._rewardInfo[index].starPass = 2;
                }
                this.list.changeItem(index,this.list.array[index]);
            });
        }
    }
}