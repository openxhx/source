namespace clientCore {
    /**
     * 
     */
    export class SkinInfo {
        public skinID: number;
        public serverID: number;
        public name: string;
        public putType: number;

        public static createSkinInfo(id: number): SkinInfo {
            let info = new SkinInfo();
            info.skinID = id;
            if (id == 3400001) {
                info.serverID = 0;
            } else {
                info.serverID = id;
            }
            info.name = xls.get(xls.itemBag).get(id).name;
            info.putType = 5;
            return info;
        }
    }
}