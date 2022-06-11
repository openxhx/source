namespace clientCore {
    /**
     * 编辑的时候，显示的网格对象
     */
    export class MapOperateUI extends Laya.Sprite{
        public putType:number;
        public gridCon:Laya.Sprite;
        public img:Laya.Image;
        public blockArr:MapOperateBlock[];
        public blockPosArr:xls.pair[];
        constructor(){
            super();
            this.gridCon = new Laya.Sprite();
            this.img = new Laya.Image();
            this.addChild(this.img);
            this.addChild(this.gridCon);
            this.blockArr = [];
            this.img.mouseEnabled = true;

            this.gridCon.mouseEnabled = false;
        }       
        public showBlocks(blockPosArr:xls.pair[]){
            this.removePreBlocks();
            this.blockArr = [];
            this.blockPosArr = blockPosArr;
            for (let i = 0;i<blockPosArr.length;i++){
                let block = new MapOperateBlock(blockPosArr[i].v1,blockPosArr[i].v2);
                block.blockType = this.putType;
                this.blockArr.push(block);
                block.alpha = 0.7;
                this.gridCon.addChild(block);
            }
        }
        private removePreBlocks(){
            if(this.blockArr && this.blockArr.length > 0){
                for(let i = 0;i<this.blockArr.length;i++){
                    this.blockArr[i].removeSelf();
                }
            }
            this.blockArr.splice(0);
        }

    }
}