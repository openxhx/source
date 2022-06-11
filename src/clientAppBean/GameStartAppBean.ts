namespace clientAppBean {
    export class GameStartAppBean implements core.IAppBean {
        async start(data: any) {
            //开启各种数据变动通知监听
            clientCore.NoticeInfoManager.setUp();
            //任务数据
            clientCore.TaskManager.setUp();
            //好友数据
            await clientCore.FriendManager.instance.setup();
            //BOSS注册
            await clientCore.BossManager.ins.setup();
            //随机事件
            await clientCore.RandomEventManager.loadRes();
            clientCore.RandomEventManager.setUp();
            //初始化地图触发
            await clientCore.MapObjectTouchManager.loadRes();
            clientCore.MapObjectTouchManager.setUp();
            //关卡信息
            await clientCore.AdventureManager.instance.loadXml();
            await clientCore.AdventureManager.instance.updateAllByType(0);
            //系统开启通知初始化(前置信息需要等级，关卡信息通知监听)
            await clientCore.SystemOpenManager.ins.setup();
            //花宝购买信息
            await clientCore.FlowerPetInfo.getBuyStatus();
            //初始化地图中人物管理
            clientCore.PeopleManager.getInstance().setUp();
            //称号
            await clientCore.TitleManager.ins.setup();
            //导师系统
            await clientCore.MentorManager.setup();
            //送花系统
            await clientCore.GiveFlowerManager.instance.init();
            // //奔跑吧火鸡
            // await clientCore.TurkeyInfoManeger.ins.setup();
            //感恩午后时光
            // clientCore.BasketManager.ins.init();
            // //复苏之春
            // await clientCore.AwakeSpringManager.ins.setup();
            //神秘的礼物
            // await clientCore.MysteryGiftManager.ins.setup();
            //圣诞祝福
            await clientCore.ChrismasInteractManager.ins.setup();
            //拯救小花仙
            await clientCore.SaveFaeryManager.ins.setup();
            //进游戏地图
            await clientCore.MapManager.enterHome(
                clientCore.LocalInfo.uid,
                new Laya.Point(1196, 1282)
            );
            //奇趣道具监听开始
            await clientCore.FunnyToyManager.setup();
            //角色趣闻
            await clientCore.NpcNewsManager.ins.setup();
            //满屏模块关闭或者回到家园
            new clientCore.OnFullScreenCloseManager();
            //检测自己是否被踢了
            net.send(new pb.cs_get_remove_family_popout());
            //如果是ios，需要开启补单逻辑
            if (channel.ChannelConfig.channelId == channel.ChannelEnum.IOS) {
                EventManager.event(globalEvent.IOS_IAP_START);
            }
            clientCore.MedalManager.getMedal([MedalDailyConst.USE_LEAF_ALERT_NOT_SHOW]).then((v) => {
                clientCore.GlobalConfig.showUseLeafAlert = v[0].value == 0;
            })
            //激活到账（上次游戏过程中未到账的支付）
            net.send(new pb.cs_active_user_unfinish_order());
            //注册活动闹钟
            time.ServerClock.instance.regEvent('2021/06/12 19:55:00', '2021/06/12 19:59:59', this.onClock);
        }

        private onClock(): void {
            let scrollInfo: alert.ScrollWordInfo = new alert.ScrollWordInfo();
            scrollInfo.bgPath = 'res/alert/worldNotice/105.png';
            scrollInfo.width = 700;
            scrollInfo.y = 35;
            scrollInfo.value = '亲爱的小花仙，孤影督察兑换马上就开始啦，请速速前往现场等待兑换噢！';
            scrollInfo.sizeGrid = '0,121,0,128';
            scrollInfo.sign = alert.Sign.ACTIVITY;
            alert.showWorlds(scrollInfo);
        }
    }
}
