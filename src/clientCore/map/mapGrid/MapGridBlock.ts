
namespace clientCore {
    /**
     * 
     */
    export class MapGridBlock extends Laya.Image {
        public row: number;
        public col: number;
        public blockType: number;
        public areaId: number;
        constructor() {
            super();
            this.anchorX = 0.5;
            this.anchorY = 0.5;
            this.alpha = 0.3;
        }
        public setInfo(r: number, c: number, t: number) {
            this.row = r;
            this.col = c;
            this.blockType = t;
            this.x = (c + 1) * clientCore.MapInfo.MAP_BLOCK_WIDTH * 3 / 4 - clientCore.MapInfo.MAP_BLOCK_WIDTH / 4;
            this.y = (r + 1) * clientCore.MapInfo.MAP_BLOCK_HEIGHT - (c % 2 == 0 ? clientCore.MapInfo.MAP_BLOCK_HEIGHT / 2 : 0);
        }
        public showPutState(canPutFlag: boolean) {
            if (canPutFlag) {
                this.skin = "commonUI/" + ["", "green", "cyan", "blue"][this.blockType] + ".png";
            }
            else {
                this.skin = "commonUI/red.png";
            }
            this.visible = true;
            this.alpha = 0.3;
        }
    }
}