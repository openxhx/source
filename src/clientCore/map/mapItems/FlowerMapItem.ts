/// <reference path="MapItemBase.ts" />
namespace clientCore {
    export class FlowerMapItem extends MapItemBase {
        private _imgStage: number = 0;
        private isFriendSpeedUpFlag: boolean = false;
        private isFriendHarvestFlag: boolean = false;
        constructor(info: MapItemInfo) {
            super(info);
            this.initProduceReward();
        }
        public getImgPath(): string {
            this._imgStage = this.mapItemInfo.flowerCurStage;
            return pathConfig.getSeedPath(this.mapItemInfo.id, this.mapItemInfo.flowerCurStage);
        }
        onRewardClick(e: Laya.Event) {
            super.onRewardClick(e);
            if (MapInfo.isSelfHome) {
                if (this.mapItemInfo.flowerNeedWater > 0) {
                    this.flowerOptByType(3);
                    core.SoundManager.instance.playSound(pathConfig.getSoundUrl('water'));
                    //添加浇水特效
                    let bone: clientCore.Bone = clientCore.BoneMgr.ins.play("res/animate/product/watering.sk", 0, false, this.parent as Laya.Sprite);
                    bone.pos(this.x, this.y);
                    if (GuideMainManager.instance.curGuideInfo.operationBehavior == "clickWatering") {
                        EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
                    }
                }
                else if (this.mapItemInfo.flowerNeedFertilizer > 0) {
                    this.flowerOptByType(4);
                    core.SoundManager.instance.playSound(pathConfig.getSoundUrl('fertilizer'));
                    //添加施肥特效
                    let bone: clientCore.Bone = clientCore.BoneMgr.ins.play("res/animate/product/Apply fertilizer.sk", 0, false, this.parent as Laya.Sprite);
                    bone.pos(this.x, this.y);
                }
                else if (this.mapItemInfo.flowerWeedAppearStage > 0 &&
                    this.mapItemInfo.flowerCurStage >= this.mapItemInfo.flowerWeedAppearStage &&
                    this.mapItemInfo.flowerCurStage < MapItemInfo.FLOWER_MAX_STAGE) {
                    this.flowerOptByType(5);
                }
                else if (this.mapItemInfo.flowerCurStage >= MapItemInfo.FLOWER_MAX_STAGE) {
                    let optInfo = this.mapItemInfo.createOptInfo(6);
                    net.sendAndWait(new pb.cs_map_build_produce_opt({ itemInfo: [optInfo] }), true).then((data: pb.sc_map_build_produce_opt) => {
                        core.SoundManager.instance.playSound(pathConfig.getSoundUrl('getProduct'));
                        EventManager.event(globalEvent.PRODUCE_GET_PRODUCTION_SUCC, [this.mapItemInfo, data.items, data.rareItems]);
                        MapItemsInfoManager.instance.removeOneMapItem(this.mapItemInfo.getTime);
                    }).catch((e: net.ErrorCode) => {
                        if (e.id == 1000024 || e.id == 1102005) {
                            console.log(e);
                        }
                        else {
                            alert.showFWords(e.desc);
                        }
                    });
                    /**测试花朵收获  点击速度太快 */
                    // Laya.timer.frameOnce(1,this,()=>{
                    //     net.sendAndWait(new pb.cs_map_build_produce_opt({ itemInfo: [optInfo] }),true).then((data: pb.sc_map_build_produce_opt) => {
                    //         core.SoundManager.instance.playSound(pathConfig.getSoundUrl('getProduct'));
                    //         EventManager.event(globalEvent.PRODUCE_GET_PRODUCTION_SUCC, [this.mapItemInfo, data.items, data.rareItems]);
                    //         MapItemsInfoManager.instance.removeOneMapItem(this.mapItemInfo.getTime);
                    //     }).catch((e: net.ErrorCode) => {
                    //         console.log(e);
                    //     });
                    // });
                }
            }
            else if (MapInfo.isOthersHome) {
                if (!FriendHomeInfoMgr.ins.friendHomeInfo.isFriend) {
                    alert.showFWords("非好友家园不能加速跟收获！");
                    return;
                }
                if (this.mapItemInfo.flowerCurStage < MapItemInfo.FLOWER_MAX_STAGE && this.mapItemInfo.flowerBeginTime > 0) {
                    if (!this.isFriendSpeedUpFlag) {
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
                }
                else if (this.mapItemInfo.flowerCurStage >= MapItemInfo.FLOWER_MAX_STAGE) {
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
        private flowerOptByType(type: number) {
            let optInfo = this.mapItemInfo.createOptInfo(type);
            net.sendAndWait(new pb.cs_map_build_produce_opt({ itemInfo: [optInfo] })).then((data: pb.sc_map_build_produce_opt) => {
                this.mapItemInfo.refreshItemInfo(data.builds[0]);
                this.showCompleteReward();
                if (GuideMainManager.instance.curGuideInfo.showMaskBehavior == "waitWateringSucc") {
                    EventManager.event(globalEvent.NEW_PLAYER_GUIDE_SHOW_MASK_UI);
                }
            });
        }
        public refreshRestTime() {
            if (this.mapItemInfo.flowerBeginTime <= 0) {
                return;
            }
            //计算花朵阶段
            this.mapItemInfo.updateProduceInfo();
            if (this._imgStage != this.mapItemInfo.flowerCurStage) {
                this._imgStage = this.mapItemInfo.flowerCurStage;
                this.changeImg(this.getImgPath());
                this.setProduceRewardPos();
            }
            this.showCompleteReward();
        }
        public getOrProduceOneProduct() {
            //计算花朵阶段
            this.mapItemInfo.updateProduceInfo();
            if (this._imgStage != this.mapItemInfo.flowerCurStage) {
                this._imgStage = this.mapItemInfo.flowerCurStage;
                this.changeImg(this.getImgPath());
            }
            this.showCompleteReward();
        }
        public showCompleteReward() {
            if (MapInfo.isOthersHome) {
                this.showFriendsReward();
            }
            else if (MapInfo.isSelfHome) {
                this.showSelfReward();
            }
        }
        private showFriendsReward() {
            this._mcReward.visible = false;
            if (!this.isFriendSpeedUpFlag && this.mapItemInfo.flowerCurStage < MapItemInfo.FLOWER_MAX_STAGE && this.mapItemInfo.flowerBeginTime > 0) {
                this.showRewardDetail("commonUI/icon_jiasu.png");
            }
            else if (!this.isFriendHarvestFlag && this.mapItemInfo.flowerCurStage >= MapItemInfo.FLOWER_MAX_STAGE) {
                this.showRewardDetail("commonUI/icon_coin.png");
            }
        }
        private showSelfReward() {
            this._mcReward.visible = false;
            this._mcReward.mcRewardImg.scale(1, 1);
            if (this.mapItemInfo.flowerNeedWater > 0) {
                this.showRewardDetail("commonUI/water.png");
            }
            else if (this.mapItemInfo.flowerNeedFertilizer > 0) {
                this.showRewardDetail("commonUI/fertilizer.png");
            }
            else if (this.mapItemInfo.flowerWeedAppearStage > 0 &&
                this.mapItemInfo.flowerCurStage >= this.mapItemInfo.flowerWeedAppearStage &&
                this.mapItemInfo.flowerCurStage < MapItemInfo.FLOWER_MAX_STAGE) {
                this.showRewardDetail("commonUI/grass.png");
            }
            else {
                if (this.mapItemInfo.flowerCurStage >= MapItemInfo.FLOWER_MAX_STAGE) {//开花阶段
                    this._mcReward.mcNumBg.visible = true;
                    this._mcReward.txtNum.visible = true;
                    let rewardID = xls.get(xls.flowerPlant).get(this.mapItemInfo.id).outputItem;
                    this._mcReward.mcRewardImg.skin = clientCore.ItemsInfo.getItemIconUrl(rewardID);
                    this._mcReward.mcNumBg.skin = "commonUI/numBg1.png";
                    this._mcReward.mcBg.skin = "commonUI/bg1.png";
                    let maxCnt: number = FlowerGrowConf.getFlowerMax(this.mapItemInfo.id, this.mapItemInfo.flowerGrowNum);
                    let degree: number = clientCore.GlobalConfig.config.weedsDegree; //杂草奖励产量的百分比
                    this._mcReward.txtNum.text = 'x' + (this.mapItemInfo.flowerWeedAppearStage > 0 ? Math.floor(maxCnt * (1-degree/100)) : maxCnt);
                    this._mcReward.visible = this.visible;
                    this._mcReward.mcRewardImg.scale(0.5, 0.5);
                }
            }
        }
        private showRewardDetail(url: string) {
            this._mcReward.mcNumBg.visible = false;
            this._mcReward.txtNum.visible = false;
            this._mcReward.mcBg.skin = "commonUI/bg1.png";
            this._mcReward.mcRewardImg.skin = url;
            this._mcReward.visible = this.visible;
        }
        public checkCanGet(): boolean {
            return this.mapItemInfo.flowerNeedWater > 0 ||
                this.mapItemInfo.flowerNeedFertilizer > 0 ||
                (this.mapItemInfo.flowerWeedAppearStage > 0 &&
                    this.mapItemInfo.flowerCurStage >= this.mapItemInfo.flowerWeedAppearStage &&
                    this.mapItemInfo.flowerCurStage < MapItemInfo.FLOWER_MAX_STAGE) || this.mapItemInfo.flowerCurStage >= MapItemInfo.FLOWER_MAX_STAGE;
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