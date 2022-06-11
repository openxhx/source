namespace clientAppBean {
    export class GuideAppBean implements core.IAppBean {
        async start(data: any) {
            let mainStep = 0;
            let subStep = 0;
            await net.sendAndWait(new pb.cs_get_new_player_guide({})).
                then((data: pb.sc_get_new_player_guide) => {
                    console.log(`登陆时，拉到的引导步骤 ${data.guideMainStep}  ${data.guideSubStep}`);
                    mainStep = data.guideMainStep;
                    subStep = data.guideSubStep;

                });
            await res.load(`atlas/newPlayerGuide.atlas`, Laya.Loader.ATLAS);
            await xls.load(xls.newPlayerGuide);
            clientCore.GuideMainManager.instance.setUp();
            if (mainStep < 1) {
                clientCore.GuideMainManager.instance.initGuideStep(1, 1);
            }
            else {
                clientCore.GuideMainManager.instance.initGuideStep(mainStep, subStep);
            }
            if (clientCore.GuideMainManager.instance.curGuideInfo.mainID < 99)
                clientCore.GuideMainManager.instance.startGuide();
            //彩虹天展示延后到新手初始化完
            EventManager.event(globalEvent.CHECK_RAINBOW);
        }
    }
}