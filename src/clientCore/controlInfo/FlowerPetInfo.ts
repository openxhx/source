namespace clientCore {

    export interface ShowType {
        big: number,
        little: number
    }

    /**
     * 花宝信息
     */
    export class FlowerPetInfo {
        /** vip花宝类型，非vip为0 月卡1 季卡2 年卡3*/
        static petType: number;
        static expireTime: number;
        static freeExp: number;
        static followStatus: number;
        static select: ShowType;

        /** 花宝的购买清理字典*/
        private static _buyMap: Object = {};
        private static _allPets: number[];

        static initInfo(baseInfo: pb.IUserBase): void {
            this.petType = baseInfo.babyVipType;
            this.expireTime = parseInt(baseInfo.babyVipTime);
            this.followStatus = baseInfo.babyFollow;
            this.freeExp = baseInfo.babyFreeExp;
            this.select = baseInfo.babyImage ? this.analysis(baseInfo.babyImage) : this.getShow(this.petType, this.getLv(this.freeExp));
        }
        
        /** 得到花宝已解锁的皮肤*/
        static async setup(): Promise<void>{
            return net.sendAndWait(new pb.cs_get_all_baby_image()).then((msg: pb.sc_get_all_baby_image)=>{
                this._allPets = msg.allSkin;
            })
        }

        static addPets(array: number[]): void{
            this._allPets = _.concat(this._allPets, array);
        }

        /**
         * 获取cd时间
         * @param type 0: 喂食 1：抚摸 
         */
        static getCd(type: number, lv: number): number {
            let data: xls.babyFree | xls.babyPay = this.petType == 0 ? xls.get(xls.babyFree).get(lv) : xls.get(xls.babyPay).get(this.petType);
            return type == 0 ? data.eatCd : data.strokeCd;
        }

        /**
         * 根据经验值获取免费花宝的等级
         */
        static getLv(exp: number): number {
            let array: xls.babyFree[] = xls.get(xls.babyFree).getValues();
            let len: number = array.length;
            let lv: number = 0;
            for (let i: number = 0; i < len; i++) {
                if (exp < array[i].exp) break;
                lv = array[i].id;
            }
            return lv;
        }

        /**
         * 获取花宝形象信息 根据花宝类型 + 花宝等级
         * @param type 
         * @param lv 
         */
        static getShow(type: number, lv: number): ShowType{
            return {big: type > 0 ? 3 : lv, little: type > 0 ? type + 1 : 1};
        }


        /**
         * 检查是否拥有某个花宝
         * @param big 
         * @param little 
         */
        static checkIsHave(big: number,little: number): boolean{
            return _.find(this._allPets, (element: number)=>{ 
                let v: ShowType = this.analysis(element);
                return v.big == big && v.little == little;
            }) != void 0;
        }

        /**
         * 解析服务端类型到显示花宝的大小类型
         * @param value 
         */
        static analysis(value: number): ShowType{
            let valueStr: string = value.toString();
            let len: number = valueStr.length;
            return {big: parseInt(valueStr.slice(0,len / 2)), little: parseInt(valueStr.slice(len / 2, len))};
        }

        /**
         * 获取宝箱奖励
         * 1-免费花宝幼年 2-免费花宝少年 3-免费花宝成年 4-月卡花宝 5-季卡花宝 6-年卡花宝
         * @param lv 
         */
        static getRewards(type: number, lv: number): xls.triple[] {
            let array: xls.babyReward[] = xls.get(xls.babyReward).getValues();
            let len: number = array.length;
            for (let i: number = 0; i < len; i++) {
                let element: xls.babyReward = array[i];
                if (type == 0) { //免费花宝
                    if (element.babyType == lv && element.content == 4) {
                        return element.reward;
                    }
                } else {
                    if (element.babyType == type + 3 && element.content == 4) {
                        return element.reward;
                    }
                }
            }
        }
        /**
         * 
         * @param type 根据类型获取特权加成数值
         */
        static getPrivilegeByType(type: number): number {
            let lv = FlowerPetInfo.petType;
            if (lv < 1) {
                return 0;
            }
            let privilegeArr = xls.get(xls.babyPay).get(lv).privilege;
            for (let i = 0; i < privilegeArr.length; i++) {
                if (privilegeArr[i].v1 == type) {
                    return privilegeArr[i].v2;
                }
            }
            return 0;
        }

        static async getBuyStatus(): Promise<void> {
            await net.sendAndWait(new pb.cs_get_flower_baby_buy_history()).then((msg: pb.sc_get_flower_baby_buy_history) => {
                for (let i: number = 1; i < 4; i++) {
                    this._buyMap[i] = util.getBit(msg.history, i);
                }
            })
        }

        /** 检查某个花宝是否购买过*/
        static checkBuyHistory(id: number): boolean {
            return this._buyMap[id] && this._buyMap[id] == 1;
        }

        static addBuyHistory(id: number): void {
            this._buyMap[id] = 1;
        }
    }
}