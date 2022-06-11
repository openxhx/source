namespace clientCore {
    /**
     * 地图建筑，装饰，花种编辑面板。
     */
    export class CameraFollow {
        public static FOLLOW_COMPLETE:string = "FOLLOW_COMPLETE";
        public static target:any;
        public static rect:Laya.Rectangle;
        public static setUp(){
            Laya.timer.frameLoop(1,this,this.frameRun);
        }
        private static frameRun(){
            if(this.target){
                
            }
        }
        public static followSteadSpeed(){

        }
        public static followFixedTime(){

        }
        public static followTarget(){

        }
    }
}