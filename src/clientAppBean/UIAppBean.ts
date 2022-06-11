namespace clientAppBean {
    export class UIAppBean implements core.IAppBean {
        async start(data: any) {
            await res.load(`atlas/commonUI.atlas`, Laya.Loader.ATLAS);
            await res.load(`atlas/main.atlas`, Laya.Loader.ATLAS);
            await res.load(`atlas/commonRes2.atlas`, Laya.Loader.ATLAS);
            await xls.load(xls.clothTemple)
            clientCore.UIManager.setup();
        }
    }
} 