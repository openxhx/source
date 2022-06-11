namespace clientAppBean {
    export class NetAppBean implements core.IAppBean {
        async start(data: any) {
            net.init();
            clientCore.NetErrorManager.setup();
        }
    }
}