
namespace clientCore {
    /**
     * 玩家自身
     */
    export class Player extends PersonUnit {

        private _render: Person;
        private _rider: clientCore.Bone;
        private _tmpRiderId: number;

        constructor() {
            super();
            this._lbName.color = "#CCFF33";
        }

        public init(data: pb.IUserBase): void {
            super.init(data);
            this._id = LocalInfo.uid;
            this._sex = LocalInfo.sex;
            this._render = new Person(this._sex);
            this._haveRider = clientCore.BgShowManager.filterDecoIdByType(data.curClothes, clientCore.CLOTH_TYPE.Rider) != 0 && MapInfo.mapID != 24;
            this._render.playAnimate(this.getPosName());
            this._dispaly.addChild(this._render);
            this.updateName(LocalInfo.userInfo.nick);
            this.updateBadge(LocalInfo.srvUserInfo.badgeBase, LocalInfo.srvUserInfo.badgeType);
            this.addToLayer();
            this.addClickArea();
            this._render.mouseEnabled = false;
        }
        public changeCloths(cloths: number[]): void {
            this._render.downAllCloth();
            this._render.upByIdArr(cloths);
            let riderId = clientCore.BgShowManager.instance.currRider;
            this.changeRider(riderId);
        }

        /**更换坐骑姿势 */
        public changeRiderPosture(idx: number) {
            if (idx == this._data.actionId) return;
            this._data.actionId = idx;
            this._render.playAnimate(this.getPosName(), true);
        }

        public getActionId() {
            return this._data.actionId;
        }

        private changeRider(id: number) {
            this._haveRider = id != 0;
            this._render.playAnimate(this.getPosName(), true);
            if (id) {
                if (this._tmpRiderId != id) {
                    this._tmpRiderId = id;
                    this._rider?.dispose();
                    this._rider = clientCore.BoneMgr.ins.playRiderBone(id, this._render);
                }
                this._rider.visible = true;
            }
            else
                this._rider && (this._rider.visible = false);
        }

        public flyAcceleration(): void {
            if (this._render && !this._haveRider) {
                super.flyAcceleration();
                this._render.flyAcceleration();
                this.playDustAni();
                Laya.timer.loop(400, this, this.playDustAni);
            }
            this._rider?.skeleton.playbackRate(2);
        }

        public get visible(): boolean {
            return this._visible;
        }
        public set visible(value: boolean) {
            this._visible = value;
            this._dispaly && (this._dispaly.visible = value && this.checkShowBody());
            this._lbName && (this._lbName.visible = value);
            this._progress && (this._progress.visible = value);
            this._pet && (this._pet.visible = value);
            this._title && (this._title.visible = value && LocalInfo.showTitle && MapInfo.mapID != 24);
            this._badgeBg && (this._badgeBg.visible = value);
            this._badgeDec && (this._badgeDec.visible = value);
            // this._activityProp && (this._activityProp.visible = value);
            this._cpEffect && (this._cpEffect.visible = value);
        }

        public flySlowDown(): void {
            if (!this._haveRider) {
                super.flySlowDown();
                this._render && this._render.flySlowDown();
                Laya.timer.clear(this, this.playDustAni);
            }
            this._rider?.skeleton.playbackRate(1);
        }

        private playDustAni() {
            if (this._render) {
                let bone = BoneMgr.ins.play('res/animate/person/fly_dust.sk', 0, false, PersonLayer.ins.bodyLayer);
                bone.pos(this.x, this.y);
                bone.scaleX = bone.scaleY = 0.8;
            }
        }

        public changeFlowerPet(bigType: number, littleType: number): void {
            super.changeFlowerPet(bigType, littleType);
            this.showFlowerPet(FlowerPetInfo.followStatus == 1);
        }

        public playLevelUpAni() {
            if (this._render) {
                let bone = BoneMgr.ins.play('res/animate/person/upgrade.sk', 0, false, PersonLayer.ins.bodyLayer);
                bone.pos(this.x, this.y);
                bone.scaleX = bone.scaleY = 0.8;
            }
        }

        protected showUserInfo(e: Laya.Event) {
            super.showUserInfo(e);
            if (clientCore.FunnyToyManager.isAimingMode) {
                clientCore.FunnyToyManager.useFunnyToy(clientCore.FunnyToyManager.aimItemId, { x: this.x, y: this.y - 60 }, this._data.userid);
            } else if (MapInfo.isSelfHome && this._haveRider) {
                clientCore.ChangePosture.showTips(this._dispaly);
            }
        }

        public checkOnsenRyokan() {
            if (MapInfo.mapID == 24) {
                this.changeCloths(clientCore.OnsenRyokanManager.getCloths(LocalInfo.wearingClothIdArr, LocalInfo.sex));
                this.changeRider(0);
            } else {
                this.changeCloths(LocalInfo.wearingClothIdArr);
            }
            this.visible = this.visible;
        }

        protected loopTime() {
            super.loopTime();
            if (this._snowmanCd <= 0) {
                net.send(new pb.cs_christmas_greetings_clean({ uid: this._id }));
            }
        }

        dispose() {
            TitleManager.ins.dispose();
            Laya.timer.clear(this, this.playDustAni);
            super.dispose();
        }
    }
}