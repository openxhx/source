namespace clientAppBean {
    export class CommonUIAppBean implements core.IAppBean {
        /**
         * 
         * @param data 
         * 通用资源素材加载，需要提前加载的通用素材，都可以放到这里面一起加载
         */
        async start(data: any) {
            await Promise.all([
                res.load("atlas/commonUI.atlas"),
                res.load("atlas/alert/quickBuy.atlas")
            ]);
        }
    }
}