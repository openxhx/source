namespace clientCore {
    /**
     * 派对方案管理
     */
    export class PartySchemeManager {
        private static _partyDecoSchemeArr:pb.IOrnamentScheme[];

        public static get partyDecoSchemeArr():pb.IOrnamentScheme[]{
            return this._partyDecoSchemeArr;
        }
        public static checkPartyDecoScheme(){
            net.sendAndWait(new pb.cs_get_all_party_house_scheme({})).then((data:pb.sc_get_all_party_house_scheme)=>{
                this._partyDecoSchemeArr = data.ornSchemes;
            });
        }
        public static findOneEmptyPos():number{
            for(let info of this._partyDecoSchemeArr){
                if(info.unlock == 1 && info.counts <= 0){
                    return info.posId;
                }
            }
            return 0;
        }
        public static async saveOneDecoScheme(posID:number,name:string,optInfoArr:pb.ImapItem[]){
            const data = await net.sendAndWait(new pb.cs_save_party_house_scheme({ posId: posID, name: name ,items:optInfoArr}));
            for (let i = 0; i < this._partyDecoSchemeArr.length; i++) {
                if (this._partyDecoSchemeArr[i].posId == data.ornaScheme.posId) {
                    this._partyDecoSchemeArr[i] = data.ornaScheme;
                    break;
                }
            }
        }

        public static async deleteOneScheme(id:number){
            await net.sendAndWait(new pb.cs_delete_party_house_scheme({ posId: id }));
            for (let i = 0; i < this._partyDecoSchemeArr.length; i++) {
                if (this._partyDecoSchemeArr[i].posId == id) {
                    this._partyDecoSchemeArr[i].counts = 0;
                    break;
                }
            }
        }
        // public static isSchemePosLock(posID:number):boolean{
        //     for(let i = 0;i<this._partyDecoSchemeArr.length;i++){
        //         if(this._partyDecoSchemeArr[i].posId == posID){
        //             return false;
        //         }
        //     }
        //     return true;
        // }
        public static getSaveSchemeNum():number{
            let count = 0;
            for(let i = 0;i<this._partyDecoSchemeArr.length;i++){
                if(this._partyDecoSchemeArr[i].counts > 0){
                    count++;
                }
            }
            return count;
        }
        public static getAllUnlockNum():number{
            let count = 0;
            for(let i = 0;i<this._partyDecoSchemeArr.length;i++){
                if(this._partyDecoSchemeArr[i].unlock > 0){
                    count++;
                }
            }
            return count;
        }
        public static getSchemeInfoByPosID(posID:number):pb.IOrnamentScheme{
            for(let i = 0;i<this._partyDecoSchemeArr.length;i++){
                if(this._partyDecoSchemeArr[i].posId == posID){
                    return this._partyDecoSchemeArr[i];
                }
            }
        }
    }
}