namespace clientCore {
    /**
     * 编辑的时候，显示的网格对象
     */
    export class MapOperateBlock extends Laya.Image{
        public row:number;
        public col:number;
        public blockType:number;
        constructor(r:number,c:number){
            super();
            this.row = r;
            this.col = c;

            this.anchorX = 0.5;
            this.anchorY = 0.5;
            this.skin = "commonUI/red.png";

            this.alpha = 0.5;

            let rPos = clientCore.MapInfo.MAP_BLOCK_HEIGHT*this.row + (this.col%2 == 0?0:clientCore.MapInfo.MAP_BLOCK_HEIGHT/2);
            let cPos = clientCore.MapInfo.MAP_BLOCK_WIDTH*3/4 * this.col;
            this.pos(cPos,rPos);
        }

        public showPutState(canPutFlag:boolean){
            if(canPutFlag){
                this.skin = "commonUI/" + ["", "green", "cyan", "blue"][this.blockType] + ".png";
            }
            else{
                this.skin = "commonUI/red.png";
            }
        }
    }
}