namespace kitchen {
    export class KitchenControl implements clientCore.BaseControl {
        /**获取厨房数据 */
        public getRecipeInfo() {
            return net.sendAndWait(new pb.cs_get_restaurant_kitchen_info()).then((msg: pb.sc_get_restaurant_kitchen_info) => {
                return Promise.resolve(msg);
            });
        }
        /**研究食谱 */
        public creatRecipe(id: number, items: number[], ext: number[]) {
            return net.sendAndWait(new pb.cs_conduct_trial_for_recipe({ id: id, itemIds: items, extraIds: ext })).then((msg: pb.sc_conduct_trial_for_recipe) => {
                return Promise.resolve(msg);
            });
        }
        /**制作食物 */
        public makeFood(id: number, pos: number, cnt: number) {
            return net.sendAndWait(new pb.cs_cooking_food_in_kitchen({ id: id, wokPos: pos, counts: cnt })).then((msg: pb.sc_cooking_food_in_kitchen) => {
                return Promise.resolve(msg);
            });
        }
        /**加速制作 */
        public accelerate(pos: number) {
            return net.sendAndWait(new pb.cs_accelerate_cooking_food_in_kitchen({ wokPos: pos })).then((msg: pb.sc_accelerate_cooking_food_in_kitchen) => {
                return Promise.resolve(msg);
            });
        }
        /**收获食材 */
        public gainFood(pos: number) {
            return net.sendAndWait(new pb.cs_gain_kitchen_food_finished({ wokPos: pos })).then((msg: pb.sc_gain_kitchen_food_finished) => {
                return Promise.resolve(msg);
            });
        }
        /**帮厨请求 */
        public help(flag: number, uid: number) {
            return net.sendAndWait(new pb.cs_kitchen_help_cooking_food({ type: flag, uid: uid })).then((msg: pb.sc_kitchen_help_cooking_food) => {
                return Promise.resolve(msg);
            });
        }
    }
}