
namespace clientCore {
    /**
     * 
     */
    export class MapExpand {
        /** 已经扩建的区域ID */
        public readonly expandAreaIDArr: number[];
        /** 目前能进行扩建的数组 */
        private _curCanExpandIdArr: number[];
        /** 扩建按钮hash */
        private _expandItemMap: util.HashMap<MapExpandBtn>;
        /**杂草hash */
        private _blockItemMap: util.HashMap<Laya.Image>;
        /**地图扩展坐标json（阴影 杂草的位置） */
        private _mapExpandPosJson: Object;

        /**当前显示的阴影图 */
        private _currShadowImg: Laya.Image;

        constructor(arr: number[]) {
            this.expandAreaIDArr = arr;
            this._curCanExpandIdArr = [];
            this._expandItemMap = new util.HashMap();
            this._blockItemMap = new util.HashMap();
        }

        public getRandomExpandId() {
            return this._curCanExpandIdArr[0];
        }

        public async setUp() {
            let xmlInfo = xls.get(xls.extensionBase);
            //当前已扩建区域的关联区域
            this._curCanExpandIdArr = _.flatten(_.map(this.expandAreaIDArr, (id) => { return xmlInfo.get(id).nextArea }));
            //加上 初始可扩建的区域
            this._curCanExpandIdArr = this._curCanExpandIdArr.concat(_.filter(xmlInfo.getValues(), { isItial: 1 }).map((o) => { return o.areaID }));
            //去重 去掉已扩建区域
            this._curCanExpandIdArr = _.uniq(this._curCanExpandIdArr).filter((id) => { return this.expandAreaIDArr.indexOf(id) == -1 });

            MapManager.curMap.mapGridData.expandAreas(this.expandAreaIDArr);
            await res.load('res/map/expandUI/mapExpand.json', 'json');
            await res.load('res/animate/expand/expandReward.png');
            this._mapExpandPosJson = res.get('res/map/expandUI/mapExpand.json');
            this.createLockBtns();
            this.refreshMapItemsState();
            EventManager.on(globalEvent.MAP_SCALE, this, this.onMapScale);
            // EventManager.on(globalEvent.NEW_PLAYER_GUIDE_SHOW_MASK_UI, this, this.findGuideHoleInfo);
        }

        private onMapScale(s: number) {
            s = 1 / s;
            let arr = this._expandItemMap.getValues();
            for (const iterator of arr) {
                iterator.scale(s, s, true);
            }
        }

        private playExpandAni(areaId: number) {
            core.SoundManager.instance.playSound(pathConfig.getSoundUrl('extend'));
            let ani = BoneMgr.ins.play(`res/animate/expand/expand_${Math.floor(areaId / 100)}.sk`, 0, false, MapManager.mapExpandLayer);
            let pos = xls.get(xls.extensionBase).get(areaId).btn_position;
            ani.pos(pos.v1, pos.v2);
            return new Promise((ok) => {
                ani.once(Laya.Event.COMPLETE, this, ok);
            })
        }

        private refreshMapItemsState() {
            let allBtns = this._expandItemMap.getValues();
            for (const btn of allBtns) {
                btn.canExpandFlag = this._curCanExpandIdArr.indexOf(btn.areaId) > -1;
            }
        }

        private clearAllFocusAreaBtn() {
            for (const btn of this._expandItemMap.getValues()) {
                btn.currFocus = false;
            }
        }

        /**开始扩建流程 */
        public expandArea(id: number, clickPos: Laya.Point) {
            if (this._curCanExpandIdArr.indexOf(id) > -1) {
                //能扩建
                //满足扩建条件 先发协议 然后播动画 动画完成后才会移除
                let currBtn = this._expandItemMap.get(id);
                currBtn.globalToLocal(clickPos, false);
                if (clickPos.x > 48 && currBtn.currFocus) //点到了扩建
                {
                    if (GuideMainManager.instance.curGuideInfo.operationBehavior == "clickRealExpandBtn") {
                        EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
                        MapManager.curMap.mapExpend.findLoakBtnById(105).imgFlg.disabled = false;
                    }
                    ModuleManager.open("mapExpand.MapExpandModule", id);
                }
                else if (clickPos.x < 48) {
                    if (currBtn.imgFlg.disabled == true) {
                        return;
                    }
                    //如果当前要显示一个，则先将所有的按钮都重置
                    if (!currBtn.currFocus)
                        this.clearAllFocusAreaBtn();
                    //切换显示地块范围
                    currBtn.currFocus = !currBtn.currFocus;
                    this.showFocusAreaShadow(currBtn.currFocus ? id : -1);
                    if (GuideMainManager.instance.curGuideInfo.operationBehavior == "clickMapExpandBtn") {
                        EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
                    }
                }
            }
            else {
                alert.showFWords("当前位置还不能扩建，去其他位置看看吧");
            }
        }

        /** 展示地块范围阴影 */
        private showFocusAreaShadow(id: number) {
            if (id == -1) {
                if (this._currShadowImg)
                    this._currShadowImg.removeSelf();
            }
            else {
                this._currShadowImg = this._currShadowImg || new Laya.Image();
                let skin = 'res/map/expandUI/mask/' + id + '.png';
                if (this._currShadowImg.skin != skin) {
                    this._currShadowImg.visible = false;
                    this._currShadowImg.once(Laya.Event.LOADED, this, () => { this._currShadowImg.visible = true; });
                }
                this._currShadowImg.skin = skin;
                let pos = this._mapExpandPosJson[id.toString()].mask;
                this._currShadowImg.pos(pos[0], pos[1], true);
                //找层级(杂草层上 按钮层下)
                let currClickBtn = this._expandItemMap.get(id)
                for (let i = 0; i < MapManager.mapExpandLayer.numChildren; i++) {
                    const element = MapManager.mapExpandLayer.getChildAt(i);
                    if (element == currClickBtn) {
                        MapManager.mapExpandLayer.addChildAt(this._currShadowImg, i - 1);
                        break;
                    }
                }
            }
        }

        async startExpand(areaId: number, isDebug: boolean) {
            if (this._curCanExpandIdArr.indexOf(areaId) == -1) {
                return;
            }
            //先隐藏按钮
            let expandBtn = this._expandItemMap.get(areaId);
            expandBtn.visible = false;

            if (this._currShadowImg)
                this._currShadowImg.visible = false;
            UIManager.close();
            LayerManager.mapLayer.mouseEnabled = false;
            await this.tweenMap(expandBtn);
            await this.playExpandAni(areaId);
            let rewards: pb.IItemInfo[];
            try {
                rewards = await this.reqSrvMapExpand(areaId, isDebug);
            }
            catch (e) {
                //出现异常,显示按钮
                expandBtn.visible = true;
                if (this._currShadowImg)
                    this._currShadowImg.visible = true;
            }
            if (rewards != undefined) {
                //更新数据
                this.expandAreaIDArr.push(areaId);
                let nextArr = this.findNextCanExpandArea(areaId);
                this._curCanExpandIdArr = _.pull(this._curCanExpandIdArr, areaId);//移除当前扩建区域
                this._curCanExpandIdArr = this._curCanExpandIdArr.concat(nextArr);//新增扩建后的关联区域
                MapManager.curMap.mapGridData.expandAreas([areaId]);
                //删除按钮
                this._expandItemMap.remove(areaId).destroy();
                this.clearAllFocusAreaBtn();
                this.showFocusAreaShadow(-1);
                this.refreshMapItemsState();
                //删除杂草
                this._blockItemMap.remove(areaId).destroy();
                this.handleSpecialBlock();
                if (rewards.length > 0) {
                    await this.playRewardBoxAni(expandBtn);
                    alert.showReward(GoodsInfo.createArray(rewards), '扩建奖励', {
                        btnType: alert.Btn_Type.ONLY_SURE, callBack: {
                            funArr: [() => { this.showBuildAlert(areaId) }],
                            caller: this
                        }
                    });
                }
                else {
                    this.showBuildAlert(areaId);
                }
            }
            UIManager.open();
            LayerManager.mapLayer.mouseEnabled = true;
        }

        private showBuildAlert(areaId: number): void {
            let buildingId = xls.get(xls.extensionBase).get(areaId).building;
            buildingId != 0 && alert.showRewardAlert(buildingId);
        }

        private playRewardBoxAni(btn: MapExpandBtn) {
            let sp = util.DisplayUtil.createMask();
            LayerManager.alertLayer.addChild(sp);
            return new Promise((ok) => {
                let ani = BoneMgr.ins.play('res/animate/expand/expandReward.sk', 0, false, LayerManager.alertLayer);
                ani.pos(Laya.stage.width / 2, Laya.stage.height / 2);
                ani.on(Laya.Event.COMPLETE, this, () => {
                    sp.destroy();
                    sp.removeSelf();
                    ok();
                });
            })

        }

        private tweenMap(btn: MapExpandBtn) {
            let p_screen = btn.localToGlobal(new Laya.Point(), false);
            p_screen.x = LayerManager.mapLayer.x + Laya.stage.width / 2 - p_screen.x;
            p_screen.y = LayerManager.mapLayer.y + Laya.stage.height / 2 - p_screen.y;
            p_screen.x = _.clamp(p_screen.x, -(MapInfo.mapWidth * MapInfo.mapScale - Laya.stage.width), 0);
            p_screen.y = _.clamp(p_screen.y, -(MapInfo.mapHeight * MapInfo.mapScale - Laya.stage.height), 0);
            return new Promise((ok) => {
                Laya.Tween.to(LayerManager.mapLayer, { x: p_screen.x, y: p_screen.y }, 300, null, Laya.Handler.create(this, ok));
            })
        }

        private reqSrvMapExpand(areaId: number, isDebug: boolean) {
            return net.sendAndWait(new pb.cs_map_open_area({ mapId: clientCore.MapInfo.mapID, areaId: areaId, isDebug: isDebug ? 1 : 0 }))
                .then((data: pb.sc_map_open_area) => {
                    return Promise.resolve(data.awardInfo);
                });
        }

        /**
         * 加载锁的UI
         */
        private createLockBtns() {
            let allAreaArr = xls.get(xls.extensionBase).getValues();
            //杂草装饰
            for (let area of allAreaArr) {
                if (this.expandAreaIDArr.indexOf(area.areaID) > -1) {
                    continue;
                }
                let block = new Laya.Image('res/map/expandUI/deco/' + area.areaID + '.png');
                let blockpos = this._mapExpandPosJson[area.areaID.toString()].deco;
                block.pos(blockpos[0], blockpos[1], true);
                MapManager.mapExpandLayer.addChild(block);
                this._blockItemMap.add(area.areaID, block);
            }
            this.handleSpecialBlock();
            //解锁按钮
            for (let area of allAreaArr) {
                if (this.expandAreaIDArr.indexOf(area.areaID) > -1) {
                    continue;
                }
                let expandItem = new MapExpandBtn(area.areaID);
                MapManager.mapExpandLayer.addChild(expandItem);
                expandItem.pos(area.btn_position.v1, area.btn_position.v2);
                this._expandItemMap.add(area.areaID, expandItem);
            }
        }
        /**处理特殊的地块
         * 1: 101 102 103都解锁后，显示sp_1
         */
        private handleSpecialBlock() {
            let checkArr: Array<{ idArr: number[], spName: string }> = [{ idArr: [101, 102, 103], spName: 'sp_1' }];
            for (const spInfo of checkArr) {
                let intersArr = _.intersection(spInfo.idArr, this.expandAreaIDArr);
                if (intersArr.length == spInfo.idArr.length) {
                    let block = new Laya.Image(`res/map/expandUI/deco/${spInfo.spName}.png`);
                    let blockpos = this._mapExpandPosJson[spInfo.spName].deco;
                    block.pos(blockpos[0], blockpos[1], true);
                    MapManager.mapExpandLayer.addChild(block);
                }
            }
        }

        private findNextCanExpandArea(id: number): number[] {
            let arr = [];
            let nextArr = xls.get(xls.extensionBase).get(id).nextArea;
            for (let nextId of nextArr) {
                if (this.expandAreaIDArr.indexOf(nextId) < 0 && this._curCanExpandIdArr.indexOf(nextId) < 0) {
                    arr.push(nextId);
                }
            }
            return arr;
        }

        public findLoakBtnById(id: number): MapExpandBtn {
            return this._expandItemMap.get(id);
        }

        destroy() {
            EventManager.off(globalEvent.MAP_SCALE, this, this.onMapScale);
            this._blockItemMap.clear();
            this._expandItemMap.clear();
            if (this._mapExpandPosJson)
                this._mapExpandPosJson = null;
            if (this._currShadowImg) {
                this._currShadowImg.destroy(true);
                this._currShadowImg = null;
            }
        }
    }
}