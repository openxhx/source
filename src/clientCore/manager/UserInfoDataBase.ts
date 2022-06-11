namespace clientCore {
    interface IUser {
        info: pb.IUserBase;
        getTime: number;
    }

    const REFRESH_DELAY_SEC = 300;
    /**全局用户信息缓存 */
    export class UserInfoDataBase {
        private static _userInfoMap: util.HashMap<IUser> = new util.HashMap();

        /**
         * 请求玩家UserBase信息，请求到的会缓存300秒，
         * @param ids 需要请求的id
         * @param force 是否需要强行重新获取
         * @return 请求完成或者不需要请求都返回resovle(千万注意异步！！)
         */
        static async reqUserInfo(ids: number[], force: boolean = false): Promise<void> {
            if (ids.length == 0)
                return Promise.resolve();
            //判断需要重新请求的信息
            let needReqIds = [];
            if (force)
                needReqIds = ids;
            else
                needReqIds = _.filter(ids, id => this.checkUidNeedRefresh(id));
            if (needReqIds.length > 0) {
                await net.sendAndWait(new pb.cs_get_user_base_info({ uids: needReqIds }), true).then((data: pb.sc_get_user_base_info) => {
                    let now = clientCore.ServerManager.curServerTime;
                    if (data.userInfos && data.userInfos.length > 0) {
                        for (const o of data.userInfos) {
                            this._userInfoMap.add(o.userid, { info: o, getTime: now });
                        }
                    }
                    else {
                        //没有请求到就放一个假的,不然会重复请求多次
                        for (const id of needReqIds) {
                            let fakeUserBase = new pb.UserBase();
                            fakeUserBase.userid = id;
                            fakeUserBase.nick = '暂无数据';
                            this._userInfoMap.add(id, { info: fakeUserBase, getTime: now });
                        }
                    }
                    return Promise.resolve();
                }).catch(() => {
                    return Promise.resolve();
                });
            }
            return Promise.resolve();
        }

        /**判断缓存里是否有数据(有可能是300s前缓存的)  */
        static checkHaveUId(uid: number): boolean;
        /**判断缓存里是否有数据(有可能是300s前缓存的)  */
        static checkHaveUId(uids: number[]): boolean;

        static checkHaveUId(uids: number | number[]): boolean {
            if (_.isArray(uids))
                return _.filter(uids, id => this._userInfoMap.has(id)).length == uids.length;
            if (_.isNumber(uids))
                return this._userInfoMap.has(uids);
        }

        /**立即获取玩家信息,如果没有返回一个空的userBase防止报错 */
        static getUserInfo(uid: number) {
            if (this._userInfoMap.has(uid))
                return this._userInfoMap.get(uid).info;
            else
                return new pb.UserBase();
        }

        private static checkUidNeedRefresh(uid: number) {
            let now = clientCore.ServerManager.curServerTime;
            if (this._userInfoMap.has(uid)) {
                return (now - this._userInfoMap.get(uid).getTime) > REFRESH_DELAY_SEC;
            }
            else {
                return true;
            }
        }
    }
}