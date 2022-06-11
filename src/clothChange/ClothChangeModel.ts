
namespace clothChange {
    export interface ImageSave {
        xlsInfo: xls.clothSave,
        srvData: pb.IUser_image
    }
    import clothType = clientCore.CLOTH_TYPE;
    const SCALE = clientCore.PeopleManager.BASE_SCALE * 2.5;
    const BIG_SCALE = SCALE * 1.7;
    const DIS = 120;
    const CP_SCALE_P = 0.8;
    export class ClothChangeModel {
        private static _instance: ClothChangeModel;
        private _allData: util.HashMap<clientCore.ClothInfo>;
        public module: core.BaseModule;
        public person: clientCore.Person;
        public cpPerson: clientCore.Person;
        public rider: clientCore.Bone;
        /**背景秀图片 */
        public bgShowImg: Laya.Image;
        /**舞台秀图片 */
        public stageShowImg: Laya.Image;
        /**当前是否显示cp */
        public showCP: boolean;
        private _lastSave: number[];
        private _imageSaveHash: util.HashMap<ImageSave>;
        /**当前选中的装饰字典 */
        private _currDecoSelectMap: util.HashMap<number>;

        static get instance(): ClothChangeModel {
            if (!this._instance) {
                this._instance = new ClothChangeModel();
            }
            return this._instance;
        }

        public async setUp() {
            this._allData = new util.HashMap();
            let undownType = [
                clothType.Hair,
                clothType.Eyebrow,
                clothType.Eye,
                clothType.Mouth,
                clothType.Skin,
                clothType.Cloth,
                clothType.Skirt,
                // clothType.Shoe,//策划要求鞋子可以脱
                clothType.Wing];
            let undownCloth = _.filter(clientCore.LocalInfo.wearingClothIdArr, (id) => {
                return xls.get(xls.itemCloth).has(id) && undownType.indexOf(xls.get(xls.itemCloth).get(id).kind) > -1;
            })
            this.person = new clientCore.Person(clientCore.LocalInfo.sex, undownCloth);
            this.changeRider(clientCore.BgShowManager.instance.currRider);
            for (const id of clientCore.LocalInfo.wearingClothIdArr) {
                this.person.upById(id);
            }
            for (const info of clientCore.LocalInfo.allClothes) {
                this._allData.add(info.id, info);
            }
            this._lastSave = clientCore.LocalInfo.wearingClothIdArr.slice();
            this._currDecoSelectMap = new util.HashMap();
            this._currDecoSelectMap.add(clothType.Bg, clientCore.BgShowManager.instance.currBgShowId);
            this._currDecoSelectMap.add(clothType.Stage, clientCore.BgShowManager.instance.currStageId);
            this._currDecoSelectMap.add(clothType.Rider, clientCore.BgShowManager.instance.currRider);

            this._imageSaveHash = new util.HashMap();
            this.bgShowImg = new Laya.Image();
            this.bgShowImg.anchorX = this.bgShowImg.anchorY = 0.5;
            this.changeBgShow(clientCore.BgShowManager.instance.currBgShowId);
            await this.checkBgShow();

            this.stageShowImg = new Laya.Image();
            this.stageShowImg.anchorX = this.stageShowImg.anchorY = 0.5;
            this.changeStage(clientCore.BgShowManager.instance.currStageId);
            this.showCP = clientCore.LocalInfo.showCp;
            this.changeShowCp(this.showCP);
            await this.reqUserSaveImages();
            await clientCore.CpManager.instance.refreshCpUserInfo();
        }

        initView(box: Laya.Box) {
            box.addChild(ClothChangeModel.instance.bgShowImg);
            box.addChild(ClothChangeModel.instance.stageShowImg);
            if (clientCore.CpManager.instance.haveCp()) {
                let cpInfo = clientCore.CpManager.instance.cpInfo;
                this.cpPerson = new clientCore.Person(cpInfo.userBase.sex, cpInfo.userBase.curClothes);
                box.addChild(this.cpPerson);
                this.cpPerson.x = -DIS;
                this.cpPerson.visible = this.showCP;
                this.cpPerson.scaleY = SCALE * CP_SCALE_P;
                this.cpPerson.scaleX = -SCALE * CP_SCALE_P;
            }
            this.person.scaleY = SCALE;
            this.person.scaleX = SCALE;
            box.addChild(ClothChangeModel.instance.person);
            this.changeShowCp(this.showCP);
        }

        //---------------搭配-------------------
        private async reqUserSaveImages() {
            if (this._imageSaveHash.length > 0) {
                this.createImageSave();
                return Promise.resolve();
            }
            await xls.load(xls.clothSave);
            let xlsHash = xls.get(xls.clothSave);
            for (const obj of xlsHash.getValues()) {
                this._imageSaveHash.add(obj.id, { xlsInfo: obj, srvData: null });
            }
            return net.sendAndWait(new pb.cs_get_user_image()).then((data: pb.sc_get_user_image) => {
                for (const iterator of data.userImage) {
                    this._imageSaveHash.get(iterator.posId).srvData = iterator;
                }
                this.createImageSave();
            })
        }

        /**创建人模缓存 */
        private createImageSave() {
            for (const iterator of this._imageSaveHash.getValues()) {
                if (iterator.srvData)
                    ImageSaver.instance.setImage(iterator.srvData.posId, iterator.srvData.clothesid);
            }
        }

        getAllImages() {
            return this._imageSaveHash.getValues();
        }

        getImagesInfoById(posId: number) {
            return this._imageSaveHash.get(posId);
        }

        /**重命名搭配 */
        renameImage(posId: number, name: string) {
            return net.sendAndWait(new pb.cs_modify_user_image_name({ posId: posId, name: name })).then(() => {
                this._imageSaveHash.get(posId).srvData.name = name;
            })
        }

        /**删除搭配 */
        delectImage(posId: number) {
            return net.sendAndWait(new pb.cs_delete_user_image({ posId: posId })).then(() => {
                this._imageSaveHash.get(posId).srvData = null;
            })
        }

        setImageClothes(posId: number, name: string) {
            let clothes = this.person.getWearginIds().slice();
            return net.sendAndWait(new pb.cs_save_user_image({ posId: posId, clothesid: clothes, name: name })).then((data: pb.sc_save_user_image) => {
                this._imageSaveHash.get(posId).srvData = {
                    posId: posId,
                    gettime: data.gettime,
                    clothesid: clothes,
                    name: name
                };
                ImageSaver.instance.setImage(posId, clothes);
            })
        }

        //---------------------------------------------------------------------

        setNewStateOff(id: number) {
            clientCore.LocalInfo.allClothes.forEach((info) => {
                if (info.id == id)
                    info.serverInfo.isnew = 0;
            })
            net.sendAndWait(new pb.cs_change_clothes_isnew_status({ clothesid: [id] })).then(() => { }).catch(e => { });
        }

        setCollect(id: number): void{
            let info: clientCore.ClothInfo = clientCore.LocalInfo.getCloth(id);
            let flag: number = info.serverInfo.isCollection ? 0 : 1;
            info.serverInfo.isCollection = flag;
            net.send(new pb.cs_set_suit_collection_flag({clothesid: id, flag: flag}));
        }

        get hasClothChanged() {
            return !util.arraysAreEqual(this._lastSave, this.person.getWearginIds());
        }

        /**装饰是否有改动 */
        get hasDecoChanged() {
            for (const type of this._currDecoSelectMap.getKeys()) {
                let currUseId = clientCore.BgShowManager.instance.getcurrDecoByType(parseInt(type));
                let currSelectId = this._currDecoSelectMap.get(type);
                if (currUseId != currSelectId)
                    return true;
            }
            return false;
        }

        get hasShowCpChanged() {
            return clientCore.LocalInfo.showCp != this.showCP;
        }

        upDecoShowId(id: number, type: clothType.Bg | clothType.Rider | clothType.Stage) {
            //条件判断
            //换上背景秀需要检查下当前是不是双人(脱下的话不判断)
            if (type == clothType.Bg && id != 0) {
                let bgShowIsDouble = clientCore.BgShowManager.instance.checkIsDouble(id);
                if (bgShowIsDouble != this.showCP) {
                    alert.showFWords(bgShowIsDouble ? '单人展示状态不能使用花缘背景秀' : '双人展示状态不能使用单人背景秀');
                    return;
                }
            }

            //开始更换逻辑
            let currSelectId = this._currDecoSelectMap.get(type);
            //点两次就是脱下
            if (currSelectId == id)
                currSelectId = 0;
            else
                currSelectId = id;
            this._currDecoSelectMap.add(type, currSelectId);
            switch (type) {
                case clothType.Bg:
                    // ClothChangeModel.instance.bgShowImg.skin = clientCore.ItemsInfo.getItemUIUrl(currSelectId);
                    this.changeBgShow(currSelectId);
                    break;
                case clothType.Stage:
                    this.changeStage(currSelectId);
                    // ClothChangeModel.instance.stageShowImg.skin = clientCore.ItemsInfo.getItemUIUrl(currSelectId);
                    break;
                case clothType.Rider:
                    this.changeRider(currSelectId);
                    break;
                default:
                    break;
            }
        }

        private changeRider(id: number) {
            this.person.playAnimate(id != 0 ? 'zuoxia' : 'static', true);
            if (id) {
                this.rider?.dispose();
                this.rider = clientCore.BoneMgr.ins.playRiderBone(id, this.person);
                this.rider.visible = true;
            }
            else
                this.rider && (this.rider.visible = false);
        }

        getCurrSelectDecoId(type: clothType.Bg | clothType.Rider | clothType.Stage) {
            return this._currDecoSelectMap.get(type);
        }

        saveCloth() {
            if (this.hasClothChanged) {
                this._lastSave = this.person.getWearginIds().slice();
                net.sendAndWait(new pb.cs_save_user_clothes({ clothesid: this._lastSave })).then(() => {
                    clientCore.LocalInfo.wearingClothIdArr = this._lastSave;
                    this.person.resetDefaultCloth2(this._lastSave);
                    EventManager.event(globalEvent.USER_CHANGE_CLOTH);
                });
            }
            if (this.hasDecoChanged) {
                clientCore.BgShowManager.instance.setCurrDecoShow(this._currDecoSelectMap).then(() => {
                    EventManager.event(globalEvent.USER_CHANGE_CLOTH);
                }).catch(() => { })
            }
            if (this.hasShowCpChanged) {
                net.sendAndWait(new pb.cs_show_double_bgshow({ isShow: this.showCP ? 1 : 0 })).then(() => {
                    clientCore.LocalInfo.showCp = this.showCP;
                    EventManager.event(globalEvent.USER_CHANGE_CLOTH);
                })
            }
        }

        private checkBgShow(): Promise<void>{
            let id: number = clientCore.BgShowManager.instance.currBgShowId;
            let cfg: xls.bgshow = xls.get(xls.bgshow).get(id);
            if(!cfg)return;
            if(cfg.couple == 1 && !clientCore.LocalInfo.showCp)return;
            if(cfg.couple == 2 && clientCore.LocalInfo.showCp)return;
            return net.sendAndWait(new pb.cs_show_double_bgshow({ isShow: cfg.couple == 2 ? 1 : 0 })).then(() => {
                clientCore.LocalInfo.showCp = cfg.couple == 2;
                EventManager.event(globalEvent.USER_CHANGE_CLOTH);
            })
        }

        tweenScale(big: boolean): void{
            let now: number = big ? SCALE : BIG_SCALE;
            let target: number = big ? BIG_SCALE : SCALE;
            this.person.scale(target, target);
            Laya.Tween.from(this.person, {scaleX: now,scaleY: now}, 500);
        }

        /**
         * 更换cp显示
         * @param show  是否显示
         * @param needAlert 如果不成功是否弹提示
         * @returns 返回是否成功
         */
        changeShowCp(show: boolean, needAlert: boolean = false) {
            let changeOk = false;
            if (this.cpPerson) {
                this.showCP = show;
                this.cpPerson.visible = show;
                this.person.x = show ? DIS : 0;
                changeOk = true;
            }
            else {
                if (needAlert)
                    alert.showFWords('当前没有花缘，不能展示双人');
                changeOk = false;
            }
            this.person.scaleX = this.person.scaleY = this.showCP ? SCALE * CP_SCALE_P : SCALE;
            return changeOk;
        }

        getInfoByType(type: number): clientCore.ClothInfo[] {
            let array: clientCore.ClothInfo[] = _.filter(this._allData.getValues(), { 'clothType': type });
            return _.sortBy(array, (element: clientCore.ClothInfo)=>{
                return -element.serverInfo.isCollection;
            },(element: clientCore.ClothInfo)=>{ 
                return -element.xlsInfo.quality;
            });
        }

        getInfoBySearch(str: string) {
            let array: clientCore.ClothInfo[] = _.filter(this._allData.getValues(), o => o.name.indexOf(str) > -1);
            return _.sortBy(array, (element: clientCore.ClothInfo)=>{
                return -element.serverInfo.isCollection;
            },(element: clientCore.ClothInfo)=>{ 
                return -element.xlsInfo.quality;
            });
        }

        changeBgShow(id: number): void{
            if(!id){
                this.bgShowImg.skin = null;
                clientCore.BgShowManager.instance.hideFullScreenBgShow();
                return;
            }

            let cfg: xls.bgshow = xls.get(xls.bgshow).get(id);
            let path: string = clientCore.ItemsInfo.getItemUIUrl(id);
            if(cfg.fullScreen){
                this.bgShowImg.skin = null;
                clientCore.BgShowManager.instance.createFullScreenBgShow(this.module, path);
            }else{
                this.bgShowImg.skin = path;
                clientCore.BgShowManager.instance.hideFullScreenBgShow();
            }
        }

        private changeStage(id:number){
            if(!id){
                this.stageShowImg.skin = null;
                clientCore.BgShowManager.instance.hideDynamicStage();
                return;
            }
            let cfg: xls.bgshow = xls.get(xls.bgshow).get(id);
            let path: string = clientCore.ItemsInfo.getItemUIUrl(id);
            if(cfg.dynamic){
                this.stageShowImg.skin = null;
                clientCore.BgShowManager.instance.createDynamicStage(id, this.stageShowImg);
            }else{
                this.stageShowImg.skin = path;
                clientCore.BgShowManager.instance.hideDynamicStage();
            }
        }

        destory() {
            this.module = null;
            Laya.Tween.clearAll(this.person);
            this.person?.destroy();
            this.person = null;
            this.cpPerson?.destroy();
            this.cpPerson = null;
            clientCore.BgShowManager.instance.hideFullScreenBgShow();
            clientCore.BgShowManager.instance.hideDynamicStage();
            // TODO 
            // this._allData.clear();
            // this._allData = null;
            // ImageSaver.instance.destory();
        }
    }
}