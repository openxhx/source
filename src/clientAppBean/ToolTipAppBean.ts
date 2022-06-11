namespace clientAppBean {
    export class ToolTipAppBean implements core.IAppBean {
        public async start(data: any) {
            clientCore.ToolTip.setup()
            clientCore.UserInfoTip.setup();
            clientCore.ChangePosture.setup();
        }
    }
}