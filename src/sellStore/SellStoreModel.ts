namespace sellStore {
    import cloth_type = clientCore.CLOTH_TYPE;
    export interface ICommomExInfo {
        name: string;
        have: boolean;
        onTimeSell: boolean;
        onTimeDiscount: boolean;
    }

    export interface IClothExInfo extends ICommomExInfo {
        /**是否试穿 */
        wearing: boolean;
        quality: number;
    }

    export interface IDecoExInfo extends ICommomExInfo {
        rare: number;
        wearing: boolean;
    }

    export interface ISuitExInfo extends ICommomExInfo {
    }
    export enum CLOTH_STORE_TYPE {
        ClothStore = 1,
        GodTreeStore = 2,
        TwinkleStore = 3,
    }

    export class SellStoreModel {
        public xlsCloth: util.HashMap<xls.itemCloth>;
        public xlsSuit: util.HashMap<xls.suits>;
        public xlsBgshow: util.HashMap<xls.bgshow>;
        public selectSuit: number;
        /**key是type value是id */
        private _selectCloth: util.HashMap<number>;
        /**购物车中衣服id数组 */
        private _cartCloth: number[];
        public xlsStoreValues: xls.clothStore[];
        private _time: number;

        private static _instance: SellStoreModel;

        public shopType: number;
        static get instance(): SellStoreModel {
            if (!this._instance) {
                this._instance = new SellStoreModel();
            }
            return this._instance;
        }

        initData(d: number) {
            this.xlsCloth = xls.get(xls.itemCloth);
            this.xlsSuit = xls.get(xls.suits);
            this.xlsBgshow = xls.get(xls.bgshow);
            this.shopType = d;
            if (d == sellStore.CLOTH_STORE_TYPE.ClothStore) {
                this.xlsStoreValues = xls.get(xls.clothStore).getValues().filter((o) => { return (o.sex == clientCore.LocalInfo.sex || o.sex == 0) && o.type != 4 && o.type != 5 });
            }
            else if (d == sellStore.CLOTH_STORE_TYPE.GodTreeStore) {
                this.xlsStoreValues = xls.get(xls.clothStore).getValues().filter((o) => { return (o.sex == clientCore.LocalInfo.sex || o.sex == 0) && o.type == 4 });
            }
            else if (d == sellStore.CLOTH_STORE_TYPE.TwinkleStore) {
                this.xlsStoreValues = xls.get(xls.clothStore).getValues().filter((o) => { return (o.sex == clientCore.LocalInfo.sex || o.sex == 0) && o.type == 5 });
            }

            this._selectCloth = new util.HashMap();
            this._cartCloth = [];
        }

        /**获取当前商店中售卖物品的所有代币id */
        get currStoreCoinArr() {
            let coinIdArr = _.map(this.xlsStoreValues, (info) => {
                if (!this.checkUnlock(info))
                    return []
                else
                    return _.map(info.cost, o => o.v1);
            })
            return _.uniq(_.flatten(coinIdArr)).sort((a, b) => { return a - b });
        }

        /** 当前人模上真实衣服(包含进模块前穿着的) */
        get actualWearingClothes() {
            let hash = new util.HashMap<number>();
            for (const id of clientCore.LocalInfo.wearingClothIdArr) {
                if (!xls.get(xls.bgshow).has(id))
                    hash.add(clientCore.ClothData.getCloth(id).clothType, id);
            }
            for (const id of this.selectClothes) {
                if (!xls.get(xls.bgshow).has(id))
                    hash.add(clientCore.ClothData.getCloth(id).clothType, id);
            }
            return hash.getValues();
        }

        /**当前试穿的舞台和背景秀 */
        get curBgStage() {
            let hash = new util.HashMap<number>();
            for (const id of this.selectClothes) {
                if (xls.get(xls.bgshow).has(id))
                    hash.add(xls.get(xls.bgshow).get(id).clothKind, id);
            }
            return hash;
        }

        /**当前试穿的衣服(只包含玩家在服装商店内试穿的，不包含进模块前穿着的) */
        get selectClothes(): number[] {
            return this._selectCloth.getValues();
        }

        /**购物车中的id */
        get cartClothes(): number[] {
            return this._cartCloth.slice();
        }

        clearCart() {
            this._cartCloth.splice(0, this._cartCloth.length);
        }

        pushToCart(id: number) {
            this._cartCloth.push(id);
            this._cartCloth = _.uniq(this._cartCloth).filter((id) => {
                return !clientCore.ItemsInfo.checkHaveItem(id);
            });
        }

        removeFromCart(id: number) {
            _.pull(this._cartCloth, id);
        }

        isInCart(id: number) {
            if (this._cartCloth)
                return this._cartCloth.indexOf(id) > -1;
            return false;
        }

        /**将当前所穿放入购物车 */
        pushSelectToCart() {

        }

        upCloth(id: number) {
            let type: number = this.xlsCloth.get(id).kind;
            this._selectCloth.add(type, id);
            if (!this.checkTypeIsDeco(type))
                EventManager.event(SellStoreEvent.EV_NEED_CHANGE_CLOTH, { up: id });
        }

        downCloth(id: number) {
            let type: number = this.xlsCloth.get(id).kind;
            if (this._selectCloth.has(type)) {
                this._selectCloth.remove(type);
                if (!this.checkTypeIsDeco(type))
                    EventManager.event(SellStoreEvent.EV_NEED_CHANGE_CLOTH, { down: id });
            }
        }

        clearCloth() {
            this._selectCloth.clear();
            EventManager.event(SellStoreEvent.EV_NEED_CHANGE_CLOTH, { clear: true });
            EventManager.event(SellStoreEvent.EV_CHANGE_BG_STAGE);
        }

        upDeco(id: number) {
            let type: number = this.xlsBgshow.get(id).clothKind;
            this._selectCloth.add(type, id);
            EventManager.event(SellStoreEvent.EV_CHANGE_BG_STAGE);
        }

        downDeco(id: number) {
            let type: number = this.xlsBgshow.get(id).clothKind;
            if (this._selectCloth.has(type)) {
                this._selectCloth.remove(type);
                EventManager.event(SellStoreEvent.EV_CHANGE_BG_STAGE);
            }
        }

        getSelectCloth(type: cloth_type) {
            return this._selectCloth.get(type);
        }

        getStoreInfoByClothId(ids: number[]): xls.clothStore[] {
            let all = this.xlsStoreValues;
            return _.filter(all, (o) => {
                return ids.indexOf(o.clothId) > -1;
            })
        }

        /**判断是否解锁了 */
        private checkUnlock(info: xls.clothStore) {
            if (info.require.length == 0)
                return true;
            let lvOk = false;
            let roleOk = false;
            for (const req of info.require) {
                if (req.v1 == 1)
                    roleOk = clientCore.RoleManager.instance.getRoleById(req.v2) != null;
                if (req.v1 == 2)
                    lvOk = clientCore.LocalInfo.userLv >= req.v2;

            }
            return lvOk && roleOk;
        }

        /**根据传入的clothId 找到clothStore表中对应数据（为了做套装查找） */
        getClothByClothIdArr(clothIdArr: number[]) {
            let all = this.xlsStoreValues;
            all = _.filter(all, (o) => {
                if (!this.checkUnlock(o))
                    return false;
                if (o.type == 1 || o.type == 4 || o.type == 5)
                    return clothIdArr.indexOf(o.clothId) > -1;
                else
                    return false;
            })
            let rst: (xls.clothStore & IClothExInfo)[] = [];
            let currWearing = this._selectCloth.getValues();
            _.map(all, (o) => {
                let obj = <xls.clothStore & IClothExInfo>{};
                for (let prop in o) {
                    obj[prop] = o[prop];
                }
                obj.name = this.xlsCloth.has(o.clothId) ? this.xlsCloth.get(o.clothId).name : 'itemCloth中没有';
                obj.have = clientCore.LocalInfo.checkHaveCloth(o.clothId);
                obj.wearing = currWearing.indexOf(o.clothId) > -1;
                obj.quality = this.xlsCloth.has(o.clothId) ? this.xlsCloth.get(o.clothId).quality : 0;
                obj.onTimeSell = this.checkTimeBetween(o.timeLimit);
                obj.onTimeDiscount = this.checkTimeBetween(o.dicountTime);
                rst.push(obj);
            });
            rst = _.sortBy(rst, ['have', 'priority']);
            return rst;
        }

        /**根据服装类型获取服装数组（单件售卖） */
        getClothByType(type: cloth_type): (xls.clothStore & IClothExInfo)[] {
            let all = this.xlsStoreValues;
            all = _.filter(all, (o) => {
                if (!this.checkUnlock(o))
                    return false;
                if (o.type == 1 || o.type == 4 || o.type == 5) {
                    let kindId: number;
                    if (this.xlsCloth.get(o.clothId)) {
                        kindId = this.xlsCloth.get(o.clothId).kind;
                    } else if (xls.get(xls.bgshow).get(o.clothId)) {
                        kindId = xls.get(xls.bgshow).get(o.clothId).clothKind;
                    }
                    if (type == TIME_LIMIT)
                        return o.timeLimit != '0' && !this.checkTypeIsDeco(kindId);
                    else
                        return kindId == type;
                }
                else
                    return false;
            })
            let rst: (xls.clothStore & IClothExInfo)[] = [];
            _.map(all, (o) => {
                let obj = <xls.clothStore & IClothExInfo>{};
                for (let prop in o) {
                    obj[prop] = o[prop];
                }
                obj.name = this.xlsCloth.has(o.clothId) ? this.xlsCloth.get(o.clothId).name : 'itemCloth中没有';
                obj.have = clientCore.LocalInfo.checkHaveCloth(o.clothId);
                obj.wearing = this._selectCloth.get(type) == o.clothId;
                obj.quality = this.xlsCloth.has(o.clothId) ? this.xlsCloth.get(o.clothId).quality : 0;
                obj.onTimeSell = this.checkTimeBetween(o.timeLimit);
                obj.onTimeDiscount = this.checkTimeBetween(o.dicountTime);
                rst.push(obj);
            });
            rst = _.sortBy(rst, ['have', 'priority']);
            return rst;
        }

        /**根据装饰物类型获取装饰物数组（单件售卖） */
        getDecoByType(type: cloth_type): (xls.clothStore & IDecoExInfo)[] {
            let all = this.xlsStoreValues;
            all = _.filter(all, (o) => {
                if (!this.checkUnlock(o))
                    return false;
                if (this.xlsBgshow.get(o.clothId)) {
                    let kindId = this.xlsBgshow.get(o.clothId).clothKind;
                    if (type == TIME_LIMIT)
                        return o.timeLimit != '0' && this.checkTypeIsDeco(kindId);
                    else
                        return kindId == type;
                }
                else
                    return false;
            });
            let rst: (xls.clothStore & IDecoExInfo)[] = [];
            _.map(all, (o) => {
                let obj = <xls.clothStore & IDecoExInfo>{};
                for (let prop in o) {
                    obj[prop] = o[prop];
                }
                let kindId = this.xlsBgshow.get(o.clothId).clothKind;
                obj.name = this.xlsBgshow.has(o.clothId) ? this.xlsBgshow.get(o.clothId).name : 'bgshow中没有';
                obj.have = clientCore.ItemsInfo.checkHaveItem(o.clothId);
                // obj.wearing = this._selectCloth.get(kindId) == o.clothId;
                obj.onTimeSell = this.checkTimeBetween(o.timeLimit);
                obj.onTimeDiscount = this.checkTimeBetween(o.dicountTime);
                rst.push(obj);
            })
            rst = _.sortBy(rst, ['have', 'priority']);
            return rst;
        }

        getSuitByTag(tag: number): (xls.clothStore & ISuitExInfo)[] {
            let all = this.xlsStoreValues;
            all = _.filter(all, (o) => {
                if (!this.checkUnlock(o))
                    return false;
                if (o.type == 2) {
                    let suitTag = xls.get(xls.suits).get(o.clothId).type;
                    return suitTag == tag && o.type == 2;//按kind过滤套装
                }
                else
                    return false;

            })
            let rst: (xls.clothStore & ISuitExInfo)[] = [];
            _.map(all, (o) => {
                let obj = <xls.clothStore & ISuitExInfo>{};
                for (let prop in o) {
                    obj[prop] = o[prop];
                }
                obj.name = this.xlsSuit.has(o.clothId) ? this.xlsSuit.get(o.clothId).name : 'suit中没有';
                obj.have = clientCore.SuitsInfo.getSuitInfo(obj.clothId).allGet;
                obj.onTimeSell = this.checkTimeBetween(o.timeLimit);
                obj.onTimeDiscount = this.checkTimeBetween(o.dicountTime);
                rst.push(obj);
            });
            rst = _.sortBy(rst, ['have', 'priority']);
            return rst;
        }

        /**获取当前购服车中所有物品价格(会过滤已购买过的) 
         * key:clothId
         * value:价格(计算所有打折后)
         */
        getCartFinalPrice(): util.HashMap<number> {
            //算价格
            let map = new util.HashMap<number>();
            _.map(this.cartClothes, (clothId) => {
                let price = this.calcuFinalPriceById(clothId);
                _.map(price, (info) => {
                    if (!map.has(info.v1))
                        map.add(info.v1, info.v2);
                    else
                        map.add(info.v1, map.get(info.v1) + info.v2);
                })
            });
            return map;
        }

        /**
         * @param clothId 部件id
         * @returns xls.pair[] {v1:代币id v2:代币数量}
         */
        calcuFinalPriceById(clothId: number): xls.pair[] {
            let info = this.getStoreInfoByClothId([clothId])[0];
            if (!info)
                return [{ v1: 0, v2: 0 }, { v1: 0, v2: 0 }];
            let finalPrice = _.cloneDeep(info.cost);
            if (this.checkTimeBetween(info.dicountTime))
                //限时折扣
                this.priceArrHandle(finalPrice, info.dicount);
            //vip折扣 
            if (clientCore.LocalInfo.isVip)
                this.priceArrHandle(finalPrice, info.vipDicount);
            return finalPrice;
        }

        private priceArrHandle(arr: xls.pair[], disCount: number) {
            arr.map((pair) => {
                pair.v2 = Math.floor((disCount == 0 ? 1 : disCount) * pair.v2);
            });
        }

        /**
         *  判断id是否为 背景秀，舞台，坐骑
         */
        private checkTypeIsDeco(kindId: number): boolean {
            let arr = [cloth_type.Bg, cloth_type.Stage, cloth_type.Rider];
            return arr.indexOf(kindId) > -1;
        }

        /**判断时间 如果没配时间 也返回false */
        checkTimeBetween(time: string): boolean {
            if (time == "") {
                return false;
            }
            // let t1 = Math.floor(new Date(time.split(';')[0]?.replace(/\-/g, '/')).getTime() / 1000);
            let t1 = util.TimeUtil.formatTimeStrToSec(time.split('_')[0]);
            // let t2 = Math.floor(new Date(time.split(';')[1]?.replace(/\-/g, '/')).getTime() / 1000);
            let t2 = util.TimeUtil.formatTimeStrToSec(time.split('_')[1]);
            // let now = _.now() / 1000;
            let now = clientCore.ServerManager.curServerTime;
            return now >= t1 && now <= t2;
        }

        /** 过滤不在售卖时间的id 返回可以购买的id */
        private filterTimeByIds(ids: number[]): number[] {
            let okIds = [];
            let storeInfos = this.getStoreInfoByClothId(ids);
            storeInfos.map((info) => {
                //没有时间限制 或者在时间内
                if (info.timeLimit == '' || info.timeLimit == "0" || this.checkTimeBetween(info.timeLimit))
                    okIds.push(info.clothId);
            });
            return okIds;
        }

        /**获取限时折扣的商品 */
        public getTimeDisGoods() {
            return _.find(this.xlsStoreValues, (o) => {
                return this.checkUnlock(o) && this.checkTimeBetween(o.dicountTime);
            })
        }

        //----------------------后台交互-----------------
        buyCloth(ids: number[]) {
            let okIds = this.filterTimeByIds(ids);
            if (okIds.length > 0) {
                let data = new pb.cs_buy_clothes();
                data.clothesid = okIds;
                return net.sendAndWait(data).then(async () => {
                    let fakeInfos = _.map(okIds, (id) => {
                        return { clothesid: id };
                    });
                    let rwds = _.map(okIds, (id) => {
                        return { itemID: id, itemNum: 1 };
                    })
                    //加入到本地服装信息
                    clientCore.LocalInfo.addClothes(fakeInfos);
                    //刷新购物车数据
                    _.pullAll(this._cartCloth, okIds);
                    await this.waitRewardPanel(rwds);
                    // alert.showReward(rwds, '购买成功', { btnType: alert.Btn_Type.ONLY_SURE });
                    EventManager.event(SellStoreEvent.EV_NEED_REFRESH_LIST);
                    return Promise.resolve(true);
                }).catch((e: net.ErrorCode) => {
                    // if (e.id == 1200038)
                    //     clientCore.LittleRechargManager.instacne.activeWindowById(3)
                    return Promise.resolve(false);
                });
            }
            if (okIds.length != ids.length) {
                let unBuyName = '';
                ids.map((id) => {
                    if (okIds.indexOf(id) == -1)
                        unBuyName += this.xlsCloth.get(id).name + ' ';
                });
                alert.showFWords(unBuyName + '超出售卖时间');
                EventManager.event(SellStoreEvent.EV_NEED_REFRESH_LIST);
                return Promise.resolve(false);
            }
        }

        private waitRewardPanel(rwds: any[]) {
            return new Promise((ok) => {
                alert.showReward(rwds, '购买成功', {
                    btnType: alert.Btn_Type.ONLY_SURE, callBack: {
                        caller: this, funArr: [ok, ok]
                    }
                });
            })
        }

        buySelectSuit(suitId: number) {
            let okIds = this.filterTimeByIds([suitId]);
            if (okIds.length == 0) {
                alert.showFWords('超出售卖时间');
                EventManager.event(SellStoreEvent.EV_NEED_REFRESH_LIST);
                return;
            }
            let data = new pb.cs_buy_suit();
            data.suitId = suitId;
            net.sendAndWait(data).then(() => {
                let ids = clientCore.SuitsInfo.getSuitInfo(suitId).clothes;
                let fakeInfos = _.map(ids, (id) => {
                    return { clothesid: id };
                });
                let rwds = _.map(ids, (id) => {
                    return { itemID: id, itemNum: 1 };
                })
                alert.showReward(rwds, '购买成功');
                clientCore.LocalInfo.addClothes(fakeInfos);
                EventManager.event(SellStoreEvent.EV_NEED_REFRESH_LIST);
            }).catch(() => { })
        }

        clearData() {
            this.xlsCloth = null;
            this.xlsSuit = null;
            this.xlsBgshow = null;
            this._selectCloth.clear();
            this._cartCloth = null;
            this.xlsStoreValues = null;
        }
    }
}
