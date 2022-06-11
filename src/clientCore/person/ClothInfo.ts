/// <reference path="Cloth_Enum.ts" />
namespace clientCore {
    /**女号需要特殊偏移的部分 */
    const NEED_SPECIAL_DIFF = [
        CLOTH_TYPE.Head,
        CLOTH_TYPE.Face,
        CLOTH_TYPE.Hair,
        CLOTH_TYPE.Ear,
        CLOTH_TYPE.Eyebrow,
        CLOTH_TYPE.Eye,
        CLOTH_TYPE.Mouth,
    ]
    export class ClothInfo {
        public id: number;
        public partArr: Array<ClothPartInfo>;
        public serverInfo: pb.IClothes;
        public readonly name: string;
        public readonly clothType: number;
        public readonly suitId: number;
        public readonly xlsInfo: xls.itemCloth;

        public constructor(id: string, infoArr: any[]) {
            this.id = parseInt(id);
            this.partArr = [];
			/**如果bin\res\json\clothItemInfo.json 表里的服装ID在itemCloth里面没有，就跳过
			 * itemCloth表里面的服装ID策划有可能会删掉，那么clothItemInfo.json偏移表里面的数据除非重新成
			 * 否则就会缺少这个服装的信息。
			 */
            if (xls.get(xls.itemCloth).has(this.id)) {
                this.xlsInfo = xls.get(xls.itemCloth).get(this.id);
                this.name = this.xlsInfo.name;
                this.suitId = this.xlsInfo.suitId;
                this.clothType = this.xlsInfo.kind;
                this.partArr = [];
                if (infoArr)
                    for (let info of infoArr) {
                        //格式为数组 [slot名，图片路径,px,py]
                        var partInfo: ClothPartInfo = new ClothPartInfo(info[0], info[1], info[2], info[3]);
                        this.partArr.push(partInfo);
                    }
                if (NEED_SPECIAL_DIFF.indexOf(this.clothType) > -1 && this.id < 4000000 && this.xlsInfo.sex == 1) {
                    for (const part of this.partArr) {
                        part.py -= 4;
                    }
                }
            }
        }
    }
}