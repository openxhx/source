namespace clientCore {
    /**
     * 派对地图物品信息结构体
     * 
     */
    export class PartyItemInfo {
        public ID: number;
        public getTime: number;
        public row:number;
        public col:number;
        public putState:number;
        public isReverse:boolean = false;

        public xlsInfo:xls.partyHouse;
        public buildInfo: pb.IBuild;

        public reverseBlocksPosArr:xls.pair[];

        get type(): number {
            return this.xlsInfo.furnitureType;
        }
        /** 获取占格子信息，翻转跟没翻转占格子信息不一样 */
        public get blockPosArr(): xls.pair[] {
            return this.isReverse ? this.reverseBlocksPosArr : this.xlsInfo.blockPosArr;
        }
        /** 获取图片的便宜位置，翻转跟没翻转的便宜位置不一样 */
        public get offsetPos(): xls.position {
            return this.isReverse ? this.xlsInfo.reverseOffsetPos : this.xlsInfo.offsetPos;
        }
        get putType():number{
            return this.xlsInfo.mapArea;
        }
        get canReverse():boolean{
            return this.xlsInfo.reverseFlag == 1;
        }
        get reverseOffsetPos():xls.position{
            return this.xlsInfo.reverseOffsetPos;
        }

        static createInfo(info:pb.IBuild):PartyItemInfo{
            let itemInfo = new PartyItemInfo();
            itemInfo.ID = info.buildId;
            itemInfo.getTime = info.getTime;
            itemInfo.row = info.pos.x;
            itemInfo.col = info.pos.y;
            itemInfo.putState = info.whereIs;
            itemInfo.isReverse = info.attrs.pAttrs.isReverse == 1;
            itemInfo.xlsInfo = xls.get(xls.partyHouse).get(itemInfo.ID);
            this.initReverseBlockInfo(itemInfo);
            return itemInfo;
        }
        static initReverseBlockInfo(itemInfo:PartyItemInfo) {
            itemInfo.reverseBlocksPosArr = [];
            let posArr = itemInfo.xlsInfo.blockPosArr;
            for (let i = 0; i < posArr.length; i++) {
                itemInfo.reverseBlocksPosArr.push({ v1: posArr[i].v1, v2: -posArr[i].v2 });
            }
        }

        static createItemInfoByID(id:number){
            let info = new PartyItemInfo();
            info.ID = id;
            info.xlsInfo = xls.get(xls.partyHouse).get(info.ID);
            info.putState = 0;
            info.getTime = MapItemInfo.uniqueGetTime;
            this.initReverseBlockInfo(info);
            return info;
        }
    }
}