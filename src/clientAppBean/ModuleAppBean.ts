namespace clientAppBean {
    export class ModuleAppBean implements core.IAppBean {
        async start(data: any) {
            await xls.load(xls.moduleOpen);
            clientCore.ModuleManager.setup();
        }
    }
}