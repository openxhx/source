namespace globalEvent {
    export const STAGE_RESIZE: string = 'STAGE_RESIZE';
    export const CHANGE_PRODUCR_ID: string = 'CHANGE_PRODUCR_ID';
    export const TAIWAN_LOGIN: string = 'TAIWAN_LOGIN';
    /** 进入游戏*/
    export const ENTER_GEME: string = 'ENTER_GEME';
    /** 一次*/
    export const TIME_ONCE: string = "TIME_ONCE";
    /** 无限次*/
    export const TIME_ON: string = "TIME_ON";

    /** 仓库道具点击 */
    export const BACKPACK_GOODS_CLICK: string = "BACKPACK_GOODS_CLICK";

    /** 仓库升级 */
    export const BACKPACK_UPGRADE: string = "BACKPACK_UPGRADE";

    /** 关闭弹窗一级面板 */
    export const CLOSE_DIALOG_MODULE: string = "CLOSE_DIALOG_MODULE";

    /** 玩家自己更改服装 */
    export const USER_CHANGE_CLOTH: string = "USER_CHANGE_CLOTH";

    //生产每秒刷新
    export const PRODUCE_TIME_REFRESH: string = "PRODUCE_TIME_REFRESH";

    //加速完成
    export const PRODUCE_SPEED_UP_SUCC: string = "RPODUCE_SPEED_UP_SUCC";
    export const GET_ONE_PRODUCT_IN_MODULE: string = "GET_ONE_PRODUCT_IN_MODULE";

    //收获产出
    export const PRODUCE_START_GET_PRODUCTION: string = "RPODUCE_START_GET_PRODUCTION";
    /** 从地图上收集到了产物, 2个参数：  MapItemsBaseInfo, Array<pb.IItem>*/
    export const PRODUCE_GET_PRODUCTION_SUCC: string = "RPODUCE_GET_PRODUCTION_SUCC";

    export const PRODUCE_GET_ALL_PRODUCTION: string = "RPODUCE_GET_ALL_PRODUCTION";
    export const PRODUCE_GET_ALL_PRODUCTION_SUCC: string = "RPODUCE_GET_ALL_PRODUCTION_SUCC";

    /** 玩家背包数据变动 */
    export const ITEM_BAG_CHANGE: string = "ITEM_BAG_CHANGE";

    /** 玩家材料数据变动 */
    export const MATERIAL_CHANGE: string = "MATERIAL_CHANGE";

    /**玩家背包服装变动 */
    export const CLOTH_CHANGE: string = "CLOTH_CHANGE";

    /** 玩家精灵树等级变动 */
    export const TREE_LEVEL_CHANGE: string = "MATERIAL_CHANGE";

    /** 开始地图摇杆移动 */
    export const JOY_STICK_START: string = "JOY_STICK_START";

    /** 地图缩放 参数为缩放后值 */
    export const MAP_SCALE: string = "MAP_SCALE";
    /** 地图摇杆移动*/
    export const JOY_STICK_CHANGE: string = 'JOY_STICK_CHANGE';
    /** 停止地图摇杆移动 */
    export const JOY_STICK_END: string = "JOY_STICK_END";
    /**剧情动画播放完成（或主动退出） 参数为途中选择的选项数组  没有配选项的就是空数组 */
    export const ANIMATE_MOVIE_PLAY_OVER: string = "ANIMATE_MOVIE_PLAY_OVER";
    /** 角色创建成功 */
    export const ROLE_CREATE_SUCC: string = "ROLE_CREATE_SUCC";
    /** 任务状态改变 */
    export const TASK_STATE_CHANGE: string = "TASK_STATE_CHANGE";
    export const REFINE_TASK_STATE_CHANGE: string = "REFINE_TASK_STATE_CHANGE";
    /** 领取了任务奖励 */
    export const TASK_GET_REWARD: string = "TASK_GET_REWARD";
    /** 游戏代币数量变化 */
    export const GAME_MONEY_CHANGE: string = "GAME_MONEY_CHANGE";
    /** net 抛出错误码 */
    export const ERROR_CODE: string = "ERROR_CODE";
    /** 更改昵称 */
    export const CHANGE_USER_NICK: string = "CHANGE_USER_NICK";
    /**断线 */
    export const CONNECT_CLOSE: string = "CONNECT_CLOSE";
    /**收到聊天 */
    export const NOTIFY_CHAT: string = "NOTIFY_CHAT";
    /**冒险关卡信息更新 参数stageBase中的id*/
    export const ADVENTURE_STAGE_INFO_UPDATE: string = "ADVENTURE_STAGE_INFO_UPDATE";
    /**冒险挂机队伍信息更新 */
    export const ADVMISSION_TEAM_UPDATE: string = 'ADVMISSION_TEAM_UPDATE';
    /**新手引导相关 */
    export const NEW_PLAYER_GUIDE_STEP_COM: string = "new_player_guide_step_com";
    export const NEW_PLAYER_GUIDE_SHOW_MASK_UI: string = "new_player_guide_show_mask_ui";
    export const NEW_PLAYER_GUIDE_DRAW_HOLE_INFO: string = "new_player_guide_draw_hole_info";

    /**地图扩建成功 */
    export const MAP_EXPAND_SUCC: string = "map_expand_succ";

    export const EV_SLOT_INFO_UPDATE: string = "EV_SLOT_INFO_UPDATE";

    export const EV_SKILL_INFO_UPDATE: string = "EV_SKILL_INFO_UPDATE";
    /** 检测彩虹*/
    export const CHECK_RAINBOW: string = "CHECK_RAINBOW";

    export const BEAN_LOAD_STRAT: string = "BEAN_LOAD_STRAT";
    export const BEAN_LOAD_PRO: string = "BEAN_LOAD_PRO";
    export const BEAN_LOAD_PRO_SUC: string = "BEAN_LOAD_PRO_SUC";
    export const BEAN_LOAD_END: string = "BEAD_LOAD_END";

    /** 登录模块打开*/
    export const LOGIN_OPEN_SUC: string = "LOGIN_OPEN_SUC";
    /** 注册成功*/
    export const SIGIIN_SUCCESS: string = "SIGIIN_SUCCESS";
    /** 连接getway*/
    export const LINK_GETWAY: string = "LINK_GETWAY";
    /** 成功进入游戏*/
    export const ENTER_GEME_SUC: string = "ENTER_GEME_SUC";
    /** 推送账号*/
    export const SYN_ACCOUNT: string = "SYN_ACCOUNT";
    /** 需要验证码*/
    export const NEED_VERICODE: string = "NEED_VERICODE";
    /** 选择一个服务器*/
    export const SELECT_ONE_SERVER: string = "SELECT_ONE_SERVER";
    /** 好感度更新啦*/
    export const FAVOR_UPDATE: string = "FAVOR_UPDATE";
    /** 约会副本更新*/
    export const AFFAIR_UPDATE: string = "AFFAIR_UPDATE";
    /** 好感度任务更新*/
    export const UPDATE_FAVORTASK: string = "UPDATE_FAVORTASK";
    /** 好感度订单任务道具更新*/
    export const UPDATE_FAVORTASK_ITEM: string = "UPDATE_FAVORTASK_HARVEST";
    /** 检查MASK*/
    export const CHECK_MASK: string = "CHECK_MASK";
    /** 更新家族徽章*/
    export const UPDATE_FAMILY_BADGE: string = "UPDATE_FAMILY_BADGE";
    /** 新邮件通知*/
    export const NEW_MAIN_NOTIFY: string = "NEW_MAIN_NOTIFY";
    /** 购买家族神秘商场道具*/
    export const BUY_FAMILY_SHOP_ITEM: string = "BUY_FAMILY_SHOP_ITEM";
    /** 更新家族建筑数据*/
    export const UPDATE_FAMILY_BUILD: string = "UPDATE_FAMILY_BUILD";

    export const HARVEST_ONE_FLOWER: string = "harvest_one_flower";
    /**好友信息变动 */
    export const FRIEND_INFO_CHANGE: string = "FRIEND_INFO_CHANGE";
    /**通知家族成员职位变化*/
    export const SYN_POST_CHANAGE: string = "SYN_POST_CHANAGE";
    /**查询系统开放状态 参数id 回调 */
    export const CHECK_SYSTEM_OPEN: string = 'CHECK_SYSTEM_OPEN';
    /**系统开放数据变动 参数 {id:number, open:boolean} */
    export const SYSTEM_OPEN_CHANGED: string = 'SYSTEM_OPEN_CHANGED';
    /**成功进入地图结束 */
    export const ENTER_MAP_SUCC: string = "enter_map_succ";
    /**进入地图失败 */
    export const ENTER_MAP_FAIL: string = "enter_map_fail";
    /**开始换地图 */
    export const START_CHANGE_MAP: string = "START_CHANGE_MAP";
    /**玩家飞行完 */
    export const PLAYER_FLY_COMPLETE: string = "player_fly_complete";
    /**通知家族订单刷新 */
    export const SYN_FAMILY_ORDER: string = "SYN_FAMILY_ORDER";
    /**主UI 隐藏状态更改 */
    export const MAIN_UI_CHANGE_SHOW_STATE: string = "main_ui_change_show_state";
    /**玩家更换头像或头像框 */
    export const USER_HEAD_IMAGE_CHANGE: string = 'USER_HEAD_IMAGE_CHANGE';
    /**花宝经验值变动 */
    export const FLOWER_PET_CHANGE: string = 'FLOWER_PET_CHANGE';
    /**支付成功 */
    export const PAY_OK: string = 'PAY_OK';
    /**取消支付 */
    export const PAY_CANCLE: string = 'PAY_CANCLE';
    /**支付失败 */
    export const PAY_FAIL: string = 'PAY_FAIL';
    /**激活主界面倒计时 */
    export const ACTIVE_UI_TIMER: string = 'ACTIVE_UI_TIMER';
    /** vip 花宝信息变更 花宝升级或者到期广播*/
    export const FLOWER_PET_VIP_CHANGE_NOTICE: string = "flower_pet_vip_change_notice";
    /**红点数据已刷新(参数 number[] | number) */
    export const RED_POINT_CHANGED: string = 'RED_POINT_CHANGED'
    /**正在关闭所有模块 */
    export const CLOSING_ALL_MODULE: string = 'CLOSING_ALL_MODULE';
    /**解锁信息通知 */
    export const SHOW_SYSTEM_LOCK_INFO: string = "SHOW_SYSTEM_LOCK_INFO";
    /**注册huabutton消亡 */
    export const REG_REMOVE: string = "REG_REMOVE";

    export const SYSTEM_OPEN_MANAGER_INIT_COMPLETE: string = "SYSTEM_OPEN_MANAGER_INIT_COMPLETE";
    /**开始ios支付管理（立即出触发补单） */
    export const IOS_IAP_START: string = 'IOS_IAP_START';
    /**随机事件广播 */
    export const RANDOM_EVENT_INFO_NOTICE: string = "RANDOM_EVENT_INFO_NOTICE";
    /**玩家经验变化通知 */
    export const USER_EXP_CHANGE: string = "USER_EXP_CHANGE";
    /**地图拾取通知 */
    export const MAP_ITEM_PICK: string = "MAP_ITEM_PICK";
    /**前端弹出的系统消息 */
    export const FAKE_SYSTEM_MESSAGE_NOTICE: string = "FAKE_SYSTEM_MESSAGE_NOTICE";
    /**后台通知红点改变 */
    export const RED_POINT_CHANGED_BY_NOTICE: string = "RED_POINT_CHANGED_BY_NOTICE";
    /**玩家升级通知 */
    export const USER_LEVEL_UP: string = "USER_LEVEL_UP";
    /**展示充值广告按钮 (参数是按钮url) */
    export const SHOW_ADS_BTN: string = 'SHOW_ADS_BTN';
    /**玩家vip经验值变动（氪金） */
    export const USER_VIP_EXP_CHANGE: string = 'USER_VIP_EXP_CHANGE';
    /**家族徽章更改 */
    export const FAMILY_BADGE_CHANGE: string = "FAMILY_BADGE_CHANGE";
    /**称号改变 */
    export const TITLE_CHANGE: string = "TITLE_CHANGE";
    /**好友互助信息更新 */
    export const FRIEND_HELP_INFO_REFRESH: string = "FRIEND_HELP_INFO_REFRESH";
    /**世界boss血量更新 */
    export const BOSS_BLOOD_REFRESH: string = "BOSS_BLOOD_REFRESH";
    /**世界boss创建成功 */
    export const BOSS_CREATE_SUC: string = "BOSS_CREATE_SUC";
    /**关闭所有模块 */
    export const CLOSE_ALL_MODULE: string = 'CLOSE_ALL_MODULE';
    /**怪物血量更新 */
    export const MONSTER_BLOOD_CHG: string = 'MONSTER_BLOOD_CHG';
    /**ios玩家复制成功 */
    export const IOS_COPY_OVER: string = 'ios_copy_over';
    /**跳转模块在模块已打开时传递参数 */
    export const SEND_PARAM_TO_MODULE: string = 'SEND_PARAM_TO_MODULE';

    //---------------导师系统--------------------
    /**玩家自身身份变更 */
    export const MENTOR_IDENTITY_CHANGE: string = 'MENTOR_IDENTITY_CHANGE';
    /**每日求助信息有更新 */
    export const MENTOR_HELP_CHANGE: string = 'MENTOR_HELP_CHANGE';
    /**学生任务的完成进度有更新 */
    export const MENTOR_TASK_CHANGE: string = 'MENTOR_TASK_CHANGE';
    /**学生列表有人数变动(主要针对导师面板上的学生列表刷新 ) */
    export const MENTOR_STUEND_LIST_CHANGE: string = 'MENTOR_STUEND_LIST_CHANGE';
    /**申请列表有人数变动(主要针对导师面板上的学生列表刷新 ) */
    export const MENTOR_APPLY_LIST_CHANGE: string = 'MENTOR_APPLY_LIST_CHANGE';
    /**有桃李之心可以领取(主要用于主页面上的红点 ) */
    export const MENTOR_HAVE_GIFT: string = 'MENTOR_HAVE_GIFT';
    /**我的成长点数有变化 */
    export const MENTOR_MY_GROW_CHANGE: string = 'MENTOR_MY_GROW_CHANGE';
    /**更新一下主ui上的红点 */
    export const MENTOR_UPDATE_MAINUI_RED: string = 'MENTOR_UPDATE_MAINUI_RED';
    /** 更新一次逝梦之境的界面显示*/
    export const UPDATE_LOST_DREAM: string = 'UPDATE_LOST_DREAM';
    /** 扭蛋抽奖背包物品更新 */
    export const PARTY_PACKAGE_ITEM_CHANGE_BY_DRAW: string = "PARTY_PACKAGE_ITEM_CHANGE_BY_DRAW";
    /** 派对入口开启引导 */
    export const PARTY_ENTER_OPEN_START: string = "PARTY_ENTER_OPEN_START";
    /** 花灵餐厅入口开启引导 */
    export const RESTAURANT_ENTER_OPEN_START: string = "RESTAURANT_ENTER_OPEN_START";
    /** 送花之后更新对方所获得的花数量*/
    export const GIEV_SOME_FLOWER_UPDATE_NUM: string = 'GIEV_SOME_FLOWER_UPDATE_NUM';
    /**CP关系变更 */
    export const CP_INFO_UPDATE: string = 'CP_INFO_UPDATE';
    /**CP申请列表变更 */
    export const CP_APPLY_LIST_UPDATE: string = 'CP_APPLY_LIST_UPDATE';
    /**收到解约申请 */
    export const CP_DIVORCE_ALERT: string = 'CP_DIVORCE_ALERT';
    /**cp关系建立 */
    export const CP_RELATION_INIT_ALERT: string = 'CP_RELATION_INIT';
    /**花仙巡游礼物落地 */
    export const VEHICLE_SHOW: string = 'VEHICLE_SHOW';
    /**清理行动游戏格子消除 */
    export const GRID_REMOVE: string = 'GRID_REMOVE';
    export const BALL_DEAD: string = 'BALL_DEAD';
    /**cp新预约了一个结缘礼信息 */
    export const CP_CHANGE_WEDDINGINFO: string = 'CP_CHANGE_WEDDINGINFO'
    /**结缘礼福袋捡取倒计时有变化,参数传上一次捡取时间戳 */
    export const CP_RED_BAG_TIME_CHANGE: string = 'CP_RED_BAG_TIME_CHANGE';
    /**UI框显示状态改变 可以用UIManager.isHide判断 */
    export const HUD_DISPLAY_CHANGE: string = 'HUD_DISPLAY_CHANGE';
    /**结缘礼进行状态改变 */
    export const WEDDING_PROCEDURE_STATE_CHANGE: string = 'WEDDING_PROCEDURE_STATE_CHANGE';
    /**改变婚礼地图福袋显示 */
    export const CHANGE_WEDDING_BAG_VISIBLE: string = 'CHANGE_WEDDING_BAG_VISIBLE';

    export const CHECK_NEXT_ADS: string = 'CHECK_NEXT_ADS';
    /**打开下一个 */
    export const OPEN_NEXT_ADS: string = 'OPEN_NEXT_ADS';


    /** 以下心有灵夕活动-不要抢*/
    export const ANSWER_PREPARE_OUT: string = 'ANSWER_PREPARE_OUT';
    export const ANSWER_PREPARE_OPP_SURE: string = 'ANSWER_PREPARE_OPP_SURE';
    export const ANSWER_UPDATE_Q: string = 'ANSWER_UPDATE_Q';
    export const ANSWER_UPDATE_A: string = 'ANSWER_UPDATE_A';
    export const ANSWER_EXIT: string = 'ANSWER_EXIT';
    export const CLSOE_ANSWER_MODULE: string = 'CLSOE_ANSWER_MODULE';
    /** END*/

    /**场景中的角色创建完成，时间参数为pb.IUserBase */
    export const PEOPLE_MAP_CREATE_OVER: string = 'PEOPLE_MAP_CREATE_OVER';

    /**中秋话剧 event完成,参数发当前的event.v2 */
    export const MID_OPERA_EVENT_COMPLETE: string = 'MID_OPERA_EVENT_COMPLETE';

    /**中秋话剧 进入战斗 参数传stageId */
    export const MID_OPERA_ENTERFIGHT: string = 'MID_OPERA_ENTERFIGHT';

    /**中秋话剧 进度更新*/
    export const MID_OPERA_PROGRESS_UPDATE: string = 'MID_OPERA_PROGRESS_UPDATE';

    // 密室逃脱 道具更新
    export const SECRETROOM_ITEM_UPDATE: string = 'SECRETROOM_ITEM_UPDATE';

    /**满屏模块关闭或者回到家园 */
    export const FULL_SCREEN_CLOSE_OR_BACK_HOME: string = 'FULL_SCREEN_CLOSE_OR_BACK_HOME';

    /**特殊的活动icon每日勋章 */
    export const SPECIAL_DAILY_MEDAL: string = `SPECIAL_DAILY_MEDALE`;

    /**限时活动红点更新 */
    export const UPDATE_LIMIT_ACTIVITY_RED: string = `UPDATE_LIMIT_ACTIVITY_RED`;

    /** 装饰道具数据变动 */
    export const COLLOCATION_CHANGE: string = "COLLOCATION_CHANGE";

    /** 限时活动按钮有commonAward中的奖励可以领取，参数为boolean*/
    export const HAVE_COMMONAWARD_TO_GET: string = 'HAVE_COMMONAWARD_TO_GET';

    // 签到强弹关闭
    export const SIGN_ALERT_CLOSE: string = 'SIGN_ALERT_CLOSE';

    /**首次分享领奖 */
    export const FIRST_SHARE_BACK: string = 'FIRST_SHARE_BACK';

    /**玩家自己的奇趣道具有更新 */
    export const FUNNY_TOY_INFO_UPDATE: string = 'FUNNY_TOY_INFO_UPDATE';

    /**玩家撞到了福袋 */
    export const COLLISION_FU: string = 'COLLISION_FU';

    /** 年兽状态*/
    export const NIAN_STATUS: string = 'NIAN_STATUS';

    /** 春日果园-离开对战*/
    export const ORCHARD_PREPARE_OUT: string = 'ORCHARD_PREPARE_OUT';
    /** 春日果园-退出*/
    export const ORCHARD_EXIT: string = 'ORCHARD_EXIT';
    /**清除地图上的一个线索(少女记忆书)*/
    export const GIRLMOMORIES_CLEAR_CLUE: string = "GIRLMOMORIES_CLEAR_CLUE";
    /**关闭诗文答题奖励*/
    export const CLOSE_ANWEREXTREWARD_MODULE: string = "CLOSE_ANWEREXTREWARD_MODULE";

    /**跨天 */
    export const ON_OVER_DAY: string = "ON_OVER_DAY";

    /**订单交付成功 */
    export const ORDER_FINISH: string = "ORDER_FINIFH";

    /**改变坐骑坐姿 */
    export const CHANGE_RIDER_POSTURE: string = "CHANGE_RIDER_POSTURE";
}