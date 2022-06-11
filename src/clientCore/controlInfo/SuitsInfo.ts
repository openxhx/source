namespace clientCore {
    export class SuitsInfo {
        private static xlsSuits: util.HashMap<xls.suits>;
        private static xlsCloth: util.HashMap<xls.itemCloth>;
        private static suitMan: util.HashMap<number[]>
        private static suitWoman: util.HashMap<number[]>;

        public static setup() {
            this.xlsCloth = xls.get(xls.itemCloth);
            this.xlsSuits = xls.get(xls.suits);
            this.suitMan = new util.HashMap();
            this.suitWoman = new util.HashMap();
            let allCloth = this.xlsCloth.getValues();
            for (const cloth of allCloth) {
                let suit = cloth.suitId;
                //女或通用
                if (cloth.sex == 1 || cloth.sex == 0) {
                    if (this.suitWoman.has(suit)) {
                        this.suitWoman.get(suit).push(cloth.clothesId);
                    }
                    else {
                        this.suitWoman.add(suit, [cloth.clothesId]);
                    }
                }
                //男或通用
                if (cloth.sex == 2 || cloth.sex == 0) {
                    if (this.suitMan.has(suit)) {
                        this.suitMan.get(suit).push(cloth.clothesId);
                    }
                    else {
                        this.suitMan.add(suit, [cloth.clothesId]);
                    }
                }
            }
        }

        public static getAllMySuit(): number[] {
            let allSuits = this.xlsSuits.getKeys();
            let rtn = [];
            rtn = _.filter(allSuits, (id) => {
                return this.getSuitInfo(parseInt(id)).allGet;
            }).map((s) => {
                return parseInt(s);
            })
            return rtn;
        }

        /**
         * 查询套装信息
         * @param suitId 套装id
         * @param sex 性别1女2男 不传就读LocalInfo.sex
         */
        public static getSuitInfo(suitId: number, sex?: number): { suitInfo: xls.suits, clothes: number[], allGet: boolean, hasCnt: number } {
            if (sex == undefined)
                sex = LocalInfo.sex;
            let suitInfo = this.xlsSuits.get(suitId);
            let clothes = sex == 2 ? this.suitMan.get(suitId) : this.suitWoman.get(suitId);
            let allGet = true;
            let cnt: number = 0;
            if (!clothes) {
                allGet = false;
                console.warn(suitId + '在itemCloth表中找不到对应的衣服');
            }
            else {
                _.each(clothes, (id) => {
                    if (!LocalInfo.checkHaveCloth(id))
                        allGet = false;
                    else
                        cnt++;
                })
            }
            let rtn = {
                suitInfo: suitInfo,
                clothes: clothes,
                allGet: allGet,
                hasCnt: cnt
            };
            return rtn;
        }

        /**随机一套套装 */
        public static getRandomSuitClothArr() {
            let allSuit = xls.get(xls.suits).getValues();
            let suitIdx = _.random(0, allSuit.length - 1, false);
            return this.getSuitInfo(allSuit[suitIdx].id).clothes;
        }

        /**
         * 检查是否拥有套装
         * @param param number|number[]
         */
        public static checkHaveSuits(param: number | number[]): boolean{
            if(param instanceof Array){
                return !_.find(param,(element: number)=>{ return !this.getSuitInfo(element).allGet; });
            }
            return this.getSuitInfo(param).allGet;
        }
    }
} 