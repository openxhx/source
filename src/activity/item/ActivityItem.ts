

namespace activity {
    /**
     * 活动ICO
     */
    export class ActivityItem extends ui.activity.render.ActivityItemUI {

        private _activityId: number;
        private _module: ActivityModule;

        constructor() {
            super();
            this.on(Laya.Event.CLICK, this, this.onClick);
        }

        /**
         * 设置活动信息
         * @param id 
         */
        public setInfo(index: number, id: number, parent: ActivityModule): void {
            this._activityId = id;
            this._module = parent;
            //let pos: number[] = [[189, 196], [116, 299], [189, 401], [116, 504], [189, 606]][index];
            let pos: number[] = [[189, 126], [116, 234], [189, 341], [116, 449], [189, 556], [116, 664]][index];
            this.pos(pos[0], pos[1]);
            parent.addChild(this);
            this.bg.skin = "activity/tabOff.png";
            switch (id) {
                case 1://勇气国的七日补给
                    this.btn.skin = "activity/loginDaily.png";
                    this.btn.enableRed = true;
                    this.btn.redPoint = "3301";
                    break;
                case 2://等级奖励
                    this.btn.skin = "activity/levelReward.png";
                    this.btn.enableRed = true;
                    this.btn.redPoint = "3302";
                    break;
                case 3://芬妮的七日挑战
                    this.btn.skin = "activity/sevenDaily.png";
                    this.btn.enableRed = true;
                    this.btn.redPoint = "3304";
                    break;
                case 6://四叶之约
                    this.btn.skin = "activity/clover.png";
                    this.btn.enableRed = true;
                    this.btn.redPoint = "3303";
                    break;
                case 4://成长计划
                    this.btn.skin = "activity/leafCuit.png";
                    this.btn.enableRed = true;
                    this.btn.redPoint = "3305";
                    break;
                case 20://立夏之约
                    this.btn.skin = "activity/summerDate.png";
                    this.btn.enableRed = true;
                    this.btn.redPoint = "3306";
                case 22://夏日狂想曲
                    this.btn.skin = "activity/summerDate.png";
                    this.btn.enableRed = true;
                    this.btn.redPoint = "3306";
                default:
                    break;
            }
        }

        public updateBG(activityId: number): void {
            this.bg.skin = activityId == this._activityId ? "activity/tabOn.png" : "activity/tabOff.png";
        }

        private onClick(): void {
            this._module.onClick(this._activityId);
        }

        public dispose(): void {
            this._activityId = -1;
            this._module = null;
            this.removeSelf();
            Laya.Pool.recover("ActivityItem", this);
        }

        static create(): ActivityItem {
            return Laya.Pool.getItemByClass("ActivityItem", ActivityItem);
        }
    }
}