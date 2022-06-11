namespace mapBean {
    /**
     * mapBean.FamilyPartyControlBean
     */
    export class FamilyPartyControlBean implements core.IMapBean {
        private _destroy: boolean = false;
        private _activityInfo: pb.Isc_get_family_party_info;
        private _activityInfoUI: ui.familyPartyBean.ActivityInfoUI;
        private _buffInfoUI: ui.familyPartyBean.BuffInfoUI;
        private _picnicInfoUI: ui.familyPartyBean.PicnicInfoUI;
        private _balloonUI: ui.familyPartyBean.BalloonInfoUI;
        private _bgMovie: clientCore.Bone;
        private _balloonDisTimeArr: number[] = [0, 0, 0];
        private _buffItemArr: familyParty.BuffItem[] = [];
        private _flowerImgArr: familyParty.FlowerItem[];
        private _rabbitBalloon: familyParty.RabbitBalloon;
        private _progress: Laya.Sprite;
        private _mask: Laya.Image;
        async start(ui?: any, data?: any) {
            console.log("family party start");
            await Promise.all([
                clientCore.ModuleManager.loadatlas('familyPartyBean'),
                xls.load(xls.familyBuff)
            ]);
            this._activityInfo = await net.sendAndWait(new pb.cs_get_family_party_info({ fmlId: clientCore.FamilyMgr.ins.familyId }));
            if (!this._destroy) {
                this.init();
                this.addeventListeners();
            }
        }
        init() {
            if (clientCore.ServerManager.curServerTime > this._activityInfo.endTime) {
                this.activityIsOver();
                return;
            }
            //活动计时信息
            this.addActivityInfoUI();
            //buff信息
            this.addBuffInfoUI();
            //野餐
            this.addPicnicUI();
            //气球
            this.addBalloonUI();
            //姜栗花
            this.addFlowerItem();
            //兔子气球
            this.addRabbitBalloon();

            Laya.timer.loop(500, this, this.update);

            //添加全景动画
            this._bgMovie = clientCore.BoneMgr.ins.play("res/animate/familyParty/Sceneanimation.sk", 0, true, clientCore.MapManager.mapItemsLayer, null);
            this._bgMovie.pos(2050, 1174);
            window["bgMovie"] = this._bgMovie;
        }
        addRabbitBalloon() {
            this._rabbitBalloon = new familyParty.RabbitBalloon();
            BC.addEvent(this, this._rabbitBalloon.clickArea, Laya.Event.CLICK, this, this.clickRabbitBalloon);
            if (this._activityInfo.rabbitTime > clientCore.ServerManager.curServerTime) {//CD中
                this._rabbitBalloon.hideRabbit();
            }
        }
        async clickRabbitBalloon() {
            this._rabbitBalloon.clickArea.visible = false;
            net.sendAndWait(new pb.cs_family_party_click_rabbit({ fmlId: clientCore.FamilyMgr.ins.familyId })).then((data: pb.sc_family_party_click_rabbit) => {
                this._activityInfo.rabbitTime = data.rabbitTime;
                this._rabbitBalloon.playBombMovie().then(() => {
                    alert.showReward(clientCore.GoodsInfo.createArray(data.items));
                });
            });
        }
        addFlowerItem() {
            this._flowerImgArr = [];
            for (let info of this._activityInfo.pickItems) {
                let flower = new familyParty.FlowerItem();
                flower.skin = "familyPartyBean/flower.png";
                flower.x = info.pos.x;
                flower.y = info.pos.y;
                flower.posID = info.posId;
                this._flowerImgArr.push(flower);
                if (info.remain < 1) {
                    flower.visible = false;
                }
                clientCore.MapManager.curMap.pickLayer.addChild(flower);
                BC.addEvent(this, flower, Laya.Event.CLICK, this, this.onFlowerClick);
            }
        }
        onFlowerClick(e: Laya.Event) {
            if (this._activityInfo.buffs[4].layer >= 3) {
                alert.showFWords("继续摘取将有花粉过敏的风险哦");
                return;
            }
            let item = e.currentTarget as familyParty.FlowerItem;
            net.sendAndWait(new pb.cs_family_party_pick_items({ posId: item.posID, fmlId: clientCore.FamilyMgr.ins.familyId })).then((data: pb.sc_family_party_pick_items) => {
                if (data.isOver == 0) {
                    alert.showReward(clientCore.GoodsInfo.createArray(data.items));
                    // for (let info of data.items) {
                    //     alert.showFWords(`恭喜获得${clientCore.ItemsInfo.getItemName(info.id)} x${info.cnt}`);
                    // }
                    this._activityInfo.buffs[4] = data.buff;
                    this.updateBuffInfo();
                }
                else if (data.isOver == 1) {
                    alert.showFWords("手慢了花朵已经被摘走啦");
                }
                else if (data.isOver == 2) {
                    alert.showFWords("不能再领了！");
                }
                else if (data.isOver == 3) {
                    alert.showFWords("聚会结束了");
                }
            })
        }
        addBalloonUI() {
            this._balloonUI = new ui.familyPartyBean.BalloonInfoUI();
            this._balloonUI.x = 1079;
            this._balloonUI.y = 1206;
            clientCore.MapManager.mapItemsLayer.addChild(this._balloonUI);

            BC.addEvent(this, this._balloonUI.balloon_1, Laya.Event.CLICK, this, this.onBalloonClick, [1]);
            BC.addEvent(this, this._balloonUI.balloon_2, Laya.Event.CLICK, this, this.onBalloonClick, [2]);
        }
        onBalloonClick(index: number, e: Laya.Event) {
            let img: Laya.Image = e.currentTarget as Laya.Image;
            let boomMovie: clientCore.Bone = clientCore.BoneMgr.ins.play("res/animate/familyParty/BalloonBlast.sk", 0, false, clientCore.MapManager.mapItemsLayer, null);
            boomMovie.pos(this._balloonUI.x + img.x + img.width / 2, this._balloonUI.y + img.y + img.height / 2);
            img.visible = false;
            this._balloonUI["imgBalloon_" + index].visible = false;
            this._balloonDisTimeArr[index] = clientCore.ServerManager.curServerTime;
        }
        addPicnicUI() {
            this._picnicInfoUI = new ui.familyPartyBean.PicnicInfoUI();
            this._picnicInfoUI.x = 396;
            this._picnicInfoUI.y = 1364;
            clientCore.MapManager.mapItemsLayer.addChild(this._picnicInfoUI);
            for (let i = 1; i < 5; i++) {

                BC.addEvent(this, this._picnicInfoUI["picnicItem_" + i], Laya.Event.CLICK, this, this.onPicnicItemClick, [i]);
                clientCore.MapManager.curMap.pickLayer.addChild(this._picnicInfoUI["picnicItem_" + i]);
                this._picnicInfoUI["picnicItem_" + i].x = this._picnicInfoUI.x + this._picnicInfoUI["picnicItem_" + i].x;
                this._picnicInfoUI["picnicItem_" + i].y = this._picnicInfoUI.y + this._picnicInfoUI["picnicItem_" + i].y;
            }
            this.createProgress();
        }
        private createProgress() {
            this._progress = new Laya.Sprite();
            let bg = new Laya.Image();
            let pro = new Laya.Image();
            this._mask = new Laya.Image();
            bg.skin = "commonUI/pickProgressBg.png";
            pro.skin = "commonUI/pickProgress.png";
            this._mask.skin = "commonUI/pickProgress.png";
            pro.mask = this._mask;
            this._progress.addChild(bg);
            this._progress.addChild(pro);
            this._progress.width = bg.width;
            this._progress.height = bg.height;
            this._progress.pivotX = bg.width / 2;
            this._mask.x = -this._mask.width;
        }
        private onPicnicItemClick(index: number, e: Laya.Event) {
            if (this._activityInfo.buffs[index - 1].layer > 0) {
                alert.showFWords("正在回味中，试试别的吧~");
                return;
            }
            let clickItem = e.currentTarget as Laya.Image;
            let aimPos = new Laya.Point();
            if (clickItem.x > clientCore.PeopleManager.getInstance().player.x) {
                aimPos.x = clickItem.x - 30;
                aimPos.y = clickItem.y + clickItem.height / 2;
            }
            else {
                aimPos.x = clickItem.x + clickItem.width + 30;
                aimPos.y = clickItem.y + clickItem.height / 2;
            }
            clientCore.PeopleManager.getInstance().flyTo(aimPos);
            EventManager.once(globalEvent.PLAYER_FLY_COMPLETE, this, () => {
                clientCore.PeopleManager.getInstance().player.showProgress(this._progress);
                this._mask.x = -this._mask.width;
                Laya.Tween.to(this._mask, { x: 0 }, 1000, null, Laya.Handler.create(this, () => {
                    this._progress.removeSelf();
                    net.sendAndWait(new pb.cs_eat_family_party_food({ id: index, fmlId: clientCore.FamilyMgr.ins.familyId })).then((data: pb.sc_eat_family_party_food) => {
                        this._activityInfo.buffs[index - 1] = data.buff;
                        this.updateBuffInfo();
                    })
                 }));
            });
        }
        addActivityInfoUI() {
            this._activityInfoUI = new ui.familyPartyBean.ActivityInfoUI();
            clientCore.LayerManager.uiLayer.addChild(this._activityInfoUI);
            this._activityInfoUI.anchorX = 0.5;
            this._activityInfoUI.x = Laya.stage.width / 2;
            this._activityInfoUI.y = 10;
        }
        addBuffInfoUI() {
            this._buffInfoUI = new ui.familyPartyBean.BuffInfoUI();
            this._buffInfoUI.x = 10;
            this._buffInfoUI.anchorY = 0.5;
            this._buffInfoUI.y = Laya.stage.height / 2;
            clientCore.LayerManager.uiLayer.addChild(this._buffInfoUI);
            this._buffItemArr = [];
            for (let i = 1; i < 4; i++) {
                let item = new familyParty.BuffItem(this._buffInfoUI["buff_" + i]);
                this._buffItemArr.push(item);
                BC.addEvent(this, this._buffInfoUI["buff_" + i], Laya.Event.MOUSE_DOWN, this, this.showBuffTips, [item]);
                BC.addEvent(this, this._buffInfoUI["buff_" + i], Laya.Event.MOUSE_UP, this, this.hideTips);
                BC.addEvent(this, this._buffInfoUI["buff_" + i], Laya.Event.ROLL_OUT, this, this.hideTips);
            }
            this._buffInfoUI.boxTips.visible = false;
            this.updateBuffInfo();
        }
        showBuffTips(buff: familyParty.BuffItem) {
            this._buffInfoUI.boxTips.visible = true;
            this._buffInfoUI.txtBuffName.text = xls.get(xls.familyBuff).get(buff.buffID).name;
            this._buffInfoUI.txtTime.text = `持续${xls.get(xls.familyBuff).get(buff.buffID).buffContinue}秒`;
            if (buff.buffID == 5)
                this._buffInfoUI.txtTime.text = "";
            this._buffInfoUI.txtIntro.text = xls.get(xls.familyBuff).get(buff.buffID).description;
            this._buffInfoUI.boxTips.y = buff.mainUI.y + buff.mainUI.height / 2;
        }
        hideTips() {
            this._buffInfoUI.boxTips.visible = false;
        }
        updateBuffInfo() {
            let posID = 0;
            let now = clientCore.ServerManager.curServerTime;
            for (let i = 0; i < this._activityInfo.buffs.length; i++) {
                if (this._activityInfo.buffs[i].layer > 0) {
                    if (this._activityInfo.buffs[i].endTime <= now) {
                        this._activityInfo.buffs[i].layer = 0;
                        this._activityInfo.buffs[i].endTime = 0;
                        this._activityInfo.buffs[i].startTime = 0;
                        break;
                    }
                    this._buffItemArr[posID].show(this._activityInfo.buffs[i]);
                    posID++;
                }
            }
            for (let i = posID; i < 3; i++) {
                this._buffItemArr[i].hide();
            }
            let rewardIDArr = [];
            for (let i = 0; i < this._buffItemArr.length; i++) {
                let id = this._buffItemArr[i].checkGetBuffReward();
                if (id > 0) {
                    rewardIDArr.push(id);
                }
            }
            if (rewardIDArr.length > 0) {
                net.sendAndWait(new pb.cs_get_family_party_buff_rewards({ fmlId: clientCore.FamilyMgr.ins.familyId, buffId: rewardIDArr })).then((data: pb.sc_get_family_party_buff_rewards) => {
                    for (let info of data.items) {
                        alert.showFWords(`恭喜获得${clientCore.ItemsInfo.getItemName(info.id)} x${info.cnt}`);
                    }
                });
            }
        }
        private activityIsOver() {
            alert.showSmall("活动已经结束！", {
                callBack: { caller: this, funArr: [this.backToFamily, this.backToFamily] },
                btnType: alert.Btn_Type.ONLY_SURE,
                needMask: true,
                clickMaskClose: true,
                needClose: true,
            })
        }
        private backToFamily() {
            clientCore.MapManager.enterFamily(clientCore.FamilyMgr.ins.familyId, 2);
        }
        private update() {
            this.updateActivityTime();
            this.updateBalloonState();
            this.updateBuffInfo();
            this.updateRabbit();
        }
        private updateRabbit() {
            if (this._activityInfo.rabbitTime < clientCore.ServerManager.curServerTime) {
                this._rabbitBalloon.showRabbit();
            }
        }
        private updateBalloonState() {
            for (let i = 0; i < this._balloonDisTimeArr.length; i++) {
                if (this._balloonDisTimeArr[i] > 0) {
                    if (clientCore.ServerManager.curServerTime - this._balloonDisTimeArr[i] > 10) {
                        this._balloonDisTimeArr[i] = 0;
                        this._balloonUI["imgBalloon_" + i].visible = true;
                        this._balloonUI["balloon_" + i].visible = true;
                    }
                }
            }
        }
        private updateActivityTime() {
            let now = clientCore.ServerManager.curServerTime;
            if (now < this._activityInfo.endTime) {
                this._activityInfoUI.txtTime.text = util.StringUtils.getDateStr(this._activityInfo.endTime - now);
            }
            else {
                Laya.timer.clear(this, this.update);
                this.activityIsOver();
            }
        }
        addeventListeners() {
            BC.addEvent(this, this._activityInfoUI.btnLeaveActivity, Laya.Event.CLICK, this, this.backToFamily);
            net.listen(pb.sc_notify_family_party_items, this, this.refreshFlower);
        }
        refreshFlower(data: pb.sc_notify_family_party_items) {
            for (let info of data.pickItems) {
                for (let flower of this._flowerImgArr) {
                    if (info.posId == flower.posID) {
                        flower.visible = info.remain > 0;
                        flower.pos(info.pos.x,info.pos.y);
                    }
                }
            }
        }
        touch() {

        }
        redPointChange() {

        }
        destroy() {
            this._destroy = true;
            Laya.timer.clear(this, this.update);
            BC.removeEvent(this);
            net.unListen(pb.sc_notify_family_party_items, this, this.refreshFlower);
            this._destroy = true;
            this._activityInfoUI?.removeSelf();
            this._buffInfoUI?.destroy();
            this._bgMovie?.dispose();
            this._rabbitBalloon?.destroy();
        }
    }
}