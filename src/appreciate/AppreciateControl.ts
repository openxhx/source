namespace appreciate {
    export class AppreciateControl implements clientCore.BaseControl {
        public model: AppreciateModel;

        /** 面板信息*/
        public getUserBaseInfo(): Promise<pb.sc_get_user_base_info> {
            return net.sendAndWait(new pb.cs_get_user_base_info({ uids: [clientCore.LocalInfo.uid] })).then((msg: pb.sc_get_user_base_info) => {
                return Promise.resolve(msg);
            });
        }

        public dispose(): void {
            this.model = null;
        }
    }
}