namespace jumpGame{
    export class FlowerItem extends ui.jumpGame.item.FlowerPlatformUI{
        public flowerType:number = 0;
        public flowerNum:number = 0;
        constructor(){
            super();
        }

        public show(type:number){
            this.flowerType = type;
            for(let i = 0;i<6;i++){
                this["box_"+i].visible = false;
                this["platform_"+i].visible = false;
            }
            this.imgReward.visible = false;
            this.imgReward.pos(-3,-32);
            this.boxPlayerInfo.visible = false;
            this["box_"+this.flowerType].visible = true;
            /** 平台红条，不用了就隐藏 ，不能删，因为要用这个平台的宽度*/
            // this["platform_"+this.flowerType].visible = true;
        }

        public get width():number{
            return this["platform_"+this.flowerType].width;
        }

        /**显示其他好友头像 */
        showPlayerInfo(info:pb.IFriendStepInfo){
            this.boxPlayerInfo.visible = true;
            this.imgHead.skin = clientCore.ItemsInfo.getItemIconUrl(info.headImage);
            this.imgFrame.skin = clientCore.ItemsInfo.getItemIconUrl(info.headFrame);
            this.txtNick.text = info.nick;
        }

        showRewardBox(){
            this.imgReward.visible = true;
        }
        hasBox(){
            return this.imgReward.visible;
        }
        getRewardBox(){
            Laya.Tween.to(this.imgReward,{y:this.imgReward.y - 70,scaleX:1.5,scaleY:1.5},500,Laya.Ease.linearIn,new Laya.Handler(this,()=>{
                this.imgReward.visible = false;
            }));
        }
    }
}