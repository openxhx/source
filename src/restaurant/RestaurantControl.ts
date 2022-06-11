namespace restaurant {
    export class RestaurantControl implements clientCore.BaseControl {
        /**进入餐厅 */
        public enterRestaurant() {
            return net.sendAndWait(new pb.cs_customer_enter_restaurant()).then((msg: pb.sc_customer_enter_restaurant) => {
                return Promise.resolve(msg);
            });
        }
        /**离开餐厅 */
        public outRestaurant() {
            net.sendAndWait(new pb.cs_customer_quit_restaurant());
        }
        /**上架食物 */
        public addFood(pos: number, id: number, cnt: number) {
            return net.sendAndWait(new pb.cs_add_restaurant_food({ foodPos: pos, foodId: id, counts: cnt })).then((msg: pb.sc_add_restaurant_food) => {
                return Promise.resolve(msg);
            }).catch(() => {
                return Promise.resolve(null);
            })
        }
        /**顾客就餐 */
        public customerIn(pos: number, id: number) {
            return net.sendAndWait(new pb.cs_customer_dine_in_restaurant({ seatPos: pos, npcId: id })).then((msg: pb.sc_customer_dine_in_restaurant) => {
                return Promise.resolve(msg);
            });
        }
        /**收取小费 */
        public getTip(pos: number) {
            return net.sendAndWait(new pb.cs_get_customer_tip({ npcId: pos })).then((msg: pb.sc_get_customer_tip) => {
                return Promise.resolve(msg);
            });
        }
        /**顾客结账 */
        public customerPay(pos: number, food: number) {
            return net.sendAndWait(new pb.cs_customer_pay_for_restaurant({ seatPos: pos, foodPos: food })).then((msg: pb.sc_customer_pay_for_restaurant) => {
                return Promise.resolve(msg);
            });
        }
        /**餐厅升级 */
        public levelUp() {
            return net.sendAndWait(new pb.cs_upgrade_restaurant_level()).then((msg: pb.sc_upgrade_restaurant_level) => {
                return Promise.resolve(msg);
            });
        }
        /**获取已解锁主题 */
        public getSkin() {
            return net.sendAndWait(new pb.cs_get_restaurant_theme()).then((msg: pb.sc_get_restaurant_theme) => {
                return Promise.resolve(msg);
            });
        }
        /**更换主题 */
        public changeSkin(id: number) {
            return net.sendAndWait(new pb.cs_change_restaurant_theme({ id: id })).then((msg: pb.sc_change_restaurant_theme) => {
                return Promise.resolve(msg);
            });
        }
        /**打扫餐厅 */
        public clean() {
            return net.sendAndWait(new pb.cs_clean_restaurant()).then((msg: pb.sc_clean_restaurant) => {
                return Promise.resolve(msg);
            });
        }
        /**进行宣传 */
        public share(type: number) {
            return net.sendAndWait(new pb.cs_restaurant_propagandize({ type: type })).then((msg: pb.sc_restaurant_propagandize) => {
                return Promise.resolve(msg);
            });
        }
        /**获取已解锁趣闻 */
        public getNews() {
            return net.sendAndWait(new pb.cs_get_all_customer_tidbits()).then((msg: pb.sc_get_all_customer_tidbits) => {
                return Promise.resolve(msg);
            });
        }
        /**阅读趣闻 */
        public readNews(ids: number[]) {
            return net.sendAndWait(new pb.cs_read_customer_tidbits({ ids: ids })).then((msg: pb.sc_read_customer_tidbits) => {
                return Promise.resolve(msg);
            });
        }
    }
}