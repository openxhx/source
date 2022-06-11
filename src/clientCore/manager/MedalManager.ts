namespace clientCore {

    /** 勋章管理器 
     *  49800000开始
        49900000结束
    */
    export class MedalManager {

        /**取勋章 */
        static getMedal(ids: number[]) {
            return net.sendAndWait(new pb.cs_get_client_common_data({ ids: ids })).then((data: pb.sc_get_client_common_data) => {
                return Promise.resolve(data.datas)
            })
        }

        /**设定勋章 千万注意溢出问题！！！！！！ */
        static setMedal(datas: pb.ICommonData[]) {
            return net.sendAndWait(new pb.cs_set_client_common_data({ datas: datas })).then(() => {

            })
        }
    }
}