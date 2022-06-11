
/// <reference path="PersonUnit.ts" />


namespace clientCore {
    /**
     * 其他玩家
     */
    export class OtherUnit extends PersonUnit {

        private _render: Person2;
        private _rider: clientCore.Bone;
        private _timeLine: Laya.TimeLine;
        constructor() {
            super();
            this._lbName.color = "#FFFFFF";
        }

        set lbNameColor(c: string) {
            this._lbName.color = c;
        }

        public init(data: pb.IUserBase): void {
            super.init(data);
            this._data = data;
            this._id = data.userid;
            this._sex = data.sex;
            this._haveRider = clientCore.BgShowManager.filterDecoIdByType(data.curClothes, clientCore.CLOTH_TYPE.Rider) != 0 && MapInfo.mapID != 24;
            this._render = new Person2(data, this.getPosName());
            // this._render = new Person2(data, 'huxi');
            this._render.mouseEnabled = false;
            this._dispaly.addChild(this._render);
            this.updateName(data.nick);
            this.addToLayer();
            this.addClickArea();
            this.replaceClothArr(data.curClothes);
            this.updateBadge(this._data.badgeBase, this._data.badgeType);
            this.updateFunnyToy(this._data.propStampInfo);
        }

        public get data() {
            return this._data;
        }

        public set visible(value: boolean) {
            this._visible = value;
            this._dispaly && (this._dispaly.visible = value && this.checkShowBody());
            this._lbName && (this._lbName.visible = value);
            this._progress && (this._progress.visible = value);
            this._pet && (this._pet.visible = value);
            ///处理其他玩家的称号显示情况
            this._title.visible = value && this._data.isHideTitle == 0 && MapInfo.mapID != 24;
            // this._activityProp.visible = value;
            this._badgeDec.visible = value;
            this._badgeBg.visible = value;
            this._cpEffect && (this._cpEffect.visible = value);
        }

        public get visible(): boolean {
            return this._visible;
        }

        public dispose(): void {
            //清理其他人的花宝
            this._rider?.dispose();
            this._rider = null;
            this._render?.destory();
            this._render = null;
            this._progress = null;
            this._timeLine?.destroy();
            super.dispose();
        }

        /**更换坐骑姿势 */
        public changeRiderPosture(idx: number) {
            if (idx == this._data.actionId) return;
            this._data.actionId = idx;
            this._render.playAnimate(this.getPosName(), true);
        }

        public flyAcceleration(): void {
            if (!this._haveRider) {
                super.flyAcceleration();
                this._render && this._render.flyAcceleration();
            }
        }

        public flySlowDown(): void {
            if (!this._haveRider) {
                super.flySlowDown();
                this._render && this._render.flySlowDown();
            }
        }

        private changeRider(id: number) {
            this._haveRider = id != 0;
            this._render.playAnimate(this.getPosName(), true);
            if (id) {
                this._rider?.dispose();
                this._rider = clientCore.BoneMgr.ins.playRiderBone(id, this._render);
            }
            else {
                this._rider?.dispose()
                this._rider = null;
            }
        }

        /** 换装*/
        public replaceClothArr(cloths: number[]): void {
            if (this._render) {
                if (MapInfo.mapID == 24) {
                    cloths = clientCore.OnsenRyokanManager.getCloths(cloths, this.data.sex);
                }
                this._data.curClothes = cloths;
                //判断是不是只有衣服改动过
                let changedCloth = _.filter(cloths, id => !xls.get(xls.bgshow).has(id));
                if (_.difference(changedCloth, this._render.allWearingIds).length > 0) {
                    // this._render.destory();
                    // this._render = null;
                    // this._render = new Person2(this._data);
                    // this._dispaly.addChild(this._render);
                    this._render.replaceClothArr(changedCloth)
                }
                let riderId = clientCore.BgShowManager.filterDecoIdByType(cloths, clientCore.CLOTH_TYPE.Rider);
                this.changeRider(riderId);
            }
        }

        public checkTitle(): void {
            if (this._data.titleEndTime != 0 && this._title && this._title.visible && this._data.titleEndTime <= clientCore.ServerManager.curServerTime) {
                this.setTitleVisb(false);
            }
        }

        public flyTo(midPos: Laya.Point, aimPos: Laya.Point, len: number) {
            Laya.Tween.clearAll(this);
            // util.TimeUtil.awaitTime(len * 0.7).then(() => {
            //     this?.flySlowDown();
            // })
            this._timeLine?.offAll();
            this._timeLine = Laya.TimeLine
                .to(this, { x: midPos.x, y: midPos.y }, len * 0.7, Laya.Ease.linearIn).addLabel('flySlowDown', 0)
                .to(this, { x: aimPos.x, y: aimPos.y }, len * 0.3, Laya.Ease.linearOut);
            this._timeLine.play();
            this._timeLine.once(Laya.Event.LABEL, this, (e: string) => {
                if (e == 'flySlowDown') {
                    this?._timeLine.offAll();
                    this?.flySlowDown();
                }
            });
            this._timeLine.once(Laya.Event.COMPLETE, this, () => {
                this?.flySlowDown();
            });
        }

        protected showUserInfo(e: Laya.Event) {
            super.showUserInfo(e);
            if (this._isSnowMan) {
                clientCore.ModuleManager.open("christmasInteract.ChrismasHelpPanel", this._id);
                return;
            }
            if (this.isLimit) {
                this.isLimit = false;
                net.sendAndWait(new pb.cs_save_hua_clean({ uid: this._id, mapId: MapInfo.mapID })).then((msg: pb.sc_save_hua_clean) => {
                    clientCore.ModuleManager.open("saveFaeryInteract.CommonResultPanel", { uid: this.data.userid, sex: this._sex, cloths: this.data.curClothes, monster: 0, type: 0, point: msg.courage, item: null });
                    SaveFaeryManager.ins.eventTimes = msg.gameTime;
                })
                return;
            }
            if (clientCore.FunnyToyManager.isAimingMode) {
                clientCore.FunnyToyManager.useFunnyToy(clientCore.FunnyToyManager.aimItemId, { x: this.x, y: this.y - 60 }, this._data.userid);
            }
            else {
                clientCore.UserInfoTip.showTips(this._dispaly, this._data);
            }
        }

        public static create(): OtherUnit {
            return new OtherUnit()
        }
    }
}