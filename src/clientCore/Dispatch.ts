namespace clientCore{


    class EventData{
        id: number;
        cnt: number;
        mod: number;
        tips: string;
        constructor(){}
    }

    /**
     * 事件派遣
     */
    export class Dispatch{

        private static _map: Map<number,EventData> = new Map();

        constructor(){}

        static reg(id: number,cnt: number,mod: number,tips: string): void{
            let data: EventData = this._map.get(id);
            if(!data){
                data = new EventData();
                this._map.set(id,data);
            }
            data.id = id;
            data.cnt = cnt;
            data.tips = tips;
            data.mod = mod;
        }

        static distribute(mts: pb.IMts[]): void{
            let len: number = mts.length;
            for(let i: number = 0; i<len; i++){
                let element: pb.IMts = mts[i];
                let data: EventData = this._map.get(element.mtsId);
                if(data && data.cnt <= element.mtsCnt){ //材料满足
                    this._map.delete(element.mtsId);
                    alert.showSmall(data.tips,{
                        callBack:{
                            caller: this,
                            funArr: [()=>{
                                clientCore.ToolTip.gotoMod(data.mod);
                            }]
                        }
                    });
                    break;
                }
            }
        }
    }
}