namespace client {
    export async function initAppBean(arr: { bean: any, str: string }[], needLoading: boolean) {
        if (needLoading)
            clientCore.LoadingManager.show("正在进入拉贝尔大陆...");
        else
            EventManager.event(globalEvent.BEAN_LOAD_STRAT);
        let progress = 0;
        let total = arr.length;
        for (const obj of arr) {
            let bean: core.IAppBean = new obj['bean'];
            await bean.start();
            progress++;
            if (needLoading)
                await clientCore.LoadingManager.setLoading(obj.str, progress / total * 100);
            else
                await waitProgress(obj.str, progress / total * 100);
        }
        console.log("app bean run complete!");
        if (needLoading)
            await clientCore.LoadingManager.hide();
    }

    export function waitProgress(tipStr: string, value: number) {
        return new Promise((suc) => {
            EventManager.once(globalEvent.BEAN_LOAD_PRO_SUC, this, () => {
                suc();
            })
            EventManager.event(globalEvent.BEAN_LOAD_PRO, [tipStr, value]);
        })
    }

    export const appBeansBeforeLogin: { bean: any, str: string }[] = [
        { bean: clientAppBean.NetAppBean, str: '网络初始化。。。' },
        { bean: clientAppBean.ServerAppBean, str: '服务器信息初始化。。。' },
        { bean: clientAppBean.PersonAppBean, str: '人物模型加载。。。' },
    ];

    export const appBeansAfterLogin: { bean: any, str: string }[] = [
        { bean: clientAppBean.CommonUIAppBean, str: '通用资源加载。。。' },
        { bean: clientAppBean.ToolTipAppBean, str: 'Tips初始化。。。' },
        { bean: clientAppBean.ItemInfoAppBean, str: '物品资源表加载。。。' },
        { bean: clientAppBean.UserInfoBean, str: '玩家信息加载。。。' },
        { bean: clientAppBean.MapAppBean, str: '地图资源加载。。。' },
        { bean: clientAppBean.ChatAppBean, str: '获取聊天资源。。。' },
        { bean: clientAppBean.UIAppBean, str: 'UI初始化。。。' },
        { bean: clientAppBean.GameStartAppBean, str: "游戏开始初始化。。。" },
        { bean: clientAppBean.GuideAppBean, str: "新手引导初始化。。。" },
        { bean: clientAppBean.AdsAppMgrBean, str: '广告初始化。。。' }
    ];
}