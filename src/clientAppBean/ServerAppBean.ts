namespace clientAppBean {
    export class ServerAppBean implements core.IAppBean {
        async start(data: any) {
            clientCore.ServerManager.setup();
            // 加载全局配置表
            await xls.load(xls.globaltest);
            clientCore.GlobalConfig.setup();
        }
    }
}