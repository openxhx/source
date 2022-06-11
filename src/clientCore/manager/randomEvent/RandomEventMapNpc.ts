namespace clientCore {
    export class RandomEventMapNpc extends Laya.Sprite{
        private _npcID:number;
        private _npcMovieSk:Laya.Skeleton;
        // private _npcImg:Laya.Image;
        private _stateImg:Laya.Image;
        public eventID:number;
        private _state:number;

        constructor(npcID:number,eventID:number){
            super();
            // this.autoSize = true;
            this._npcID = npcID;
            this.eventID = eventID;
            this.showNpc();
            this.update();

            this.width = 170;
            this.height = 255;
        }
        private showNpc(){
            this._npcMovieSk = new Laya.Skeleton();
            this._npcMovieSk.load("res/animate/randomEvent/"+this._npcID+"/0000.sk", Laya.Handler.create(this, () => {
                this.addChildAt(this._npcMovieSk,0);
            }));
            this._npcMovieSk.pos(65,120);
            // this._npcImg = new Laya.Image();
            // this.addChild(this._npcImg);
            // this._npcImg.skin = "res/randomEvent/npcMapShow/"+this._npcID+".png";
            // this._npcImg.pos(-85,-128);
            // this._npcImg.scale(0.95,0.95);
        }
        public showState(state:number){
            this._state = state;
            if(!this._stateImg){
                this._stateImg = new Laya.Image();
                this.addChild(this._stateImg);
                this._stateImg.pos(40,-40);
            }
            this._stateImg.skin = "res/randomEvent/headTips/state_"+state+".png";
        }
        public get state():number{
            return this._state;
        }
        public update(){
            let state = 0;
            let eventInfo = RandomEventManager.getEventInfoById(this.eventID);
            if (eventInfo.taskEndTime > 0) {
                // state = eventInfo.status + 1;
                let taskInfo = xls.get(xls.randomTask).get(eventInfo.taskId);
                if(taskInfo.taskType ==1){
                    state = eventInfo.status == 1?2:1;
                }
                else{
                    state = RandomEventManager.checkCanFinish(this.eventID)?2:1;
                }
            }
            this.showState(state);
        }

        public destroy(){
            super.destroy();
            this._npcMovieSk = null;
            BC.removeEvent(this);
            this.removeSelf();
        }
    }
}