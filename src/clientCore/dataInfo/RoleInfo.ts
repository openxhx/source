namespace clientCore.role {
    /** 额外属性名 枚举 */
    export enum ExtArrName {
        '血量' = 1,
        '攻击' = 2,
        '防御' = 3,
        '命中' = 11,
        '闪避' = 12,
        '暴击' = 13,
        '抗暴' = 14
    }
    /**属性type数组（有没有遍历枚举的办法？？） */
    export const EXT_ARRAY = [1, 2, 3, 11, 12, 13, 14];

    /** 角色属性*/
    export enum IdentityEnum {
        /** 火系*/
        FIRE = 1,
        /** 水系*/
        WATER,
        /** 风系*/
        WIND,
        /** 光明*/
        LIGHT,
        /** 暗影*/
        DARK
    }

    /** 角色品质*/
    export enum QualityEnum {
        R = 1,
        SR,
        SSR,
        UR
    }

    /** 额外属性 */
    export class RoleExtAttr {
        /**属性id */
        id: number;
        /**属性名称 */
        name: string;
        /**属性值 */
        value: number;
        /**当前上限 */
        limit: number;
        /** 上一阶段上限(有些地方要刨去) */
        lastLimit: number;
        constructor(id: number, limit: number) {
            this.id = id;
            this.name = ExtArrName[id];
            this.limit = limit;
            this.value = 0;
        }
    }

    export class RoleChainInfo {
        /** 羁绊的角色id */
        chainRoleId: number;

        /** 羁绊阶段 */
        chainStage: number;

        /** 增加的属性类型 */
        attrType: number;

        /** 增加的属性值 */
        attrValue: number
    }

    export class RoleInfo {
        static xlsIdData: util.HashMap<xls.characterId>;
        static xlsBlessData: util.HashMap<xls.characterBless>;
        static xlsStarData: util.HashMap<xls.characterStar>;
        static xlsStarNeedData: util.HashMap<xls.characterStarNeed>;
        static xlsLevelData: util.HashMap<xls.characterLevel>;
        static xlsGlobalData: xls.globaltest;
        static xlsAwakeData: util.HashMap<xls.awakeBase>;
        static xlsAwakenStrData: util.HashMap<xls.awakeStrengthen>;
        static xlsSkillData: util.HashMap<xls.SkillBase>;
        static xlsPrayData: util.HashMap<xls.godprayBase>;
        //服务器数据
        private _srvData: pb.IRole;
        //基础属性字典(等级提升获得的) key：ExtArrName  value：属性值（所有计算后总值）
        private _baseAttrHash: util.HashMap<number>;
        //相关表中对应的行
        private _xlsId: xls.characterId;
        private _xlsBless: xls.characterBless;
        private _xlsStar: xls.characterStar;
        private _xlsStarNeed: xls.characterStarNeed;
        private _xlsPray: xls.godprayBase;


        //--------------基础信息---------------
        //** id */
        public get id(): number {
            return this._xlsId.characterId;
        };

        /**形象id(一般就是角色id，除非选择了神祇形象) */
        public get skinId(): number {
            if (this.srvData.curPray > 0) {
                return this.srvData.curPray;
            }
            else {
                return this.id;
            }
        }

        /** 名称(如果是主角返回玩家昵称) */
        public get name(): string {
            return RoleManager.isMajor(this.id) ? LocalInfo.userInfo.nick : this._xlsId.name;
        }

        public get xlsId(): xls.characterId {
            return this._xlsId;
        }

        public get xlsPray() {
            return this._xlsPray;
        }

        public get xlsStar() {
            return this._xlsStar;
        }

        public get srvData(): pb.IRole {
            return this._srvData;
        }

        public get isLead() {
            return RoleManager.isMajor(this.id);
        }

        public get fight() {
            let rtn = 0;
            let global = xls.get(xls.globaltest).get(1);
            rtn += Math.floor(this.getAttrInfo(ExtArrName.血量).total * global.combatHpCoeff / 100);
            rtn += Math.floor(this.getAttrInfo(ExtArrName.攻击).total * global.combatActCoeff / 100);
            rtn += Math.floor(this.getAttrInfo(ExtArrName.防御).total * global.combatDefCoeff / 100);
            rtn += Math.floor(this.getAttrInfo(ExtArrName.命中).total * global.combathitCoeff / 100);
            rtn += Math.floor(this.getAttrInfo(ExtArrName.闪避).total * global.combatDodgeCoeff / 100);
            rtn += Math.floor(this.getAttrInfo(ExtArrName.暴击).total * global.combatCritCoeff / 100);
            rtn += Math.floor(this.getAttrInfo(ExtArrName.抗暴).total * global.combatOpposeCritCoeff / 100);
            return rtn;
        }

        /** 角色品质*/
        public get quality() {
            return this._xlsId.quality;
        }

        /** 角色属性*/
        public get Identity(): number {
            return this.xlsPray ? this.xlsPray.Identity : this._xlsId.Identity;
        }

        /** 角色战斗属性*/
        public get battleType(): number{
            return this._xlsPray ? this._xlsPray.battleType : this._xlsId.battleType;
        }

        //--------------培养属性-----------------

        //-------等级相关---------
        /** 总经验(如果是主角 请用LocalInfo获取经验) */
        public exp: number;
        /** 等级 */
        private _lv: number;


        //-------星级相关---------
        /** 星级 */
        public star: number;
        /** 星级成长率 */
        public starAdd: number;
        /** 升下一星所需等级 */
        public nextStarNeedLv: number;
        /** 升下一星所需物品 */
        public nextStarNeedItem: GoodsInfo;

        //------------祝福相关--------------------
        /**  当前祝福阶级 */
        public bless: number;
        /** 当前祝福增加属性值(包含随机值，服务器给的) */
        public extAttr: RoleExtAttr[];
        /** 特殊属性（存放的是2,3,4,5阶祝福的特殊属性） */
        public extSpecialAttr: RoleExtAttr[];
        /** 能否升阶祝福(所有祝福属性达到当前上限) */
        public get canUpBlessStage(): boolean {
            if (this.bless == RoleInfo.xlsGlobalData.blessCostItem.length)
                return false;
            for (let attr of this.extAttr) {
                if (attr.value < attr.limit)
                    return false;
            }
            return true;
        }
        /** 获取当前升级/升阶祝福所需道具 */
        public get upBlessNeedGoods(): GoodsInfo {
            let goods = new GoodsInfo();
            if (this.canUpBlessStage) {
                goods = GoodsInfo.create(RoleInfo.xlsGlobalData.blessAddAttr[this.bless - 1]);
            }
            else {
                goods = GoodsInfo.create(RoleInfo.xlsGlobalData.blessCostItem[this.bless - 1]);
            }
            return goods;
        }

        public get maxStar() {
            return this.xlsStar.maxStarLevel;
        }

        //--------------羁绊相关----------------

        /** 所有羁绊 */
        public chainArr: RoleChainInfo[];

        //-------------好感度相关--------------

        /** 当前总好感度 */
        public faver: number;

        /** 当前好感度等级 */
        public faverLv: number;

        /** 当前好感度等级的经验*/
        public currFaverExp: number;

        /** 当前好感度等级 好感度 */
        public currFaver: number;

        /**下一级需要好感度 */
        public needFaver: number;

        /**当前是否有任务需要完成才能继续提升好感度 */
        public currHaveTask: boolean;

        /** 当前等级所需任务 */
        public currTask: number;

        /** 当前好感度百分比 */
        public faverPercent: number;

        public get lv(): number {
            if (this.srvData.isLead)
                return LocalInfo.userLv;
            else
                return this._lv;
        }

        //---------------觉醒相关----------------

        public get awakeLv(): number {
            return this._srvData.awakenLvl;
        }

        /**可以觉醒的id(只有基础角色才有) */
        public get awakeIds(): number[] {
            return _.map(_.filter(RoleInfo.xlsAwakeData.getValues(), ['froleID', this.id]), 'rroleID');
        }

        //进化下一阶所需道具
        public get awakeNextNeed(): IGoodsInfo {
            let info = RoleInfo.xlsAwakenStrData.get(this.id);
            if (info) {
                let obj = info.needCurrency[this.awakeLv];
                return { itemID: obj.v1, itemNum: obj.v2 };
            }
            else {
                return { itemID: 0, itemNum: 0 };
            }
        }

        //--------------战斗属性--------------
        public get skillInfos() {
            let skills: number[] = this.srvData.curPray > 0 ? this._xlsPray.skillId : this._xlsId.skillId;
            return _.map(skills, (element: number) => {
                return RoleInfo.xlsSkillData.get(element);
            });
        };

        /**更换神祇 */
        changePray(id: number) {
            this.srvData.curPray = id;
            this._xlsPray = RoleInfo.xlsPrayData.get(this.srvData.curPray);
        }

        constructor(srvData: pb.IRole) {
            this._srvData = srvData;
            this._baseAttrHash = new util.HashMap();
            let id = this._srvData.roleId;
            //先读出表数据
            this._xlsId = RoleInfo.xlsIdData.get(id);
            this._xlsBless = RoleInfo.xlsBlessData.get(id);
            this._xlsStar = RoleInfo.xlsStarData.get(id);
            this._xlsPray = RoleInfo.xlsPrayData.get(srvData.curPray);
            let arr = RoleInfo.xlsStarNeedData.getValues();
            //读取升星需求表characterStarNeed
            for (let info of arr) {
                let nextStar = Math.min(10, this.srvData.star + 1);
                if ((info.countryId == this._xlsId.Identity) && (info.star == nextStar)) {
                    this._xlsStarNeed = info;
                    break;
                }
            }
            if (!this._xlsId)
                console.error('id表中缺失' + this.id);
            if (!this._xlsBless)
                console.error('bless表中缺失' + this.id);
            if (!this._xlsStar)
                console.error('star表中缺失' + this.id);

            //写入成员变量
            this.parseLvInfo();
            this.parseStarInfo();
            this.parseBlessInfo();
            this.parseFaverInfo();
            this.parseChainInfo();
            this.parseFavorTask();
        }

        private parseLvInfo() {
            this.exp = this._srvData.isLead ? LocalInfo.userInfo.exp : this._srvData.exp;
            let info = LocalInfo.parseLvInfoByExp(this.exp);
            this._lv = info.lv;
            this._baseAttrHash.add(ExtArrName.血量, this._xlsId.hpBasicAdd.v2 + this._xlsId.hpBasicAdd.v3 * (this._lv - 1));
            this._baseAttrHash.add(ExtArrName.防御, this._xlsId.defBasicAdd.v2 + this._xlsId.defBasicAdd.v3 * (this._lv - 1));
            this._baseAttrHash.add(ExtArrName.攻击, this._xlsId.atkBasicAdd.v2 + this._xlsId.atkBasicAdd.v3 * (this._lv - 1));
            this._baseAttrHash.add(ExtArrName.命中, this._xlsId.hitBasicAdd.v2 + this._xlsId.hitBasicAdd.v3 * (this._lv - 1));
            this._baseAttrHash.add(ExtArrName.闪避, this._xlsId.dodBasicAdd.v2 + this._xlsId.dodBasicAdd.v3 * (this._lv - 1));
            this._baseAttrHash.add(ExtArrName.暴击, this._xlsId.critBasicAdd.v2 + this._xlsId.critBasicAdd.v3 * (this._lv - 1));
            this._baseAttrHash.add(ExtArrName.抗暴, this._xlsId.resiBasicAdd.v2 + this._xlsId.resiBasicAdd.v3 * (this._lv - 1));
        }

        /**
         * 解析经验值相关数据 (根据characterLevel表)
         * @param exp 经验值
         * @returns lv 等级
         * @returns currExp 当前等级经验值
         * @returns nextLvNeed 升到下一级需要经验值
         * @returns expPercent 当前经验值百分比 0-1
         */
        public static parseLvInfoByExp(exp: number): { lv: number, currExp: number, nextLvNeed: number, expPercent: number } {
            return LocalInfo.parseLvInfoByExp(exp);
        }

        /**
         * 查询某一级到某一级需要多少经验值
         * @param nowLv 当前等级
         * @param targetLv 目标等级
         */
        public static getExpNeedByLv(nowLv: number, targetLv: number) {
            let maxLv = _.last(RoleInfo.xlsLevelData.getValues()).characterLevel;
            nowLv = _.clamp(nowLv, 1, maxLv);
            targetLv = _.clamp(targetLv, 1, maxLv);
            let expDiff = 0;
            for (let i = nowLv; i < targetLv; i++) {
                expDiff += RoleInfo.xlsLevelData.get(i).expneed;
            }
            return expDiff;
        }


        private parseStarInfo() {
            this.star = this._srvData.star;
            this.starAdd = this._xlsStar.starAdd[this.star];
            this.nextStarNeedLv = this._xlsStarNeed.levelLimit;
            this.nextStarNeedItem = new GoodsInfo(this._xlsStarNeed.starNeed.v1, this._xlsStarNeed.starNeed.v2);
        }

        private parseBlessInfo() {
            this.bless = Math.max(this._srvData.blessLvl, 1);
            this.extAttr = [];
            let typeInfo = this._xlsBless['type'] as number[];
            let idx = 0;
            for (let type of typeInfo) {
                let info = new RoleExtAttr(type, this._xlsBless[`stage${this.bless}Limit`][idx]);
                info.lastLimit = this.bless != 1 ? this._xlsBless[`stage${this.bless - 1}Limit`][idx] : 0;
                this.extAttr.push(info);
                idx++;
            }
            //防止服务器给的额外属性少于6个 自己赋值下（没给的默认值为0）
            let hash: util.HashMap<RoleExtAttr> = new util.HashMap();
            this.extAttr.map((v) => {
                hash.add(v.id, v);
            })
            for (let o of this._srvData.attrs) {
                hash.get(o.attr).value = o.value;
            };
            hash.clear();
            this.extSpecialAttr = [];
            for (let i = 2; i < 6; i++) {
                let info = this._xlsBless[`stage${i}Special`] as xls.pair;
                let attr = new RoleExtAttr(info.v1, 0);
                attr.value = info.v2;
                this.extSpecialAttr.push(attr);
            }
        }

        public updateFaverInfo(data: pb.sc_favor_info_change_notify): void {
            this._srvData.favorLvl = data.favorLvl;
            this._srvData.favor = data.favorNum;
            this.parseFaverInfo();
        }

        private parseFaverInfo() {
            this.faver = this._srvData.favor;
            if (RoleManager.isMajor(this.id)) {
                this.currHaveTask = false;
                this.currFaver = 0;
                this.currTask = 0;
                this.faverLv = 0;
                this.needFaver = 0;
                this.faverPercent = 0;
            }
            else {
                this.currHaveTask = this._srvData.favorTask && this._srvData.favorTask.taskid != 0; //是否有任务
                this.faverLv = this._srvData.favorLvl;
                let idx = 0;
                //好感度表信息使用对应基础角色的
                let baseRoleId = RoleInfo.xlsIdData.get(this.id).mutexId;
                let relationShipInfo = RoleInfo.xlsIdData.get(baseRoleId).relationShip;
                let triple: xls.triple = relationShipInfo[this.faverLv - 1]; //-1是因为现在好感度等级初始为1了
                if (!triple)
                    triple = relationShipInfo[relationShipInfo.length - 1]; //如果没有就取最后一位
                this.needFaver = triple.v1;
                this.faverPercent = Math.min(this.faver / this.needFaver, 1);
            }
        }

        private parseChainInfo() {
            if (RoleManager.isMajor(this.id)) {
                this.chainArr = [];
            }
            else {
                let srvChainStage = [1, 2, 3, 4];
                this.chainArr = [];
                let idx = 1;
                for (let stage of srvChainStage) {
                    let info = new RoleChainInfo();
                    info.chainRoleId = this._xlsId['karma' + idx];
                    info.chainStage = stage;
                    info.attrType = this._xlsId[`karma${idx}Addtype`][stage - 1].v1;
                    info.attrValue = this._xlsId[`karma${idx}Addtype`][stage - 1].v2;
                    this.chainArr.push(info);
                    idx++;
                }
            }
        }

        /** 写入好感度任务*/
        private parseFavorTask(): void {
            this.srvData.favorTask && this.srvData.favorTask.taskid && FavorTaskMgr.ins.addTaskMap(this.srvData.favorTask);
        }

        /**根据Identity获取属性信息
         * @total 总
         * @levelAdd 等级加成(基础属性)
         * @starAdd 星级加成
         * @blessAdd 祝福加成
         * @chainAdd 羁绊加成
         * @pray 神祇加成
         */
        public getAttrInfo(type: number): { total: number, base: number, starAdd: number, blessAdd: number, chainAdd: number, pray: number, collect: number } {
            //先重新计算一次等级信息
            this.parseLvInfo();
            let total: number = 0;
            let base = this._baseAttrHash.get(type);
            let starAdd = this.getStarAttr(type, this.star);
            let blessAdd = this.getBlessAttr(type);
            let chainAdd = this.getChainAttr(type);
            let prayAdd = this.getPrayAttr(type);
            let colllectAdd = this.getCollectAttr(type);
            total = base + starAdd.v1 + starAdd.v2 + blessAdd + chainAdd + prayAdd + colllectAdd;
            return { total: total, base: base, starAdd: starAdd.v1 + starAdd.v2, blessAdd: blessAdd, chainAdd: chainAdd, pray: prayAdd, collect: colllectAdd };
        }

        /**解析通用属性triple字段 */
        private parseAttr(data: xls.triple, type: number) {
            //[属性添加方式(1:数值 2:百分比 3:buff(这里可以忽略))， 属性类型type， 数值]
            if (data.v2 != type)
                return 0;
            switch (data.v1) {
                case 1:
                    return data.v3;
                case 2:
                    return Math.floor(this._baseAttrHash.get(data.v2) * data.v3 / 100);
                case 3:
                    return 0;
                default:
                    break;
            }
        }

        /**根据星级计算升星增长的属性
         * @param type 属性枚举
         * @returns {v1:星级成长率带来加成 v2:额外升星属性}
         */
        public getStarAttr(type: ExtArrName, star: number) {
            let base = this._baseAttrHash.get(type);
            let add1 = Math.floor((this._xlsStar.starAdd[star] - 100) * base / 100);//成长率加成
            let add2 = 0;//星级加成
            if (star > 0) {
                star = _.clamp(star, 1, 10);
                let tripleArr = this._xlsStar[`star${star}Add`] as xls.triple[];
                for (const tri of tripleArr) {
                    add2 += this.parseAttr(tri, type);
                }
            }
            return { v1: add1, v2: add2 };
        }

        private getBlessAttr(type: ExtArrName) {
            //祝福增加的属性（服务器给的)
            let extInfo = _.find(this.extAttr, (v) => {
                return v.id == type;
            });
            //特殊祝福阶段增加的属性，（数组中是从2阶开始的)
            let sum = extInfo ? extInfo.value : 0;
            let extSpecial = this.extSpecialAttr[this.bless - 2];
            if (extSpecial && extSpecial.id == type) {
                sum += extSpecial?.value ?? 0;
            }
            return sum;
        }

        private getChainAttr(type: number) {
            let add = 0;
            for (let i = 1; i < 5; i++) {
                if (RoleManager.instance.getRoleById(this._xlsId['karma' + i])) {
                    add += this.parseAttr(this._xlsId[`karma${i}Addtype`], type)
                }
            }
            return add;
        }

        private getPrayAttr(type: number) {
            let add = 0;
            for (const prayId of this._srvData.allPray) {
                let xlsPray = RoleInfo.xlsPrayData.get(prayId);
                if (xlsPray)
                    _.map(xlsPray.skinBuff, (v) => { add += this.parseAttr(v, type); });
            }
            return add;
        }

        private getCollectAttr(type: number) {
            let attrInfo = _.find(this._srvData.achvAttrs, (o) => {
                return o.attr == type;
            })
            return attrInfo?.value ?? 0;
        }


        /**
         * 获取某额外属性值(祝福中提升的随机值)
         * @param id 属性枚举
         */
        public getExtAttByName(id: ExtArrName) {
            for (const attr of this.extAttr) {
                if (attr.id == id) {
                    return attr.value;
                }
            }
            return 0;
        }
    }
}