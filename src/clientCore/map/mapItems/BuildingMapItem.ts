/// <reference path="MapItemBase.ts" />
namespace clientCore {
    export class BuildingMapItem extends MapItemBase {

        private isFriendSpeedUpFlag: boolean = false;
        private isFriendHarvestFlag: boolean = false;
        constructor(info: MapItemInfo) {
            super(info);
            this.initProduceReward();

        }
        public getImgPath(): string {
            return pathConfig.getBuildingPath(this.mapItemInfo.id, this.mapItemInfo.level);
        }
        public refreshRestTime() {
            if (this.mapItemInfo.produceRestTime <= 0) {
                return;
            }
            this.mapItemInfo.updateProduceInfo();
            this.showCompleteReward();

        }
        /**加速或者生产完成是刷新显示用 */
        public getOrProduceOneProduct() {
            this.mapItemInfo.updateProduceInfo();
            this.showCompleteReward();
        }
        public showCompleteReward() {
            if (MapInfo.isSelfHome) {
                this.showSelfReward();
            }
            else if (MapInfo.isOthersHome) {
                this.showFriendReward();
            }
        }
        private showSelfReward() {
            this._mcReward.mcRewardImg.scale(1, 1);
            if (this.mapItemInfo.produceCompleteNum > 0) {
                this._mcReward.visible = true;
                this._mcReward.txtNum.visible = true;
                this._mcReward.txtNum.text = 'x' + this.mapItemInfo.produceCompleteNum;
                this._mcReward.mcRewardImg.scale(0.5, 0.5);
                if (this.mapItemInfo.produceCompleteNum >= this.mapItemInfo.produceTotalNum) {
                    this._mcReward.mcBg.skin = "commonUI/bg2.png";
                    this._mcReward.mcNumBg.skin = "commonUI/numBg2.png";
                }
                else {
                    this._mcReward.mcBg.skin = "commonUI/bg1.png";
                    this._mcReward.mcNumBg.skin = "commonUI/numBg1.png";
                }
            }
            else {
                this._mcReward.visible = false;
                this._mcReward.txtNum.visible = false;
            }
        }
        private showFriendReward() {
            this._mcReward.visible = false;
            if (!this.isFriendSpeedUpFlag && this.mapItemInfo.produceRestTime > 0) {
                this.showRewardDetail("commonUI/icon_jiasu.png");
            }
            else if (!this.isFriendHarvestFlag && this.mapItemInfo.produceCompleteNum > 0) {
                this.showRewardDetail("commonUI/icon_coin.png");
            }
        }
        private showRewardDetail(url: string) {
            this._mcReward.mcNumBg.visible = false;
            this._mcReward.txtNum.visible = false;
            this._mcReward.mcBg.skin = "commonUI/bg1.png";
            this._mcReward.mcRewardImg.skin = url;
            this._mcReward.visible = true;
        }
        public getReward() {
            let optInfo = this.mapItemInfo.createOptInfo(6);
            net.sendAndWait(new pb.cs_map_build_produce_opt({ itemInfo: [optInfo] })).then((data: pb.sc_map_build_produce_opt) => {
                core.SoundManager.instance.playSound(pathConfig.getSoundUrl('bubble'));
                EventManager.event(globalEvent.PRODUCE_GET_PRODUCTION_SUCC, [this.mapItemInfo, data.items]);
                this.mapItemInfo.refreshItemInfo(data.builds[0]);
                this.showCompleteReward();
            });
        }
        onRewardClick(e: Laya.Event) {
            super.onRewardClick(e);
            if (MapInfo.isSelfHome) {
                this.getReward();
            }
            else if (MapInfo.isOthersHome) {
                if (!FriendHomeInfoMgr.ins.friendHomeInfo.isFriend) {
                    return;
                }
                if (this.mapItemInfo.produceRestTime > 0 && !this.isFriendSpeedUpFlag) {
                    net.sendAndWait(new pb.cs_reduce_friend_product_time({ homeId: parseInt(MapInfo.mapData), getTime: this.mapItemInfo.getTime })).then((data: pb.sc_reduce_friend_product_time) => {
                        this.isFriendSpeedUpFlag = true;
                        this._mcReward.visible = false;
                        for (let i = 0; i < data.items.length; i++) {
                            alert.showFWords("加速奖励：" + ItemsInfo.getItemName(data.items[i].id) + " x" + data.items[i].cnt);
                        }
                        FriendHomeInfoMgr.ins.friendHomeInfo.quickTimes--;
                        FriendHomeInfoMgr.ins.friendHomeInfo.selfQuickTimes--;
                        EventManager.event(globalEvent.FRIEND_HELP_INFO_REFRESH);
                    });
                }
                else if (this.mapItemInfo.produceCompleteNum > 0) {
                    if (!this.isFriendHarvestFlag) {
                        net.sendAndWait(new pb.cs_visit_friend_home_get_star({ homeId: parseInt(MapInfo.mapData), getTime: this.mapItemInfo.getTime })).then((data: pb.sc_visit_friend_home_get_star) => {
                            this.isFriendHarvestFlag = true;
                            this._mcReward.visible = false;
                            for (let i = 0; i < data.items.length; i++) {
                                alert.showFWords("获得：" + ItemsInfo.getItemName(data.items[i].id) + " x" + data.items[i].cnt);
                            }
                            FriendHomeInfoMgr.ins.friendHomeInfo.pickTimes--;
                            FriendHomeInfoMgr.ins.friendHomeInfo.selfPickTimes--;
                            EventManager.event(globalEvent.FRIEND_HELP_INFO_REFRESH);
                        });
                    }
                }
            }
        }
        public checkCanGet(): boolean {
            return this.mapItemInfo.produceCompleteNum > 0;
        }

        public destroy() {
            super.destroy();
            this.removeSelf();
        }

        quickFriend(): void {
            this.isFriendSpeedUpFlag = true;
            this._mcReward.visible = false;
        }

        pickFriend(): void {
            this.isFriendHarvestFlag = true;
            this._mcReward.visible = false;
        }
    }
}