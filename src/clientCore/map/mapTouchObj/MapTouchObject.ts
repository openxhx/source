namespace clientCore {
    /**
     * 地图触发信息
     * 
     */
    export class MapTouchObject extends Laya.Sprite {
        public mapObjXlsInfo: xls.mapTouchObj;
        public mapImg: Laya.Image;
        public mapBean: core.IMapBean;
        public redPointImg: Laya.Image;
        public redPointMovie: clientCore.Bone;
        init(xlsInfo: xls.mapTouchObj) {
            this.mapObjXlsInfo = xlsInfo;
            if (this.mapObjXlsInfo.uiName == "1005" && clientCore.LocalInfo.srvUserInfo.homeSkin != 0) {
                this.mapObjXlsInfo.uiName = "1005_" + clientCore.LocalInfo.srvUserInfo.homeSkin;
            }
            this.loadImg();
        }
        /**sprite需要有触发的宽高，这里需要先把触发的图片加载进来 */
        loadImg() {
            if (this.mapObjXlsInfo.uiName != "") {
                this.mapImg = new Laya.Image();
                res.load("res/mapObj/" + this.mapObjXlsInfo.uiName + ".png").then(() => {
                    this.mapImg.skin = "res/mapObj/" + this.mapObjXlsInfo.uiName + ".png";
                    this.size(this.mapImg.width, this.mapImg.height);
                    this.addChild(this.mapImg);
                    this.initRedPoint();
                    this.initBean();
                });
            }
            else {
                this.initRedPoint();
                this.initBean();
            }
        }
        initRedPoint() {
            if (this.mapObjXlsInfo.redPointID > 0) {
                if (this.mapObjXlsInfo.redPointType == 1) {
                    this.redPointImg = new Laya.Image();
                    this.redPointImg.skin = `commonRes/red.png`;
                    this.addChild(this.redPointImg);
                    this.redPointImg.pos(this.mapObjXlsInfo.redPointPos.x, this.mapObjXlsInfo.redPointPos.y);
                    this.redPointImg.visible = util.RedPoint.checkShow([this.mapObjXlsInfo.redPointID]);
                }
                else if (this.mapObjXlsInfo.redPointType == 2) {
                    // let showFlag = util.RedPoint.checkShow([this.mapObjXlsInfo.redPointID]);
                    this.redPointMovie = clientCore.BoneMgr.ins.play(`res/animate/mapTouchObj/${this.mapObjXlsInfo.redPointMovie}.sk`, 0, true, this);
                    this.redPointMovie.pos(this.mapObjXlsInfo.redPointPos.x, this.mapObjXlsInfo.redPointPos.y);
                    this.redPointMovie.visible = util.RedPoint.checkShow([this.mapObjXlsInfo.redPointID]);
                }
            }
        }
        initBean() {
            if (this.mapObjXlsInfo.type == 3) {
                let nameArr = this.mapObjXlsInfo.moduleName.split(".");
                this.mapBean = new window[nameArr[0]][nameArr[1]]();
                this.mapBean.start(this, this.mapObjXlsInfo.data);
                this.mapBean.redPointChange();
            }
        }
        touch() {
            switch (this.mapObjXlsInfo.type) {
                case 1://打开模块
                    ModuleManager.open(this.mapObjXlsInfo.moduleName);
                    break;
                case 2://跳转地图
                    this.enterMap(this.mapObjXlsInfo);
                    break;
                case 3://地图bean
                    this.mapBean.touch();
                    break;
                default:
                    break;
            }
        }
        enterMap(mapObjXlsInfo: xls.mapTouchObj) {
            let enterMapID = mapObjXlsInfo.enterMapID;
            let mapInfo: xls.map = xls.get(xls.map).get(enterMapID);
            switch (mapInfo.mapType) {
                case 1:
                    MapManager.enterHome(LocalInfo.uid);
                    break;
                case 2:
                    FamilyMgr.ins.openFamily();
                    break;
                case 3:
                    MapManager.enterParty(LocalInfo.uid);
                    break;
                case 4:
                    MapManager.enterWorldMap(LocalInfo.uid);
            }
        }

        redPointChange() {
            if (!this.mapObjXlsInfo)
                return
            if (this.redPointImg) {
                this.redPointImg.visible = util.RedPoint.checkShow([this.mapObjXlsInfo.redPointID]);
            }
            if (this.redPointMovie) {
                this.redPointMovie.visible = util.RedPoint.checkShow([this.mapObjXlsInfo.redPointID]);
            }
            if (this.mapBean) {
                this.mapBean.redPointChange();
            }
        }

        skinChange(id: number) {
            if (this.mapObjXlsInfo.uiName.split("_")[0] != "1005") return;
            if (id == 0) {
                this.mapObjXlsInfo.uiName = "1005";
            } else {
                this.mapObjXlsInfo.uiName = "1005_" + id;
            }
            res.load("res/mapObj/" + this.mapObjXlsInfo.uiName + ".png").then(() => {
                this.mapImg.skin = "res/mapObj/" + this.mapObjXlsInfo.uiName + ".png";
                this.size(this.mapImg.width, this.mapImg.height);
            });
        }

        destroy() {
            this.mapObjXlsInfo = null;
            if (this.mapBean) {
                this.mapBean.destroy();
            }
            this.mapImg = null;
            this.removeSelf();
        }
    }
}