/// <reference path="../datainfo/UserInfo.ts" />
/// <reference path="../controlInfo/RainbowInfo.ts" />


namespace clientCore {
    /**
     * 玩家自己的所有信息
     * 包括：基础信息
     *      服装信息
     *      身上穿的服装信息
     *      彩虹天信息
     * 
     */
    export class LocalInfo {
        private static _userInfo: UserInfo = new UserInfo();
        private static _wearingClothIdArr: util.HashMap<number> = new util.HashMap();
        private static _allClothes: util.HashMap<ClothInfo> = new util.HashMap();
        private static _createdFlg: boolean = false;
        /**1是女 2是男 */
        public static sex: number = 1;
        /** 神树等级 */
        public static treeLv: number;
        /** 彩虹信息*/
        public static rainbowInfo: RainbowInfo = new RainbowInfo();
        /**服务器给的人物信息 */
        public static srvUserInfo: pb.IUserBase;
        /** 是否拒绝好友申请*/
        public static friendRefuse: boolean;
        /** 玩家年龄*/
        public static age: number = 0;
        /** 创角时间(秒)*/
        public static createRoleTime: number = 0;
        /** 是否显示称号*/
        public static showTitle: boolean = true;
        /**自定义头像 */
        public static customHead: string;
        /**禁止移动 */
        public static onLimit:boolean;
        static get createdFlg() {
            return this._createdFlg;
        }
        static get vipLv(): number {
            return this.parseVipInfoByExp(this.srvUserInfo.vipExp).lv;
        }

        /**是否展示CP */
        static get showCp() {
            return this.srvUserInfo.isShowDoubleBGS == 1;
        }

        /**是否展示CP */
        static set showCp(b: boolean) {
            this.srvUserInfo.isShowDoubleBGS = b ? 1 : 0;
        }

        static get uid(): number {
            return this._userInfo?.uid ?? 0;
        }

        static set uid(n: number) {
            this._userInfo.uid = n;
        }

        static get pkgSize(): number {
            return this._userInfo.pkgSize;
        }

        static set pkgSize(n: number) {
            this._userInfo.pkgSize = n;
        }

        static get userInfo(): UserInfo {
            return this._userInfo;
        }

        static get isVip(): boolean {
            return this.parseVipInfoByExp(this.srvUserInfo.vipExp).lv > 0;
        }

        /**当前穿着的衣服（会过滤掉背景秀，舞台，坐骑） */
        static get wearingClothIdArr(): number[] {
            let arr = LocalInfo._wearingClothIdArr.getValues();
            return _.filter(arr, id => !xls.get(xls.bgshow).has(id))
        }

        static get userLv(): number {
            return this._userInfo.userLv;
        }

        static set wearingClothIdArr(arr: number[]) {
            LocalInfo._wearingClothIdArr.clear();
            for (let id of arr) {
                LocalInfo._wearingClothIdArr.add(id, id);
            }
        }

        /**爱心值 */
        static get loveNum() {
            return MoneyManager.getNumById(MoneyManager.LOVE_ID);
        }

        /**智慧值（暂时为0） */
        static get wisdomNum() {
            return 0;
        }

        /**美丽值（服装数） */
        static get beautyNum() {
            return this.allClothes.length;
        }

        static get allClothes(): ClothInfo[] {
            return LocalInfo._allClothes.getValues();
        }

        /**头像url */
        static get headImgUrl() {
            return clientCore.ItemsInfo.getItemIconUrl(this.srvUserInfo.headImage);
        }

        /**头像框url */
        static get frameImgUrl() {
            return clientCore.ItemsInfo.getItemIconUrl(this.srvUserInfo.headFrame);
        }

        /**获赠鲜花数 */
        static get getFlowerNum() {
            return this.srvUserInfo.gotFlowerCnt;
        }

        static addClothes(arr: pb.IClothes[]) {
            for (let obj of arr) {
                let info = clientCore.ClothData.getCloth(obj.clothesid);
                if (info) {
                    info.serverInfo = obj;
                    LocalInfo._allClothes.add(obj.clothesid, info);
                }
            }
        }

        static checkHaveCloth(id: number): boolean {
            return LocalInfo._allClothes.has(id);
        }

        static getCloth(id: number): ClothInfo {
            return LocalInfo._allClothes.get(id);
        }

        static checkWear(id: number): boolean {
            return LocalInfo._wearingClothIdArr.has(id);
        }
        static initLoginInfo(data: pb.IUserBase) {
            this.sex = data.sex;
            this.userInfo.nick = data.nick;
            this.userInfo.constellation = data.constellation;
            this.userInfo.exp = data.exp;
            if (data.sex)
                this.sex = data.sex;
            this.srvUserInfo = data;
            this.createRoleTime = data.regtime;
            this.showTitle = data.isHideTitle == 0;
            this.refreshUserLv();
        }
        /**在后台经验广播之后，这里刷新玩家等级，如果升级了。则派发事件出去 */
        static refreshUserLv() {
            let preLv = this._userInfo.userLv;
            this._userInfo.userLv = this.parseLvInfoByExp(this._userInfo.exp).lv;
            if (this._userInfo.userLv > preLv) {
                EventManager.event(globalEvent.USER_LEVEL_UP);
            }
        }

        static setUserCreate(data: pb.sc_gateway_enter_server) {
            this._createdFlg = data.isCreate == 1;
        }
        static getLvInfo(): { lv: number, currExp: number, nextLvNeed: number, expPercent: number } {
            return this.parseLvInfoByExp(this._userInfo.exp);
        }
        static parseLvInfoByExp(exp: number): { lv: number, currExp: number, nextLvNeed: number, expPercent: number } {
            let lv = 1;
            let expSum = 0;
            let userLvOnfoArr = xls.get(xls.characterLevel).getValues();
            for (const expInfo of userLvOnfoArr) {
                expSum += expInfo.expneed;
                if (exp < expSum) {
                    lv = expInfo.characterLevel;
                    expSum -= expInfo.expneed;
                    break;
                }
            }
            let currExp = exp - expSum;
            let nextLvNeed = Math.max(0, xls.get(xls.characterLevel).get(lv).expneed - currExp);
            let expPercent = currExp / (nextLvNeed + currExp);
            let fullExp = _.reduce(xls.get(xls.characterLevel).getValues(), (prev, curr) => { return prev + curr.expneed }, 0);
            if (exp >= fullExp) {
                let last = _.last(xls.get(xls.characterLevel).getValues());
                return { lv: last.characterLevel, currExp: 0, nextLvNeed: 0, expPercent: 0 }
            }
            else {
                return { lv: lv, currExp: currExp, nextLvNeed: nextLvNeed, expPercent: expPercent };
            }
        }

        /**解析vip经验值到等级 */
        static parseVipInfoByExp(exp: number): { lv: number, currExp: number, nextLvNeed: number, expPercent: number } {
            let lv = 0;
            let userLvOnfoArr = xls.get(xls.vipLevel).getValues();
            for (const expInfo of userLvOnfoArr) {
                if (exp >= expInfo.cost) {
                    lv = expInfo.level;
                }
                else {
                    break;
                }
            }
            let nextLv = _.clamp(lv + 1, 0, _.last(userLvOnfoArr).level);
            let currExp = exp - xls.get(xls.vipLevel).get(lv).cost;
            let nextLvNeed = Math.max(0, xls.get(xls.vipLevel).get(nextLv).cost - exp);
            let expPercent = currExp / (nextLvNeed + currExp);
            let last = _.last(xls.get(xls.vipLevel).getValues());
            if (exp > last.cost) {
                return { lv: last.level, currExp: 0, nextLvNeed: 0, expPercent: 0 };
            }
            else {
                return { lv: lv, currExp: currExp, nextLvNeed: nextLvNeed, expPercent: expPercent };
            }
        }

        static getWearClothByType(type: number): number {
            let array: number[] = this._wearingClothIdArr.getValues();
            let len: number = array.length;
            for (let i: number = 0; i < len; i++) {
                let cloth: ClothInfo = ClothData.getCloth(array[i]);
                if (cloth && cloth.clothType == type) {
                    return cloth.id;
                }
            }
            return 0;
        }

        /**获取当前脸部信息 */
        static getFaceIdArr() {
            let faceArr = [clientCore.CLOTH_TYPE.Eyebrow, clientCore.CLOTH_TYPE.Eye, clientCore.CLOTH_TYPE.Mouth]
            return _.compact(_.map(faceArr, (type) => { return this.getWearClothByType(type) }));
        }

        /**
         * 获取当前vip的某个特权信息 
         * @param type 特权类型
         */
        static getVipPrivilege(type: number): xls.pair {
            let xlsData: xls.vipLevel = xls.get(xls.vipLevel).get(this.vipLv);
            if (xlsData) {
                let len: number = xlsData.privilege.length;
                for (let i: number = 0; i < len; i++) {
                    let element: xls.pair = xlsData.privilege[i];
                    if (element && element.v1 == type) {
                        return element;
                    }
                }
            }
            return null;
        }
    }
}