namespace clientCore {
    /**
     * 派对地图管理
     */
    export class PartyMapManager {
        private static _wallCon:Laya.Sprite;
        private static _doorWallImg:Laya.Image;//门的那面墙
        private static _groundCon:Laya.Sprite;
        private static _doorImg:Laya.Image;//门
        private static _wallID:number = -1;
        private static _doorID:number = -1;
        private static _groundID:number = -1;
        private static DOOR_WIDTH:number = 229;
        private static WALL_WIDTH:number = 200;
        private static GROUND_WIDTH:number = 192;//阴影部分不算
        static setUp(){
            if(!this._wallCon){
                this._wallCon = new Laya.Sprite();
            }
            if(!this._doorWallImg){
                this._doorWallImg = new Laya.Image();
                this._doorWallImg.x = MapInfo.mapWidth - this.DOOR_WIDTH;
            }
            if(!this._groundCon){
                this._groundCon = new Laya.Sprite();
                this._groundCon.y = 675;
            }
            if(!this._doorImg){
                this._doorImg = new Laya.Image();
                this._doorImg.x = 3340;
                this._doorImg.y = 370;
            }
            MapManager.curMap.middleMap.addChild(this._wallCon);
            MapManager.curMap.middleMap.addChild(this._groundCon);
            MapManager.curMap.middleMap.addChild(this._doorWallImg);
            MapManager.curMap.middleMap.addChild(this._doorImg);
        }
        static initMap(wallID:number,groundID:number,doorID:number){
            this._groundID = -1;
            this.changeGround(groundID);
            this._wallID = -1;
            this.changeWall(wallID);
            this._doorID = -1;
            this.changeDoor(doorID);
        }
        static changeWall(id:number){
            if(this._wallID != id){
                this._wallID = id;
                this._wallCon.removeChildren();
                for(let i = 0;i< 17;i++){
                    let img = new Laya.Image();
                    img.skin = `res/party/wall/${id}_L.png`;
                    img.x = MapInfo.mapWidth - this.DOOR_WIDTH - i*this.WALL_WIDTH - this.WALL_WIDTH;
                    this._wallCon.addChild(img);
                }
                this._doorWallImg.skin = `res/party/wall/${id}_R.png`;
            }
        }
        static changeDoor(id:number){
            if(this._doorID != id){
                this._doorID = id;
                this._doorImg.skin = `res/party/door/${id}.png`;
            }
        }
        static changeGround(id:number){
            if(this._groundID != id){
                this._groundID = id;
                //添加地板素材
                this._groundCon.removeChildren();
                for(let i = 0;i< 19;i++){
                    let img = new Laya.Image();
                    img.skin = `res/party/ground/${id}.png`;
                    img.x = MapInfo.mapWidth - this.DOOR_WIDTH - i*this.GROUND_WIDTH - this.GROUND_WIDTH;
                    this._groundCon.addChild(img);
                }
            }
        }
    }
}