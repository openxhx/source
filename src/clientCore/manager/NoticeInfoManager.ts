namespace clientCore {
    export class NoticeInfoManager {
        public static setUp() {
            //服装信息改变通知
            net.listen(pb.sc_clothes_change_notify, this, this.clothChangeNotice);
            //材料信息改变通知
            net.listen(pb.sc_mts_change_notify, this, this.materialChangeNotice);
            //物品信息改变通知(经验值也在这里)
            net.listen(pb.sc_item_change_notify, this, this.itemChangeNotice);
            //精灵树等级变动
            net.listen(pb.sc_spirit_tree_upgrade_level, this, this.onTreeInfoNotice);
            //角色增加
            net.listen(pb.sc_role_add_notify, this, this.onRoleAddNotice);
            //好感度变化通知
            net.listen(pb.sc_favor_info_change_notify, this, this.onFavorNotify);
            //好感度任务变化通知
            net.listen(pb.sc_new_favor_task_notify, this, this.onFavorTaskNotify);
            //好感度订单任务变化通知
            net.listen(pb.sc_favor_task_order_change_notify, this, this.onFavorTaskOrderNotify);
            //玩家加入和退出家族的通知
            net.listen(pb.sc_family_member_notify, this, this.onFamilyNotify);
            //红点
            net.listen(pb.sc_system_red_point_notify, this, this.onRedPointChange);
            //vip花宝到期
            net.listen(pb.sc_flower_baby_expired_notify, this, this.flowerPetExpire);
            //称号
            net.listen(pb.sc_add_title_notify, this, this.onTitle);
            //提示消息
            net.listen(pb.sc_currency_string_notify, this, this.onMessageTip);
            //羁绊送礼
            net.listen(pb.sc_world_give_friend_gift_notify, this, this.synFriendGift);
            //特殊物品获得炫耀通知
            net.listen(pb.sc_got_spec_item_all_player_notify, this, this.synPlayerItem);
            //花神之镜通知
            net.listen(pb.sc_god_flower_notify, this, this.onGodMirrorNotify);
            //欣赏模式装饰通知
            net.listen(pb.sc_add_appreciation_ornaments, this, this.appreciationNotice);
            //宝藏探险通知
            net.listen(pb.sc_treature_adventure_draw_suit_notify, this, this.onTreatureNotify);
            //花宝皮肤解锁
            net.listen(pb.sc_get_new_skin_notify, this, this.onBabyNotify);
            //清凉沙滩秀通知
            net.listen(pb.sc_cool_beach_show_notify, this, this.onCoolBeachNotify);
            //饼干篮世界通知
            net.listen(pb.sc_thanks_afternoon_cookie_world_notify, this, this.onCookGift);
        }
        public static onMessageTip(data: pb.sc_currency_string_notify): void {
            alert.showFWords(data.str);
        }
        public static onTitle(data: pb.sc_add_title_notify): void {
            TitleManager.ins.addTitle(data.titleInfo);
        }
        public static flowerPetExpire() {
            FlowerPetInfo.petType = 0;
            EventManager.event(globalEvent.FLOWER_PET_VIP_CHANGE_NOTICE);
            //花宝过期了 如果当前展示的是付费花宝 则还原
            if (FlowerPetInfo.select.big == 3 && FlowerPetInfo.select.little > 1) {
                let select: ShowType = FlowerPetInfo.getShow(0, FlowerPetInfo.getLv(FlowerPetInfo.freeExp));
                //同时通知后端
                net.sendAndWait(new pb.cs_chose_baby_image({ type: parseInt(`${select.big}${select.little}`) })).then((msg: pb.sc_chose_baby_image) => {
                    clientCore.PeopleManager.getInstance().player.changeFlowerPet(select.big, select.little);
                })
            }
        }
        public static clothChangeNotice(data: pb.sc_clothes_change_notify) {
            clientCore.LocalInfo.addClothes(data.clothes);
            EventManager.event(globalEvent.CLOTH_CHANGE);
        }
        public static itemChangeNotice(data: pb.sc_item_change_notify) {
            ItemBagManager.refreshData(data.items);
            EventManager.event(globalEvent.ITEM_BAG_CHANGE, [data.items]);
        }
        public static materialChangeNotice(data: pb.sc_mts_change_notify) {
            MaterialBagManager.refreshData(data.mts);
            EventManager.event(globalEvent.MATERIAL_CHANGE);
        }

        public static onTreeInfoNotice(data: pb.sc_spirit_tree_upgrade_level) {
            clientCore.LocalInfo.treeLv = data.level;
            EventManager.event(globalEvent.TREE_LEVEL_CHANGE);
        }

        public static onRoleAddNotice(data: pb.sc_role_add_notify) {
            RoleManager.instance.addRoleInfoByNotice(data.roleInfo);
        }

        public static onFavorNotify(data: pb.sc_favor_info_change_notify): void {
            RoleManager.instance.updateRoleFavor(data);
        }

        public static onFavorTaskNotify(data: pb.sc_new_favor_task_notify): void {
            FavorTaskMgr.ins.updateTaskMap(data.favorTask);
        }

        public static onFavorTaskOrderNotify(data: pb.sc_favor_task_order_change_notify): void {
            FavorTaskMgr.ins.updateTaskItem(data);
        }

        public static onFamilyNotify(data: pb.sc_family_member_notify): void {
            let ins: FamilyMgr = FamilyMgr.ins;
            switch (data.type) {
                case 1: //申请通过
                    if (ins.checkInFamily()) break;
                    ins.familyId = data.fmlId;
                    clientCore.LocalInfo.srvUserInfo.familyId = ins.familyId;
                    clientCore.LocalInfo.srvUserInfo.familyName = data.fmlName;
                    if (ModuleManager.checkModuleOpen("familyAc")) {
                        alert.showSmall("成功加入家族，是否进入？", {
                            callBack: {
                                funArr: [() => {
                                    ModuleManager.closeAllOpenModule();
                                    ins.openFamily();
                                },
                                () => {
                                    ModuleManager.closeAllOpenModule();
                                }],
                                caller: this
                            }
                        })
                    }
                    break;
                case 2: //被踢出家族
                    if (GlobalConfig.battleCopy) { //在战斗副本直接退出吧
                        FamilyMgr.ins.leaveFamily();
                        break;
                    }
                    let panel: alert.LeaveAlert = new alert.LeaveAlert();
                    panel.show(data);
                    break;
                case 3: //职位改变
                    if (ins.svrMsg) {
                        ins.svrMsg.post = data.post;
                        EventManager.event(globalEvent.SYN_POST_CHANAGE);
                    }
                    break;
                default:
                    break;
            }
            //家族相关红点
            util.RedPoint.reqRedPointRefresh(801);
        }

        private static onRedPointChange(data: pb.sc_system_red_point_notify) {
            util.RedPoint.updateAdd([data.point], [data.remove]);
            EventManager.event(globalEvent.RED_POINT_CHANGED_BY_NOTICE);
        }

        private static synFriendGift(msg: pb.sc_world_give_friend_gift_notify): void {
            let data: pb.chat_msg_t = new pb.chat_msg_t();
            data.sendNick = '系统消息';
            data.chatType = 1;
            data.content = `${msg.nickA}向${msg.nickB}赠送了 ${clientCore.ItemsInfo.getItemName(msg.id)}x${msg.num},证明情谊如星辰永恒！`;
            data.sendUid = 1;
            data.sendTime = clientCore.ServerManager.curServerTime;
            EventManager.event(globalEvent.FAKE_SYSTEM_MESSAGE_NOTICE, [data]);

            //跑马灯
            let info: alert.ScrollWordInfo = new alert.ScrollWordInfo();
            info.bgPath = 'res/alert/worldNotice/101.png';
            info.width = 752;
            info.y = 23;
            info.value = data.content;
            info.sizeGrid = '0,189,0,378';
            alert.showWorlds(info);
        }

        private static synPlayerItem(msg: pb.sc_got_spec_item_all_player_notify): void {
            let content: string;
            switch (msg.event) {
                case 1: // 米米奇花车抽奖
                    content = `喜报！${msg.nick}在米米奇的礼物中，在${xls.get(xls.map).get(msg.mapId).name}获得全套${ItemsInfo.getItemName(msg.itemId)}奖励，真是花神眷顾啊！`;
                    let info: alert.ScrollWordInfo = new alert.ScrollWordInfo();
                    info.bgPath = 'res/alert/worldNotice/108.png';
                    info.width = 752;
                    info.y = 25;
                    info.value = content;
                    info.sizeGrid = '0,0,0,0';
                    info.fontColor = '#ffffff';
                    info.fontSize = 20;
                    info.sign = alert.Sign.FOLWER_VEHICLE_SHOW;
                    alert.showWorlds(info);
                    break;
                default:
                    break;
            }

            let data: pb.chat_msg_t = new pb.chat_msg_t();
            data.sendNick = '系统消息';
            data.chatType = 1;
            data.content = content;
            data.sendUid = 2;
            data.sendTime = clientCore.ServerManager.curServerTime;
            EventManager.event(globalEvent.FAKE_SYSTEM_MESSAGE_NOTICE, [data]);
        }

        private static onGodMirrorNotify(msg: pb.sc_god_flower_notify) {
            let data: pb.chat_msg_t = new pb.chat_msg_t();
            data.sendNick = '系统消息';
            data.chatType = 1;
            if (msg.type == 1) {
                data.content = `[${msg.nickName}]正在为自己的形象进行拉票,点击前往花神之镜，领取拉票红包哟！`;
            }
            else {
                data.content = `[${msg.nickName}]正在为自己的形象进行宣传,点击前往花神之镜，给他点赞吧！`;
            }
            data['extraName'] = 'godMirror';
            data['extraData'] = msg.imageInfo;
            data.sendUid = 0;
            data.sendTime = clientCore.ServerManager.curServerTime;
            EventManager.event(globalEvent.FAKE_SYSTEM_MESSAGE_NOTICE, data);
        }

        private static onCoolBeachNotify(msg: pb.sc_cool_beach_show_notify) {
            let data: pb.chat_msg_t = new pb.chat_msg_t();
            data.sendNick = '系统消息';
            data.chatType = 1;
            data.content = `[${msg.nickName}]放送一份夏日果盘，邀请大家来看TA在清凉沙滩的秀场演出！快来领取呀！`;
            data['extraName'] = 'coolBeach';
            data['extraData'] = msg.uid;
            data.sendUid = 0;
            data.sendTime = clientCore.ServerManager.curServerTime;
            EventManager.event(globalEvent.FAKE_SYSTEM_MESSAGE_NOTICE, data);
        }

        private static onCookGift(msg: pb.sc_thanks_afternoon_cookie_world_notify) {
            let data: pb.chat_msg_t = new pb.chat_msg_t();
            data.sendNick = '系统消息';
            data.chatType = 1;
            data.content = `[${msg.nickName}]为大家准备了感恩节饼干，快去找[${msg.nickName}]领取呀！`;
            data['extraName'] = 'afternoonTime';
            data['extraData'] = msg.uid;
            data.sendUid = 0;
            data.sendTime = clientCore.ServerManager.curServerTime;
            EventManager.event(globalEvent.FAKE_SYSTEM_MESSAGE_NOTICE, data);
        }

        private static appreciationNotice(msg: pb.sc_add_appreciation_ornaments) {
            CollocationManager.refreshData(msg.ids);
            EventManager.event(globalEvent.COLLOCATION_CHANGE, [msg.ids]);
        }

        private static onTreatureNotify(msg: pb.sc_treature_adventure_draw_suit_notify) {
            let scrollInfo: alert.ScrollWordInfo = new alert.ScrollWordInfo();
            scrollInfo.bgPath = 'res/alert/worldNotice/105.png';
            scrollInfo.width = 700;
            scrollInfo.y = 35;
            scrollInfo.value = `【${msg.nick}在宝藏深渊中一气呵成找到了${clientCore.SuitsInfo.getSuitInfo(msg.suitId).suitInfo.name}套装，真是天降神运啊！】`;
            scrollInfo.sizeGrid = '0,121,0,128';
            scrollInfo.sign = alert.Sign.TREATURE;
            alert.showWorlds(scrollInfo);
        }

        private static onBabyNotify(msg: pb.sc_get_new_skin_notify): void {
            FlowerPetInfo.addPets(msg.allSkinId);
        }
    }
}