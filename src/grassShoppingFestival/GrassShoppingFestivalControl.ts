namespace grassShoppingFestival {
    export class GrassShoppingFestivalControl implements clientCore.BaseControl {
        /**获取面板 */
        public getInitPanel(): Promise<pb.sc_grass_shopping_festival_panel> {
            return net.sendAndWait(new pb.cs_grass_shopping_festival_panel()).then((msg: pb.sc_grass_shopping_festival_panel) => {
                return Promise.resolve(msg);
            });
        }
        /**领取任务奖励 */
        public getTaskReward(taskId: number): Promise<pb.sc_get_grass_shopping_festival_task_reward> {
            return net.sendAndWait(new pb.cs_get_grass_shopping_festival_task_reward({ taskId: taskId })).then((msg: pb.sc_get_grass_shopping_festival_task_reward) => {
                return Promise.resolve(msg);
            });
        }
        /**答题*/
        public getQuestion(num: number): Promise<pb.sc_grass_shopping_festival_gameover> {
            return net.sendAndWait(new pb.cs_grass_shopping_festival_gameover({ num: num })).then((msg: pb.sc_grass_shopping_festival_gameover) => {
                return Promise.resolve(msg);
            });
        }

        /**推销*/
        public getPromote(id: number): Promise<pb.sc_grass_shopping_festival_promote> {
            return net.sendAndWait(new pb.cs_grass_shopping_festival_promote({ id: id })).then((msg: pb.sc_grass_shopping_festival_promote) => {
                return Promise.resolve(msg);
            });
        }

        /**领取推销奖励*/
        public getPromoteReward(id: number): Promise<pb.sc_grass_shopping_festival_promote_reward> {
            return net.sendAndWait(new pb.cs_grass_shopping_festival_promote_reward({ id: id })).then((msg: pb.sc_grass_shopping_festival_promote_reward) => {
                return Promise.resolve(msg);
            });
        }
    }
}