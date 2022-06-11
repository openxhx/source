namespace clientCore {
    /**
     * global配置表
     */
    const ALLOW_NOTICE: string = 'allowNotice';
    export class GlobalConfig {

        /** 角色uid*/
        public static uid: number;
        /** 登录token*/
        public static token: string;
        public static onlineId: number;
        /** 服务器ID*/
        public static serverId: number;
        /** 服务器名称*/
        public static serverName: string;
        /** 服务器显示名称*/
        public static serverShowName: string;
        private static _config: xls.globaltest;
        private static _allowNotice: number;
        /** 是否在战斗副本*/
        public static battleCopy: boolean = false;
        /** 是否允许陌生人私聊*/
        public static isAllowStrangerChat: boolean = false;

        public static isPayFunctionOpen: boolean = true;//是否开启付费功能

        public static isGuideOpen: boolean = true;//开启新手

        public static guideAutoPlay: boolean = false;//新手点击自动播放

        public static showUseLeafAlert: boolean = false;

        public static isFristQcs: boolean = false;

        public static needNotice: boolean = true;

        /**app版本号缓存，免得老是请求 */
        public static appVer: string = '';

        public static get isApp() {
            // return false;
            if (core.SignMgr.useSign) return true;
            return Laya.Render.isConchApp;
        }

        /**是否ios送审 */
        public static get isIosTest() {
            if (Laya.Browser.onIOS) {
                // return this.appVer == '1.1.6';
                //TODO 这里设置只有QA可以看见IOS送审TEST
                // return clientCore.LocalInfo.uid == 200007;
            }
            return false;
        }

        /**是否显示分享复制按钮 */
        public static get isShowShare() {
            if (!Laya.Render.isConchApp)
                return true;
            if (Laya.Browser.onAndroid) {
                return channel.ChannelConfig.isShare && this.checkAppVersion('4.0.3');
            }
            let appVer = this.appVer.replace(/\./g, '');
            let targetVer = '1.1.6'.replace(/\./g, '');
            return Laya.Browser.onIOS && appVer >= targetVer;
        }

        /**能否使用分享sdk */
        public static get canShare() {
            if (!Laya.Render.isConchApp)
                return true;
            if (Laya.Browser.onAndroid) {
                return channel.ChannelConfig.isShare && this.checkAppVersion('4.0.3');;
            }
            let appVer = this.appVer.replace(/\./g, '');
            let targetVer = '1.1.6'.replace(/\./g, '');
            return Laya.Browser.onIOS && appVer >= targetVer;
        }

        /**是否连接到台版网页版 */
        public static get isTWWeb() {
            return window.location.href.indexOf('tw') > -1 && !Laya.Render.isConchApp
        }

        /* 是内网吗？*/
        public static get isInnerNet() {
            return window.location.href.indexOf('61.com') == -1 || window.location.href.indexOf('huamtest.61.com.tw') > -1;//台湾测试域名也算内网
        }

        public static get isH5(): boolean {
            return window['h5sign'];
            // return window.location.href.indexOf('syer.61.com') != -1;
        }


        public static isRise: boolean = false;
        /** 是否是三星公益版本*/
        public static get isSamsungGy(): boolean {
            return channel.ChannelConfig.channelId == 17 && this.checkAppVersion('5.0.0');
        }
        /** 涨价*/
        public static get rise(): boolean {
            return this.isSamsungGy && this.isRise;
        }

        public static get allowNotice() {
            return this._allowNotice == 1;
        }

        public static set allowNotice(b: boolean) {
            this._allowNotice = b ? 1 : 0;
            window.localStorage.setItem(ALLOW_NOTICE, this._allowNotice.toString());
        }

        public static setup(): void {
            this._config = xls.get(xls.globaltest).getValues()[0];
            this._allowNotice = window.localStorage.getItem(ALLOW_NOTICE) ? parseInt(window.localStorage.getItem(ALLOW_NOTICE)) : 1;
        }

        /** 战斗对象的最大怒气值*/
        public static get maxAnger(): number {
            return this._config.angerMax;
        }

        /** 最大灵气值*/
        public static get maxReiki(): number {
            return this._config.reikiMax;
        }

        /** 获取暴击系数*/
        public static get critCoeff(): number {
            return this._config.combatCritCoeff;
        }

        /** 赠送的体力值*/
        public static get maxFriendPower(): number {
            return this._config.friendPower;
        }

        /** 获取当前开启的最大阵容槽位数*/
        public static get maxSolt(): number {
            let max: number = 0;
            for (let i: number = 1; i <= 5; i++) {
                if (LocalInfo.userLv < this._config["levelOfColumn" + i]) {
                    break;
                }
                max++;
            }
            return max;
        }

        /**下一关阵容槽位开启等级(全开了返回0 ) */
        public static get nextSlotLv(): number {
            for (let i: number = 1; i <= 5; i++) {
                if (LocalInfo.userLv < this._config["levelOfColumn" + i]) {
                    return this._config['levelOfColumn' + i];
                }
            }
            return 0;
        }

        /**获取爱心点（友情点数据）
         * 需要friendLevel表
         */
        public static lovePointInfo(point: number) {
            let rtn = { point: point, lv: 0, currLvPoint: 0, currLvTotalPoint: 0, max: false };
            let lvInfoArr = xls.get(xls.friendLevel).getValues();
            let currIdx = _.findIndex(lvInfoArr, (info) => { return point < info.friendNum || point == 0 }) - 1;
            currIdx = _.clamp(currIdx, 0, lvInfoArr.length - 1);
            let nextIdx = _.clamp(currIdx + 1, 0, lvInfoArr.length - 1);
            let maxInfo = lvInfoArr[lvInfoArr.length - 2];
            let currLvInfo = lvInfoArr[currIdx];
            rtn.lv = currLvInfo.friendLevel;
            rtn.currLvPoint = point - lvInfoArr[currIdx].friendNum;
            rtn.currLvTotalPoint = lvInfoArr[nextIdx].friendNum - currLvInfo.friendNum;
            rtn.max = rtn.lv == maxInfo.friendLevel;
            if (rtn.max) {
                rtn.currLvPoint = rtn.currLvTotalPoint = maxInfo.friendNum;
            }
            return rtn;
        }

        /**获取智慧点（智慧点数据）
         * 需要wisdomLevel表
         */
        public static wisdomPointInfo(point: number) {
            let rtn = { point: point, lv: 0, currLvPoint: 0, currLvTotalPoint: 0, max: false };
            let lvInfoArr = xls.get(xls.wisdomLevel).getValues();
            let currIdx = _.findIndex(lvInfoArr, (info) => { return point < info.wisdomNum || point == 0 }) - 1;
            currIdx = _.clamp(currIdx, 0, lvInfoArr.length - 1);
            let nextIdx = _.clamp(currIdx + 1, 0, lvInfoArr.length - 1);
            let maxInfo = lvInfoArr[lvInfoArr.length - 2];
            let currLvInfo = lvInfoArr[currIdx];
            rtn.lv = currLvInfo.wisdomLevel;
            rtn.currLvPoint = point - lvInfoArr[currIdx].wisdomNum;
            rtn.currLvTotalPoint = lvInfoArr[nextIdx].wisdomNum - currLvInfo.wisdomNum;
            rtn.max = rtn.lv == maxInfo.wisdomLevel;
            if (rtn.max) {
                rtn.currLvPoint = rtn.currLvTotalPoint = maxInfo.wisdomNum;
            }
            return rtn;
        }

        /**获取美丽点信息 
         * 需要beautifulLevel表
        */
        public static beatuyPointInfo(point: number) {
            let rtn = { point: point, lv: 0, currLvPoint: 0, currLvTotalPoint: 0, max: false }
            let lvInfoArr = xls.get(xls.beautifulLevel).getValues();
            let currIdx = _.findIndex(lvInfoArr, (info) => { return point < info.beautifulNum || point == 0 }) - 1;
            currIdx = _.clamp(currIdx, 0, lvInfoArr.length - 1);
            let nextIdx = _.clamp(currIdx + 1, 0, lvInfoArr.length - 1);
            let maxInfo = lvInfoArr[lvInfoArr.length - 2];
            let currLvInfo = lvInfoArr[currIdx];
            rtn.lv = currLvInfo.beautiLevel;
            rtn.currLvPoint = point - lvInfoArr[currIdx].beautifulNum;
            rtn.currLvTotalPoint = lvInfoArr[nextIdx].beautifulNum - currLvInfo.beautifulNum;
            rtn.max = rtn.lv == lvInfoArr[lvInfoArr.length - 2].beautiLevel;
            if (rtn.max) {
                rtn.currLvPoint = rtn.currLvTotalPoint = maxInfo.beautifulNum;
            }
            return rtn;
        }

        public static setRewardUI(item: ui.commonUI.item.RewardItemUI, data: { id: number, cnt: number, showName: boolean, lock?: boolean, vs?: number }): void {
            let id: number = data.id;
            item.txtName.visible = data.showName;
            if (data.showName) {
                let namestr = ItemsInfo.getItemName(id);
                if (namestr.length <= 7) item.txtName.fontSize = 21;
                else item.txtName.fontSize = Math.floor(152 / namestr.length);
                item.txtName.text = namestr;
            }
            item.imgBg.skin = ItemsInfo.getItemIconBg(id);
            item.num.visible = data.cnt > 1;
            item.num.value = data.cnt + "";
            item.num.scaleX = item.num.scaleY = data.vs || 1;
            item.ico.skin = ItemsInfo.getItemIconUrl(id);
            let s = ((xls.get(xls.userHeadFrame).has(id) && item.ico.scaleX == 0.8) ? 0.8 : 1);
            item.ico.scaleX *= s;
            item.ico.scaleY *= s;
            item.imgLock.visible = (data.lock == true);
        }

        /** 领取体力的时间段*/
        public static get getPhysicalTime(): string {
            return this._config.RewardTime;
        }

        /** 世界BOSS邮件过期时间*/
        public static get bossMailTimeOut(): number {
            return 7 * 24 * 60 * 60;
        }

        /** 邮件过期时间（秒）*/
        public static get mailTimeOut(): number {
            return this._config.mailSaveDay * 24 * 60 * 60;
        }

        /**
         * 获取桃源花涧奖励
         * @param index 
         */
        public static getPeachRewards(index: number): string[] {
            let rewardStr: string = clientCore.LocalInfo.sex == 1 ? this._config.peachAwardFemale : this._config.peachAwardMale;
            let array: string[] = rewardStr.split(";");
            let len: number = array.length;
            for (let i: number = 0; i < len; i++) {
                let element: string = array[i];
                let arr: string[] = element.split("/");
                if (parseInt(arr[0]) == index) return _.filter(arr, (element) => { return parseInt(element) != index });
            }
            return null;
        }

        /**
         * 获取桃源花涧任务组
         * @param index 
         */
        public static getPeachTasks(index: number): string[] {
            let taskStr: string = this._config.peachTask;
            let array: string[] = taskStr.split(";");
            let len: number = array.length;
            for (let i: number = 0; i < len; i++) {
                let element: string = array[i];
                let arr: string[] = element.split("/");
                if (parseInt(arr[0]) == index) return _.filter(arr, (element) => { return parseInt(element) != index });
            }
            return null;
        }

        /** 浇灌一次需要消耗的水滴数量（花间圃逸活动）*/
        public static getWaterCost(): number {
            return this._config.costWaterNum;
        }

        /** 获取一滴水滴的CD时间（花间圃逸活动）*/
        public static getWaterCD(): number {
            return this._config.costTime;
        }

        public static get config(): xls.globaltest {
            return this._config;
        }

        /** 判断当前版本是否大于等于传入版本*/
        private static checkAppVersion(ver: string): boolean {
            if (!clientCore.GlobalConfig.isApp)
                return true;
            let appVer: string = clientCore.NativeMgr.instance.getAppVersion().replace(/\./g, '');
            let targetVer: string = ver.replace(/\./g, '');
            return parseInt(appVer) >= parseInt(targetVer);
        }
    }
}