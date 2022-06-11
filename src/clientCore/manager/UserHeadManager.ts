namespace clientCore {
    export interface HeadInfo {
        xlsInfo: xls.userHead | xls.userHeadFrame;
        have: boolean;
    }
    export class UserHeadManager {
        private static _ins: UserHeadManager;
        private _headHash: util.HashMap<HeadInfo>;
        private _frameHash: util.HashMap<HeadInfo>;
        headNew: boolean;
        frameNew: boolean;

        constructor() {
            this._headHash = new util.HashMap();
            this._frameHash = new util.HashMap();
        }

        static get instance() {
            this._ins = this._ins || new UserHeadManager();
            return this._ins;
        }

        async setup() {
            EventManager.on(globalEvent.CLOTH_CHANGE, this, this.onClothChange);
            EventManager.on(globalEvent.FLOWER_PET_VIP_CHANGE_NOTICE, this, this.onPetVipChange);
            EventManager.on(globalEvent.USER_LEVEL_UP, this, this.checkAfterExpChange);
            await Promise.all([
                xls.load(xls.userHead),
                xls.load(xls.userHeadFrame)
            ]);
            for (const info of xls.get(xls.userHead).getValues()) {
                if (info.sex == LocalInfo.sex)
                    this._headHash.add(info.headId, { xlsInfo: info, have: false });
            }
            for (const info of xls.get(xls.userHeadFrame).getValues()) {
                this._frameHash.add(info.headId, { xlsInfo: info, have: false });
            }
            this.onClothChange();//初始化时判断衣服
            this.checkAfterExpChange();//初始化判断等级
            this.onPetVipChange();
            this.headNew = this.frameNew = false;//初始化new标签都置为false
            return this.refreshAllHeadInfo();
        }

        refreshAllHeadInfo() {
            return net.sendAndWait(new pb.cs_get_head_images_and_frames()).then((data: pb.sc_get_head_images_and_frames) => {
                for (const head of data.headImages) {
                    this._headHash.get(head).have = true;
                }
                for (const head of data.headFrames) {
                    this._frameHash.get(head).have = true;
                }
            });
        }

        get headList() {
            let list = this._headHash.getValues();
            return _.sortBy(list, (o) => {
                if (o.have)
                    return -2;
                else
                    return o.xlsInfo.newTag ? 1 : 2;
            })
        }

        get frameList() {
            let list = this._frameHash.getValues();
            list = _.filter(list, (o) => {
                //没获得切需要隐藏
                if (!o.have && (o.xlsInfo as xls.userHeadFrame).hide == 0) {
                    return false;
                }
                return true;
            })
            return _.sortBy(list, (o) => {
                if (o.have)
                    return -2;
                else
                    return o.xlsInfo.newTag ? 1 : 2;
            })
        }

        getOneInfoById(id: number) {
            if (this._headHash.has(id)) {
                return this._headHash.get(id)
            }
            if (this._frameHash.has(id)) {
                return this._frameHash.get(id)
            }
            return null;
        }

        private checkAfterExpChange() {
            let nowLv = LocalInfo.userLv;
            for (const head of this._headHash.getValues()) {
                if (head.xlsInfo.require.v1 == 1 && nowLv >= head.xlsInfo.require.v2 && !head.have) {
                    head.have = true;
                    this.headNew = true;
                }
            }
            for (const head of this._frameHash.getValues()) {
                if (head.xlsInfo.require.v1 == 1 && nowLv >= head.xlsInfo.require.v2 && !head.have) {
                    head.have = true;
                    this.frameNew = true;
                }
            }
        }

        private onPetVipChange() {
            for (const head of this._headHash.getValues()) {
                if (head.xlsInfo.require.v1 == 7 && clientCore.FlowerPetInfo.petType >= head.xlsInfo.require.v2 && !head.have) {
                    head.have = true;
                    this.headNew = true;
                }
            }
            for (const head of this._frameHash.getValues()) {
                if (head.xlsInfo.require.v1 == 7 && clientCore.FlowerPetInfo.petType >= head.xlsInfo.require.v2 && !head.have) {
                    head.have = true;
                    this.frameNew = true;
                }
            }
        }

        private onClothChange() {
            let suits = SuitsInfo.getAllMySuit();
            for (const head of this._headHash.getValues()) {
                if (head.xlsInfo.require.v1 == 2 && suits.indexOf(head.xlsInfo.require.v2) > -1 && !head.have) {
                    head.have = true;
                    this.headNew = true;
                }
            }
            for (const head of this._frameHash.getValues()) {
                if (head.xlsInfo.require.v1 == 2 && suits.indexOf(head.xlsInfo.require.v2) > -1 && !head.have) {
                    head.have = true;
                    this.frameNew = true;
                }
            }
        }

        /**
         * 保存设定
         * @param type 1头像 2头像框
         * @param id 
         */
        save(headId: number, frameId: number) {
            return net.sendAndWait(new pb.cs_set_head_image_or_frame({ headFrameId: frameId, headImageId: headId })).then((data) => {
                LocalInfo.srvUserInfo.headImage = headId;
                LocalInfo.srvUserInfo.headFrame = frameId;
                EventManager.event(globalEvent.USER_HEAD_IMAGE_CHANGE);
                return Promise.resolve();
            })
        }

        /**
         * 购买
         * @param type 1头像 2头像框
         * @param id 
         */
        buy(type: number, id: number) {
            return net.sendAndWait(new pb.cs_buy_head_image_or_frame({ type: type, itemId: id })).then((data) => {
                if (type == 1) {
                    this._headHash.get(id).have = true;
                }
                else {
                    this._frameHash.get(id).have = true;
                }
                return Promise.resolve();
            })
        }
    }
}