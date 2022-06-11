namespace clientAppBean {
    import LocalInfo = clientCore.LocalInfo;
    export class UserInfoBean implements core.IAppBean {
        async start(data: any) {
            await Promise.all([
                xls.load(xls.itemCloth),
                xls.load(xls.characterLevel),
                xls.load(xls.littleRed),
                xls.load(xls.vipLevel),
                xls.load(xls.babyPay),
                xls.load(xls.babyFree),
                xls.load(xls.babyReward),
                xls.load(xls.rechargeShopOffical),
                xls.load(xls.rechargeShopChannel),
                xls.load(xls.rechargeShopTaiwan),
                xls.load(xls.rechargeLimit),
                xls.load(xls.npcBase),
                xls.load(xls.taskData),
                xls.load(xls.scienceTree),
                xls.load(xls.scienceTreeUnlock),
                xls.load(xls.rankInfo),
                xls.load(xls.activityIcon),
                xls.load(xls.systemTable),
                xls.load(xls.eventControl),
                xls.load(xls.commonMerge),
                xls.load(xls.commonAward),
                xls.load(xls.partyHouse),
                xls.load(xls.collocation)
            ]);
            //所有衣服
            await net.sendAndWait(new pb.cs_get_user_all_clothes()).then((data: pb.sc_get_user_all_clothes) => {
                clientCore.LocalInfo.addClothes(data.clothes);
            }).catch(e => { console.warn(e) });
            //拉取玩家相关信息 所有的应该都从这拉
            await net.sendAndWait(new pb.cs_get_user_info()).then((data: pb.sc_get_user_info) => {
                //当前服装
                LocalInfo.wearingClothIdArr = data.baseInfo.curClothes;
                //神树等级
                LocalInfo.treeLv = data.spiritTreeLvl;
                //彩虹
                data.rInfo && LocalInfo.rainbowInfo.updateInfo(data.rInfo);
                //角色基础信息
                LocalInfo.initLoginInfo(data.baseInfo);
                //红点
                util.RedPoint.setup();
                util.RedPoint.updateAdd(data.points);
                //自动消亡
                clientCore.RegRemoveManager.setup();
                //背包
                LocalInfo.userInfo.pkgSize = data.pkgSize;
                //家族
                clientCore.FamilyMgr.ins.setup(data.baseInfo.familyId);
                clientCore.LocalInfo.friendRefuse = data.friendRefuseFlag == 1;
                //花宝信息
                clientCore.FlowerPetInfo.initInfo(data.baseInfo);
                //是否设置陌生人可私聊
                clientCore.GlobalConfig.isAllowStrangerChat = data.baseInfo.strangerChat == 1;
            });
            //背景秀信息
            clientCore.BgShowManager.instance.setup();
            clientCore.ServerManager.getSrvTimeRightNow();
            clientCore.RainbowManager.setup();
            //邮箱注册
            clientCore.MailManager.ins.setup();
            //初始化角色
            await clientCore.RoleManager.instance.initXml();
            //头像和头像框信息(需要在人物等级和服装信息后面)
            await clientCore.UserHeadManager.instance.setup();
            //充值商品信息
            await clientCore.RechargeManager.setup();
            //小充
            await clientCore.LittleRechargManager.instacne.setup();
            //科技点
            await clientCore.ScienceTreeManager.ins.setup();
            //cp信息
            await clientCore.CpManager.instance.setup();
            //密室信息
            await clientCore.SecretroomMgr.instance.setup();
            //限时活动系统
            await clientCore.LimitActivityMgr.setup();
            //花宝皮肤
            await clientCore.FlowerPetInfo.setup();
            //清凉沙滩秀
            // await clientCore.CoolBeachImageManager.instance.setup();
        }
    }
}