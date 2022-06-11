namespace clientAppBean {
    export class UnpackJsonAppBean implements core.IAppBean {
        async start(data: any) {
            await res.load('unpack.json');//未打包图集的大图url表
            clientCore.UnpackJsonManager.setUp();
        }
    }
}