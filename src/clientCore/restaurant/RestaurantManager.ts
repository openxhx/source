namespace clientCore {
    /**
     * 花灵餐厅管理
     */
    export class RestaurantManager {
        static openFlag:boolean = false;
        static openGuideFlag:boolean = false;

        static checkTaskFinish(): boolean{
            let task = clientCore.TaskManager.getTaskById(1034);
            if(clientCore.LocalInfo.userLv >= 40 && task == undefined) return true;
            if(task?.state == 3) return true;
            return false;
        }
    }
}