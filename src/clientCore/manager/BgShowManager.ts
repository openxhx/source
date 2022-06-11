namespace clientCore {
    /**背景秀，舞台，坐骑管理器 */
    export class BgShowManager {
        private static _instance: BgShowManager;
        private _decoShowInfoMap: util.HashMap<BgShowInfo>;
        /**当前穿着的id没有为0  k：类型 v：id */
        private _currDecoIdMap: util.HashMap<number>;

        private _fullScreenBgShow: BgImage; //全屏背景秀
        private _module: core.BaseModule; //全屏背景秀所在的模块
        private _mouseThrough: boolean; //模块的穿透状态

        private _dynamicStage: clientCore.Bone;

        static get instance() {
            this._instance = this._instance || new BgShowManager();
            return this._instance;
        }

        constructor() {
            this._decoShowInfoMap = new util.HashMap();
            this._currDecoIdMap = new util.HashMap();
            this._currDecoIdMap.add(CLOTH_TYPE.Bg, 0);
            this._currDecoIdMap.add(CLOTH_TYPE.Stage, 0);
            this._currDecoIdMap.add(CLOTH_TYPE.Rider, 0);
            let hash = xls.get(xls.bgshow).getValues();
            for (const iterator of hash) {
                this._decoShowInfoMap.add(iterator.id, new BgShowInfo(iterator.id));
            }
            net.listen(pb.sc_add_time_limit_attire_notify, this, this.onDecoInfoChange);
        }

        /**根据类型查找对应的装饰id
         * @param arr id数组
         * @param type 装饰类型（背景，舞台，坐骑）
         * @reutrn 返回id，没有找到返回0
         */
        static filterDecoIdByType(arr: number[], type: CLOTH_TYPE.Bg | CLOTH_TYPE.Rider | CLOTH_TYPE.Stage) {
            let xlsHash = xls.get(xls.bgshow);
            let idx = _.findIndex(arr, (id) => { return xlsHash.has(id) && xlsHash.get(id).clothKind == type });
            return idx > -1 ? arr[idx] : 0;
        }

        setup() {
            return new Promise((ok) => {
                net.sendAndWait(new pb.cs_get_time_limit_attire()).then((data: pb.sc_get_time_limit_attire) => {
                    for (let o of data.timeLimitAttire) {
                        let info = this._decoShowInfoMap.get(o.attireId)
                        info?.setSrvInfo(o);
                        if (info && info.srvInfo.state == 1) {
                            this._currDecoIdMap.add(info.xlsInfo.clothKind, info.id);
                        }
                    }
                })
            })
        }

        /**当前穿着的背景秀id */
        get currBgShowId() {
            return this._currDecoIdMap.get(CLOTH_TYPE.Bg);
        }

        get currStageId() {
            return this._currDecoIdMap.get(CLOTH_TYPE.Stage);
        }

        get currRider() {
            return this._currDecoIdMap.get(CLOTH_TYPE.Rider);
        }

        /**判断某个坐骑/背景秀是不是可以双人显示 */
        checkIsDouble(id: number) {
            let isCoupe = xls.get(xls.bgshow).get(id)?.couple ?? 1;
            return isCoupe == 2;
        }

        /**根据类型获取当前穿着的装饰 */
        getcurrDecoByType(type: CLOTH_TYPE.Bg | CLOTH_TYPE.Rider | CLOTH_TYPE.Stage) {
            return this._currDecoIdMap.get(type);
        }

        /**返回所有装饰信息（包括未获得的） */
        allDecoShowInfos() {
            return this._decoShowInfoMap.getValues();
        }

        /**返回已有的装饰信息 */
        allHaveDecoShowInfos() {
            return _.filter(this._decoShowInfoMap.getValues(), (o) => { return o.srvInfo != undefined });
        }

        /**根据id获取装饰信息 */
        getDecoInfoById(id: number) {
            return this._decoShowInfoMap.get(id);
        }

        /**去除new标签 */
        setNewStateOff(id: number) {
            if (this._decoShowInfoMap.get(id)?.isNew) {
                this._decoShowInfoMap.get(id).setNewOff();
                net.send(new pb.cs_set_time_limit_attire_isnew({ attireId: id }));
            }
        }

        /**判断是否拥有背景秀,舞台，坐骑（有效期内或无限都算拥有） */
        checkHaveBgShow(id: number) {
            let info = this.getDecoInfoById(id);
            return info && info.restTime != 0;
        }

        /**设置当前要穿的装饰，0就是脱下 */
        setCurrDecoShow(map: util.HashMap<number>) {
            let upIds = _.filter(map.getValues(), id => id > 0);
            let sendData = new pb.cs_set_time_limit_attire_state();
            sendData.attireId = _.filter(upIds, (id) => {
                return this.getDecoInfoById(id).restTime != 0;
            })
            //有需要续费的，提示续费
            let needContinueIds = _.difference(upIds, sendData.attireId);
            if (needContinueIds.length > 0)
                EventManager.event('CLOTHCHANGE_NEED_CONTINUE_BG', { arr: needContinueIds });
            return net.sendAndWait(sendData).then((data: pb.sc_set_time_limit_attire_state) => {
                for (const type of this._currDecoIdMap.getKeys()) {
                    this._currDecoIdMap.add(type, 0);
                }
                for (let id of data.attireId) {
                    let info = this._decoShowInfoMap.get(id);
                    if (info) {
                        this._currDecoIdMap.add(info.xlsInfo.clothKind, info.id);
                    }
                }
            })
        }

        private onDecoInfoChange(data: pb.sc_add_time_limit_attire_notify) {
            this._decoShowInfoMap.get(data.timeLimitAttire.attireId)?.setSrvInfo(data.timeLimitAttire);
        }

        /**
         * 展示全屏背景秀
         * @param 当前展示的模块
         * @param path 资源地址
         */
        async createFullScreenBgShow(module: core.BaseModule, path: string, parent?: Laya.Sprite): Promise<void> {
            if (!module.fullScreen && !parent) return; //不是全屏不显示且不是指定的父级
            await res.load(path);
            this._fullScreenBgShow = this._fullScreenBgShow || new BgImage();
            this._fullScreenBgShow.skin = path;
            if (!this._fullScreenBgShow.parent) {
                this._mouseThrough = module.mouseThrough;
                this._module = module;
                this._module.mouseThrough = true; //需要移动底部的话 需要穿透
                parent ? parent.addChild(this._fullScreenBgShow) : clientCore.LayerManager.bgshowLayer.addChild(this._fullScreenBgShow);
            }
        }
        hideFullScreenBgShow(): void {
            if (!this._fullScreenBgShow || !this._fullScreenBgShow.parent) return;
            this._module.mouseThrough = this._mouseThrough;
            this._module = null;
            this._fullScreenBgShow.removeSelf();
        }

        /**
         * 获取动态舞台
         */
        async createDynamicStage(id: number, parent: any, pos: number = 0, x: number = 0, y: number = 0) {
            this.hideDynamicStage();
            await res.load(`res/itemUI/stage/animate/${id}.png`);
            await res.load(`res/itemUI/stage/animate/${id}.sk`);
            let config = xls.get(xls.bgshow).get(id);
            if (x == 0) x = config.blockPosArr[0].v1;
            if (y == 0) y = config.blockPosArr[0].v2;
            this._dynamicStage = clientCore.BoneMgr.ins.play(`res/itemUI/stage/animate/${id}.sk`, 0, true, parent, { addChildAtIndex: pos });
            this._dynamicStage.pos(x, y);
            return this._dynamicStage;
        }
        hideDynamicStage(): void {
            if (!this._dynamicStage || !this._dynamicStage.parent) return;
            this._dynamicStage.dispose();
            this._dynamicStage = null;
        }
    }


    class BgImage extends Laya.Image {

        private _dragRegion: Laya.Rectangle;
        constructor() { super(); }

        onEnable(): void {
            let width: number = Laya.stage.width - this.width;
            let height: number = Laya.stage.height - this.height;
            this._dragRegion = new Laya.Rectangle(width, height, Math.abs(width), Math.abs(height));
            this.on(Laya.Event.MOUSE_DOWN, this, this.onStartDrag);
        }

        onDisable(): void {
            this._dragRegion.recover();
            this._dragRegion = null;
            this.off(Laya.Event.MOUSE_DOWN, this, this.onStartDrag);
        }

        private onStartDrag(): void {
            this.startDrag(this._dragRegion);
        }
    }
}