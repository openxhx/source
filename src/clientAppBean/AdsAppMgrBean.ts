/// <reference path="./loginAlertBean/BaseLoginAlertBean.ts" />
/// <reference path="./loginAlertBean/LoginChargeAlertBean.ts" />
/// <reference path="./loginAlertBean/WelcomeBackAlertBean.ts" />
/// <reference path="./loginAlertBean/WelcomeBackAlert2Bean.ts" />
/// <reference path="./loginAlertBean/SignAlertBean.ts" />
/// <reference path="./loginAlertBean/CumulativeLoginAlertBean.ts" />
/// <reference path="./loginAlertBean/SignRewardAlertBean.ts" />
namespace clientAppBean {

    /**
    * 强弹广告
    * 可以自己写bean，也可以用BaseLoginAlertBean加配参数
    * 自己写bean的话，一定要调用start和openNext方法
    */
    const ADS_QUEUE: Array<ILoginAlert> = [
        // { bean: BaseLoginAlertBean, param: { checkMedal: MedalDailyConst.QCS_ALERT_DAILY, offcial: true, unoffcial: true, modStr: 'loginAds.LoginQcsModule', } },
        // { bean: WelcomeBackAlertBean },
        { bean: LoginChargeAlertBean },
        { bean: SignRewardAlertBean } ,
        { bean: CumulativeLoginAlertBean } ,
        { bean: SignAlertBean },
        // { bean: BaseLoginAlertBean, param: { checkMedal: MedalDailyConst.PLATFORM_AD_OPEN, offcial: true, unoffcial: true, modStr: 'adsTip.DailyAdsTipModule' } },
        { bean: BaseLoginAlertBean, param: { checkMedal: 0, offcial: true, unoffcial: true, modStr: 'newActivity.NewActivityModule', system: 115 } },
        // { bean: WelcomeBackAlert2Bean },
        // { bean: BaseLoginAlertBean, param: { checkMedal: MedalDailyConst.QCS_ALERT_DAILY, offcial: true, unoffcial: false, modStr: 'loginAds.LoginQcsModule', } }
        // { bean: BaseLoginAlertBean, param: { checkMedal: MedalDailyConst.LOGIN_TAOBAO_MODULE, offcial: true, unoffcial: false, modStr: 'loginAds.LoginTaobaoModule', } },
        // { bean: BaseLoginAlertBean, param: { checkMedal: MedalDailyConst.LOGIN_BCY_MODULE, offcial: true, unoffcial: false, modStr: 'loginAds.LoginBcyModule', } },
        // { bean: BaseLoginAlertBean, param: { checkMedal: MedalDailyConst.LIGIN_BUY_DAILY, offcial: true, unoffcial: true, modStr: 'loginBuy.LoginBuyModule' } },
        // { bean: BaseLoginAlertBean, param: { checkMedal: MedalDailyConst.STAR_LOVER_DAILY, offcial: true, unoffcial: true, modStr: 'starLover.StarLoverAlertModule' } },
        // { bean: BaseLoginAlertBean, param: { checkMedal: MedalDailyConst.SCHOOL_TOWER_AD_DAILY, offcial: true, unoffcial: true, modStr: 'schoolTowerAd.SchoolTowerAdModule' } },
        // { bean: BaseLoginAlertBean, param: { checkMedal: MedalDailyConst.CP_BRIDE_ALERT_DAILY, offcial: true, unoffcial: true, modStr: 'cp.CpBrideAlertModule' } },
        // { bean: BaseLoginAlertBean, param: { checkMedal: MedalDailyConst.ONE_LEAF_AUTUMN_DAILY, offcial: true, unoffcial: true, modStr: 'oneLeafAutumnAd.OneLeafAutumnAdModule' } },
        // { bean: BaseLoginAlertBean, param: { checkMedal: MedalDailyConst.ONCE_OPEN_BEAR, offcial: true, unoffcial: true, modStr: 'bearAds.BearAdsModule' } },
        // { bean: BaseLoginAlertBean, param: { checkMedal: MedalDailyConst.MOON_STORY_DAILY, offcial: true, unoffcial: true, modStr: 'moonStoryAd.MoonStoryAdModule' } },
        // { bean: BaseLoginAlertBean, param: { checkMedal: MedalDailyConst.WISTERIASONG_DAILY, offcial: true, unoffcial: true, modStr: 'wisteriaSong.WisteriaSongAlertModule' } },
        // { bean: BaseLoginAlertBean, param: { checkMedal: MedalDailyConst.GOD_TREE_AD_DAILY, offcial: true, unoffcial: true, modStr: 'spiritTreeAds.SpiritTreeAdsModule' } },
        // { bean: BaseLoginAlertBean, param: { checkMedal: MedalDailyConst.PINE_SMOKE_AD_DAILY, offcial: true, unoffcial: true, modStr: 'pineSmokeAd.PineSmokeAdModule' } },
        // { bean: BaseLoginAlertBean, param: { checkMedal: MedalDailyConst.NIGHTESIDENCE_DAILY, offcial: true, unoffcial: true, modStr: 'nightEsidence.NightEsideceAlertModule' } },
        // { bean: BaseLoginAlertBean, param: { checkMedal: MedalDailyConst.GINKGOOATH_DAILY_AD, offcial: true, unoffcial: true, modStr: 'ginkgoOathAd.GinkgoOathAdModule' } },
    ]

    export interface SimpleLoginAlertParam {
        /**需要检查的勋章，如果需要每次都打开传0 */
        checkMedal: number,
        /**模块连接 */
        modStr: string,
        /**模块参数 */
        modParam?: any,
        /**官服是否显示 */
        offcial: boolean,
        /**渠道服是否显示 */
        unoffcial: boolean,
        /** 模块id 对应systemtable 用于检测是否开启 不选择则认为默认开启*/
        system?: number
    }

    interface ILoginAlert {
        bean: { new(): BaseLoginAlertBean },
        param?: SimpleLoginAlertParam
    }

    export class AdsAppMgrBean implements core.IAppBean {
        async start() {
            if (clientCore.GuideMainManager.instance.isGuideAction)
                return;
            //等待没有模块打开的时候，开始强弹广告逻辑
            while (clientCore.ModuleManager.opening)
                await util.TimeUtil.awaitTime(200);
            EventManager.on(globalEvent.OPEN_NEXT_ADS, this, this.openNext);
            this.openNext();
        }

        async openNext() {
            if (ADS_QUEUE.length <= 0)
                return;
            while (clientCore.ModuleManager.curShowModuleNum > 0)
                await util.TimeUtil.awaitTime(500);
            let ads = ADS_QUEUE.shift();
            let bean = new ads.bean();
            if (ads.param)
                bean.setParam(ads.param);
            bean.start();
        }
    }
}