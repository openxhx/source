
namespace mapBean {
    /**
     * 结缘礼进行场景bean
     */
    enum WEDDING_STATE {
        WAIT_START,
        GOING,
        FLOWER,
        END
    }

    interface BagInfo {
        xlsInfo: xls.cpPick,
        img: Laya.Image;
    }

    export class WeddingLiveGoingBean implements core.IMapBean {
        private _weddingInfo: pb.Isc_get_map_wedding_info;
        private _npcBone: clientCore.Bone;
        private _npcTitle: Laya.Label;
        private _npcTitleImg: Laya.Image;
        private _imgFlower: Laya.Image;
        private _bagMap: util.HashMap<BagInfo>;
        private _destroy: boolean = false;
        private _mainUI: ui.weddingLive.WeddingLiveEnterBeanUI;
        private _mapEffect: clientCore.Bone;
        private _fireWorkArr: clientCore.Bone[] = [];

        async start() {
            this._bagMap = new util.HashMap();
            await this.getWeddingInfo();
            await clientCore.ModuleManager.loadatlas('weddingLive');
            if (this._destroy)
                return;
            this.loadNpcRes();
            this.initBagMap();
            this.initUI();
            this.initMapEffect();
            this.handleBagNum(this._weddingInfo.lbCounts);
            net.listen(pb.sc_wedding_procedure_notify, this, this.onWeddingStateChange);
            net.listen(pb.sc_wedding_map_items_change_notify, this, this.onMapItemChange);
            BC.addEvent(this, EventManager, globalEvent.HUD_DISPLAY_CHANGE, this, this.onUIStateChange);
            BC.addEvent(this, EventManager, globalEvent.CHANGE_WEDDING_BAG_VISIBLE, this, this.onBagVisibleChange);
        }

        private initBagMap() {
            let allXls = _.filter(xls.get(xls.cpPick).getValues(), o => o.type == 1);
            for (const o of allXls) {
                this._bagMap.add(o.id, { img: null, xlsInfo: o });
            }
        }

        private initMapEffect() {
            if (clientCore.MapInfo.mapID == 21) {
                this._mapEffect = clientCore.BoneMgr.ins.play('res/animate/wedding/fluorescent.sk', 0, true, clientCore.LayerManager.mapLayer);
                this._mapEffect.pos(1800, 800);
            }
            else {
                this._mapEffect = clientCore.BoneMgr.ins.play('res/animate/wedding/hua.sk', 0, true, clientCore.LayerManager.mapLayer);
                this._mapEffect.pos(1500, 800);
            }
        }

        private initUI() {
            if (this._destroy)
                return;
            this._mainUI = new ui.weddingLive.WeddingLiveEnterBeanUI();
            this._mainUI.anchorX = 0.5;
            this._mainUI.x = Laya.stage.width / 2;
            this._mainUI.y = -10;
            this._mainUI.mouseThrough = true;
            this._mainUI.btnEnter.visible = this._mainUI.btnVisit.visible = false;
            Laya.timer.loop(1000, this, this.onTimer);
            this.onTimer();
            clientCore.LayerManager.uiLayer.addChild(this._mainUI);
            BC.addEvent(this, this._mainUI.btnExit, Laya.Event.CLICK, this, this.onExit);
            BC.addEvent(this, EventManager, globalEvent.PEOPLE_MAP_CREATE_OVER, this, this.onPeopleCreateOver)
        }

        private onExit() {
            clientCore.MapManager.enterHome(clientCore.LocalInfo.uid);
        }

        private getWeddingInfo() {
            return net.sendAndWait(new pb.cs_get_map_wedding_info()).then((data: pb.sc_get_map_wedding_info) => {
                this._weddingInfo = data;
                if (this._weddingInfo.cpIds.indexOf(clientCore.LocalInfo.uid) > -1) {
                    clientCore.PeopleManager.getInstance().player.showTitle(`res/animate/wedding/${clientCore.LocalInfo.sex == 1 ? 'female' : 'male'}.png`);
                }
                EventManager.event(globalEvent.CP_RED_BAG_TIME_CHANGE, data.lbTime);
            })
        }

        private onPeopleCreateOver(data: pb.IUserBase) {
            let cpId = _.find(this._weddingInfo.cpIds, id => id == data.userid);
            if (cpId) {
                let person = clientCore.PeopleManager.getInstance().getOther(cpId);
                person?.showTitle(`res/animate/wedding/${data.sex == 1 ? 'female' : 'male'}.png`);
            }
        }

        private loadNpcRes() {
            let config = xls.get(xls.cpCommonDate).get(1);
            let mapIdx = _.clamp(_.findIndex(config.weddingMap, clientCore.MapInfo.mapID), 0, config.weddingMap.length - 1);
            let npcInfo = config.location[mapIdx];
            this._npcBone = clientCore.BoneMgr.ins.play(`res/animate/randomEvent/${npcInfo.v1}/0000.sk`, 0, true, clientCore.MapManager.peopleLayer, null, true);
            BC.addEvent(this, this._npcBone, Laya.Event.CLICK, this, this.onNpcClick);
            this._npcBone.pos(npcInfo.v2, npcInfo.v3);
            this._npcTitle = new Laya.Label();
            this._npcTitle.color = '#fe8799';
            this._npcTitle.width = 240;
            this._npcTitle.fontSize = 30;
            this._npcTitle.font = "汉仪中圆简";
            this._npcTitle.align = "center";
            this._npcTitle.text = '结缘礼司仪'
            this._npcTitle.pos(this._npcBone.x - 120, this._npcBone.y - 150);
            this._npcTitleImg = new Laya.Image('weddingLive/wenzidi.png');
            this._npcTitleImg.anchorX = this._npcTitleImg.anchorY = 0.5;
            this._npcTitleImg.scale(1.5, 1.5)
            this._npcTitleImg.pos(this._npcBone.x, this._npcBone.y - 135);
            window['img'] = this._npcTitleImg;
            clientCore.MapManager.peopleLayer.addChild(this._npcTitleImg)
            clientCore.MapManager.peopleLayer.addChild(this._npcTitle)
        }

        private onNpcClick() {
            if (this._weddingInfo.cpIds.indexOf(clientCore.LocalInfo.uid) > -1) {
                clientCore.ModuleManager.open('weddingLive.WeddingProcedureModule', this._weddingInfo?.procedure ?? 0);
            }
        }

        private onWeddingStateChange(data: pb.sc_wedding_procedure_notify) {
            this._weddingInfo.procedure = data.type;
            if (data.type == WEDDING_STATE.GOING) {
                clientCore.ModuleManager.closeAllOpenModule();
                clientCore.ModuleManager.open('weddingGoing.WeddingGoingModule', this._weddingInfo.cpIds);
                Laya.timer.loop(40000, this, this.playFireWork);
            }
            else if (data.type == WEDDING_STATE.FLOWER) {
                //开始捧花
                let mapIdx = clientCore.MapInfo.mapID == 21 ? 0 : 1;
                let flowerPos = _.shuffle(_.find(xls.get(xls.cpPick).getValues(), o => o.type == 2).position)[mapIdx];
                let ranRange = xls.get(xls.cpCommonDate).get(1).randomRange;
                this._imgFlower = new Laya.Image('res/animate/wedding/flower.png');
                this._imgFlower.pos(flowerPos.v1 + _.random(ranRange[0], ranRange[1]), flowerPos.v2 + _.random(ranRange[0], ranRange[1]), true);
                clientCore.LayerManager.mapLayer.addChild(this._imgFlower);
                BC.addEvent(this, this._imgFlower, Laya.Event.CLICK, this, this.onFlowerClick);
            }
            else if (data.type == WEDDING_STATE.END) {
                //移除捧花
                BC.removeEvent(this, this._imgFlower);
                this._imgFlower?.destroy();
            }
            EventManager.event(globalEvent.WEDDING_PROCEDURE_STATE_CHANGE, data.type);
        }

        /**福袋数目变化 */
        private onMapItemChange(data: pb.sc_wedding_map_items_change_notify) {
            this.handleBagNum(data.counts);
        }

        /**点击捧花 */
        private onFlowerClick() {
            net.sendAndWait(new pb.cs_pick_wedding_item({ type: 2 })).then((data: pb.sc_pick_wedding_item) => {
                if (data.isOver == 0) {
                    alert.showReward(data.items);
                    this._imgFlower?.destroy();
                }
            })
        }

        private onUIStateChange() {
            if (this._mainUI) {
                this._mainUI.visible = !clientCore.UIManager.isHide();
            }
        }

        private onBagVisibleChange(visible: boolean) {
            for (const o of this._bagMap.getValues()) {
                if (o.img && !o.img.destroyed) {
                    o.img.visible = visible
                }
            }
        }

        /**点击福袋 */
        private onBagClick(id: number) {
            if ((clientCore.ServerManager.curServerTime - this._weddingInfo.lbTime) < 60) {
                alert.showFWords('稍等片刻再领取哦~');
                return;
            }
            net.sendAndWait(new pb.cs_pick_wedding_item({ type: 1 })).then((data: pb.sc_pick_wedding_item) => {
                if (data.isOver == 0) {
                    alert.showReward(data.items);
                    //删除点的那个
                    let img = this._bagMap.get(id).img;
                    if (img) {
                        img.offAll();
                        img.destroy();
                        img = null;
                    }
                    this._bagMap.get(id).img = null;
                    //同步福袋数据
                    this.handleBagNum(data.counts);
                }
                else {
                    this.handleBagNum(data.counts);
                    alert.showFWords('没有抢到哦，再试试');
                }
                this._weddingInfo.lbTime = data.pickTime;
                EventManager.event(globalEvent.CP_RED_BAG_TIME_CHANGE, data.pickTime);
            })
        }

        touch() {
        }

        redPointChange() {
        }

        /**处理福袋数量变化 */
        private handleBagNum(num: number) {
            //算一下当前有几个福袋
            let nowNum = _.reduce(this._bagMap.getValues(), (prev, curr) => { return prev + (curr.img == null ? 0 : 1) }, 0);
            if (nowNum > num) {
                //多了 要删掉一个
                let arr = this._bagMap.toArray()
                for (let i = 0; i < arr.length; i++) {
                    let o = arr[i][1];
                    if (o.img) {
                        o.img.offAll();
                        o.img.destroy();
                        o.img = null;
                        break;
                    }
                }
            }
            else if (nowNum < num) {
                //数量已经超过地图所有配置点
                if (nowNum == this._bagMap.length)
                    return
                //需要增加
                let arr = this._bagMap.toArray()
                for (let i = 0; i < arr.length; i++) {
                    let o = arr[i][1];
                    if (o.img == null) {
                        o.img = new Laya.Image('res/animate/wedding/bag.png');
                        let mapIdx = clientCore.MapInfo.mapID == 21 ? 0 : 1;
                        let pos = o.xlsInfo.position[mapIdx];
                        o.img.pos(pos.v1, pos.v2, true);
                        // o.img.pos(1178 + i * 50, 934);
                        clientCore.LayerManager.mapLayer.addChild(o.img);
                        o.img.on(Laya.Event.CLICK, this, this.onBagClick, [o.xlsInfo.id]);
                    }
                }
            }
            //如果福袋数目和后台还没一致，继续处理一次,或者还没到达
            if (nowNum != num)
                this.handleBagNum(num);
        }

        private onTimer() {
            //判断当前有没有结缘礼正在举行
            let openTime = this._weddingInfo?.startTime ?? 0;
            if (openTime > 0) {
                let countDown = openTime - clientCore.ServerManager.curServerTime + 3600;
                if (countDown >= 0) {
                    this._mainUI.txtTime.text = util.StringUtils.getDateStr2(countDown, '{min}:{sec}');
                }
                else {
                    Laya.timer.clear(this, this.onTimer);
                    alert.showSmall('结缘礼已结束，即将回到家园', { btnType: alert.Btn_Type.ONLY_SURE, needClose: false, callBack: { caller: this, funArr: [this.onExit] } })
                }
            }
        }

        private async playFireWork() {
            Laya.timer.clear(this, this.playFireWork);
            let posArr = clientCore.MapInfo.mapID == 21 ? [[2063, 1113], [2225, 773], [913, 1192]] : [[1248, 1517], [2470, 1332]];
            let fireWokId = clientCore.MapInfo.mapID == 21 ? 3200003 : 3200004;
            for (const pos of posArr) {
                if (this._destroy)
                    return;
                let bone = clientCore.BoneMgr.ins.play(pathConfig.getFunnyToySk(fireWokId), 0, false, clientCore.LayerManager.mapLayer);
                bone.scaleX = bone.scaleY = 1.5;
                bone.pos(pos[0], pos[1]);
                this._fireWorkArr.push(bone);
                await util.TimeUtil.awaitTime(1000);
            }
        }

        destroy() {
            for (const o of this._fireWorkArr) {
                o.dispose();
            }
            this._destroy = true;
            Laya.timer.clear(this, this.playFireWork);
            BC.removeEvent(this);
            net.unListen(pb.sc_wedding_procedure_notify, this, this.onWeddingStateChange);
            net.unListen(pb.sc_wedding_map_items_change_notify, this, this.onMapItemChange);
            this._npcBone?.dispose(true);
            this._npcTitle?.destroy();
            this._npcTitleImg?.destroy();
            this._imgFlower?.destroy();
            Laya.timer.clear(this, this.onTimer);
            this._mainUI?.destroy();
            this._mapEffect?.dispose(true);
            for (const o of this._bagMap.getValues()) {
                if (o.img && !o.img.destroyed) {
                    o.img.destroy()
                }
            }
            clientCore.TitleManager.ins.showTitle(clientCore.TitleManager.ins.titleId);
            this._bagMap.clear();
        }
    }
}