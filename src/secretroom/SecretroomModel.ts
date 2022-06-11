namespace secretroom{
    export class SecretroomModel implements clientCore.BaseModel{
        /** 当前房间的jsonfile数据*/
        private _jsonData: object;
        private _roomId: number;
        private _lvData: object = {};
        constructor(){}
        dispose(): void{
            this._jsonData = null;
            this._lvData = null;
        }
        public get jsonData(): object{
            return this._jsonData;
        }
        public set jsonData(value: object){
            this._jsonData = null;
            this._jsonData = value;
        }
        
        public get roomId(): number{
            return this._roomId;
        }
        public set roomId(value: number){
            this._roomId = value;
        }
    
        public getLevel(id: number): number{
            return this._lvData[id];
        }

        public setLevel(id: number,value: number): void{
            this._lvData[id] = value;
        }
    }
}