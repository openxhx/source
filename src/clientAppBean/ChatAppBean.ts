namespace clientAppBean {
    export class ChatAppBean implements core.IAppBean {
        async start(data: any) {
            let loadArr: any[] = [
                xls.load(xls.chatType),
                xls.load(xls.chatChannel)
            ]
            loadArr.concat(clientCore.ModuleManager.loadModule("chat"));
            await Promise.all(loadArr);
            clientCore.ChatManager.setup();
        }
    }
}