namespace clientCore {
    export class PcImp implements BaseMoveImp {
        private touchDownState: boolean = false;
        private preTouchPos: Laya.Point;
        private mapOriPos: Laya.Point;

        mouseDown(e: Laya.Event) {
            this.touchDownState = true;
            this.mapOriPos = new Laya.Point(clientCore.LayerManager.mapLayer.x, clientCore.LayerManager.mapLayer.y);
            this.preTouchPos = new Laya.Point(Laya.stage.mouseX, Laya.stage.mouseY);
        }

        mouseMove(e: Laya.Event) {
            if (this.touchDownState) {
                let curTouchPos = new Laya.Point(Laya.stage.mouseX, Laya.stage.mouseY);
                var disx: number = curTouchPos.x - this.preTouchPos.x;
                var disy: number = curTouchPos.y - this.preTouchPos.y;
                clientCore.LayerManager.mapLayer.x = this.mapOriPos.x + disx;
                clientCore.LayerManager.mapLayer.y = this.mapOriPos.y + disy;
                MapManager.clampMap();
            }
        }

        mouseUpOrOut(e: Laya.Event) {
            if (!MapInfo.mapEditState && this.preTouchPos && this.preTouchPos.distance(Laya.stage.mouseX, Laya.stage.mouseY) < 3) {
                clientCore.PeopleManager.getInstance().flyTo(new Laya.Point(clientCore.LayerManager.mapLayer.mouseX, clientCore.LayerManager.mapLayer.mouseY));
            }
            this.touchDownState = false;
            this.preTouchPos = null;
        }

        enableMove() {
        }

        disableMove() {
        }

        mouseWheel(e: Laya.Event) {
            MapManager.zoom(Laya.stage.mouseX, Laya.stage.mouseY, e.delta);
        }
    }
}