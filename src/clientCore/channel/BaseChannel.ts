namespace channel {
    /**
     * 渠道基类
     */
    export abstract class BaseChannel {

        /** 验证登录地址*/
        protected loginServerAdress: string;
        /** 执行者*/
        protected opeater: any;

        constructor() {
        }

        /**
         * 渠道初始化
         * @param handler
         */
        public abstract init(handler: Laya.Handler): void;

        /** 获取登录参数*/
        protected getLoginParams(): Object {
            return null;
        }

        /**
         * 登录服务器
         * @param handler
         */
        public loginServer(handler: Laya.Handler): void {
            let params: Object = this.getLoginParams();
            if (!params) params = {}
            // channel.requestByHttp(this.loginServerAdress, handler, params, "get");
            utils.HttpUtils.httPGet(this.loginServerAdress, handler, params);
        }

        /**
         * 向服务器请求支付
         * @param data
         */
        public payToServer(data: xls.rechargeShopChannel | xls.rechargeShopOffical): void {
        }

        /**
         * 向渠道请求支付
         * @param data
         */
        public payToChannel(data: xls.rechargeShopChannel | xls.rechargeShopOffical): void {
        }

        /**支付成功，告诉后台
         * @param id 商品表中id
         */
        protected paySuccess(id: number): void {
            EventManager.event(globalEvent.PAY_OK, id);
        }

        protected payFail(): void {
            EventManager.event(globalEvent.PAY_FAIL);
        }

        protected payCancel(): void {
            EventManager.event(globalEvent.PAY_CANCLE);
        }

        /** 登录*/
        public login(): void {
        }

        /**
         * 登出
         */
        public logout(): void {
        }

        /**
         * 上报玩家数据（部分渠道需要
         * @param data
         */
        public reportRoleData(dataType: number): void {
        }

        /**
         * 查询实名认证 返回参数中 status 0-渠道没有提供实名认证接口 1-渠道提供辽
         */
        public queryAntiAddiction(): Promise<number> {
            return null;
        }

        /** 调起实名认证 返回参数中 status 0-渠道没有提供实名认证接口 1-渠道提供辽*/
        public realNameRegister(): void {
        }

        /**
         * 退出游戏
         */
        public exitGame(): void {
        }
    }
}