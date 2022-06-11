namespace util {
    export interface IRedPoint {
        onRedChange: (b: boolean) => void;
    }
    /**红点数据管理 
     * @todo 最好移到clientCore中去
    */
    export class RedPoint {

        private static redHash: Map<number, boolean>;//红点数据hash，k是红点id v是是否显示Boolean
        private static btnHash: Map<IRedPoint, number[]>;//监听hash，k是监听者，v是监听的数组
        private static cacheRedArr: number[];//当前亮着的红点数组缓存 只能在在update中更新

        static setup() {
            this.btnHash = new Map();
            this.redHash = new Map();
            let xlsData = xls.get(xls.littleRed).getValues();
            for (const o of xlsData) {
                this.redHash.set(o.id, false);
            }
        }

        /** 标记红点增加 */
        static updateAdd(add: number[], remove: number[] = []) {
            // 更新redHash数据
            for (const id of add) {
                this.redHash.set(id, true);
            }
            for (const id of remove) {
                this.redHash.set(id, false);
            }
            this.updateData();
        }

        /**标记红点消除 */
        static updateSub(sub: number[]) {
            // 更新redHash数据
            for (const id of sub) {
                this.redHash.set(id, false);
            }
            this.updateData();
        }

        /**请求刷新红点数据
         * @param idArr 要请求刷新的id数组
         */
        static reqRedPointRefresh(id: number) {
            return net.sendAndWait(new pb.cs_flush_system_red_point({ pointTypes: [id] })).then((data: pb.sc_flush_system_red_point) => {
                //返回数组为查询数组中出现红点的id
                this.updateAdd(data.points);//新增
                this.updateSub(_.pullAll([id], data.points));//去除红点
                EventManager.event(globalEvent.RED_POINT_CHANGED, id);
            })
        }

        static reqRedPointRefreshArr(idArr: number[]) {
            if (idArr.length > 0)
                return net.sendAndWait(new pb.cs_flush_system_red_point({ pointTypes: idArr })).then((data: pb.sc_flush_system_red_point) => {
                    //返回数组为查询数组中出现红点的id
                    this.updateAdd(data.points);//新增
                    this.updateSub(_.pullAll(idArr, data.points));//去除红点
                    EventManager.event(globalEvent.RED_POINT_CHANGED, idArr);
                })
        }

        private static updateData() {
            //根据redHash更新缓存数组
            this.cacheRedArr = Array.from(this.redHash.keys()).filter((k) => {
                return this.redHash.get(k);
            });
            //遍历监听hash触发变动
            let arr = this.btnHash.entries();
            for (const obj of arr) {
                obj[0].onRedChange(this.checkShow(obj[1]));
            }
        }

        static updateRed(): void {
            this.updateData();
        }

        /**注册红点
         * @param btn 实现了IRedPoint的对象，销毁时请调用unregBtn清除引用
         * @param idArr 监控的id数组
         */
        static regBtn(btn: IRedPoint, idArr: number[]) {
            this.btnHash.set(btn, idArr);
        }

        /**
         * 取消注册红点
         * @param btn 
         */
        static unregBtn(btn: IRedPoint) {
            this.btnHash.delete(btn);
        }

        /**判断红点是否该显示 
         * @param idArr 红点id数组
        */
        static checkShow(idArr: number[]): boolean {
            if (idArr.length == 0)
                return false;
            let result = _.intersection(idArr, this.cacheRedArr);
            return (result.length > 0);
        }
    }
}