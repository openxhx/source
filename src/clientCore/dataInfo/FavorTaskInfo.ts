namespace clientCore {
    /**
     * 好感度任务信息
     */
    export class FavorTaskInfo {
        /** 玩家Id*/
        roleId: number;
        /** 当前的人物ID*/
        taskId: number;
        /** 服务器数据*/
        svrData: pb.IfavorTask;
        /** 配表数据*/
        xlsTask: xls.characterTask;
        /** 第几个子任务*/
        taskNum: number;
        /** 最大任务数*/
        taskMax: number;
        /** 进度*/
        progress: number;
        /** 当前角色配置*/
        public xlsRole: xls.characterId;
        /** 任务的收获道具列表*/
        private _itemMap: Object;

        constructor() { }

        public init(msg: pb.IfavorTask): void {
            this.roleId = msg.roleid;
            this.xlsRole = xls.get(xls.characterId).get(msg.roleid);
            this._itemMap = {};
            this.update(msg);
        }

        public update(msg: pb.IfavorTask): void {
            this.svrData = msg;
            this.xlsTask = xls.get(xls.characterTask).get(msg.taskid);
            this.taskId = msg.taskid;

            let currentTask: xls.triple;
            let len: number = this.xlsRole.relationShip.length;
            let element: xls.triple;
            for (let i: number = 0; i < len; i++) {
                element = this.xlsRole.relationShip[i];
                if (element.v2 <= this.taskId && this.taskId <= element.v2 + element.v3) {
                    currentTask = element;
                    break;
                }
            }
            if (currentTask) {
                this.taskNum = this.taskId - currentTask.v2 + 1;
                this.taskMax = currentTask.v3;
                this.progress = this.taskNum / this.taskMax;
            }
            else {
                this.taskNum = this.taskMax = this.progress = 0;
            }
            this._itemMap = null;
            this._itemMap = {};
            this.updateItem(msg.orderInfo);
        }

        public updateItem(array: pb.IorderTask[]): void {
            _.forEach(array, (ele: pb.IorderTask) => {
                this._itemMap[ele.itemId] = ele.finish;
            })
        }

        /**
         * 检查任务是否完成辽
         */
        public checkFinish(): boolean {
            //非订单任务
            if (this.xlsTask.taskType != 2 && this.svrData.state != 1) {
                return false;
            }
            //订单任务
            let element: xls.triple;
            let len: number = this.xlsTask.taskGoods.length;
            for (let i: number = 0; i < len; i++) {
                element = this.xlsTask.taskGoods[i];
                if (element && this.getItemCount(element.v2) < element.v3) {
                    return false;
                }
            }
            return true;
        }

        public getItemCount(itemId: number): number {
            return this._itemMap[itemId] >> 0;
        }

        public dispose(): void {
            this.svrData = this.xlsRole = null;
            Laya.Pool.recover("FavorTaskInfo", this);
        }

        public static create(): FavorTaskInfo {
            return Laya.Pool.getItemByClass("FavorTaskInfo", FavorTaskInfo);
        }
    }
}