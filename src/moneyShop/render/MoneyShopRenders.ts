namespace moneyShop {

    export function chargeRenderFunc(cell: ui.moneyShop.render.ChargeRenderUI, idx: number) {
        let open = !clientCore.SystemOpenManager.ins.checkActOver(28);
        let data: xls.rechargeMoneyShop = cell.dataSource;
        cell.imgIcon.skin = `moneyShop/icon${idx + 1}.png`;
        if (data.tag.length > 0) {
            cell.imgTag.skin = `moneyShop/${data.tag}.png`;
        }
        cell.imgTag.visible = data.tag.length > 0;
        // let isTosTestItem = IOS_TEST_IDS.indexOf(data.id) > -1;
        let isTosTestItem: boolean = data.showRule == 2;
        if (isTosTestItem) {
            let shopInfo = clientCore.RechargeManager.getShopInfo(data.chargeId);
            let rwd = clientCore.LocalInfo.sex == 1 ? shopInfo.rewardFamale : shopInfo.rewardMale;
            cell.txtDes.visible = true;
            cell.txtDes.text = data.desc;
            cell.txtPrice.value = shopInfo.cost.toString();
            cell.txtExtra.value = rwd[0].v2.toString();
            cell.imgExtraIcon.skin = clientCore.ItemsInfo.getItemIconUrl(rwd[0].v1)
        }
        else {
            let payDate = clientCore.RechargeManager.checkBuyLimitInfo(data.chargeId);
            let isFirst = payDate.payFinTimes == 0 || (clientCore.ServerManager.curServerTime >= util.TimeUtil.formatTimeStrToSec(data.openDate) && payDate.lastTime < util.TimeUtil.formatTimeStrToSec(data.openDate));
            cell.txtDes.visible = true;
            cell.txtDes.text = isFirst ? (open ? data.actDesc : data.desc) : data.extraDesc;
            cell.txtDes.width = (isFirst && open) ? 186 : 247;
            let times = Math.round(data.actReward[0].v2 * 100 / data.reward[0].v2);
            cell.txtEvent.text = times == 400 ? "" : times + "%";
            cell.imgEvevt.skin = times == 400 ? "moneyShop/400%.png" : "moneyShop/圆角矩形 4.png";
            cell.imgEvevt.visible = isFirst && open;
            cell.txtExtra.value = data.reward[0].v2.toString();
            cell.txtPrice.value = clientCore.RechargeManager.getShopInfo(data.chargeId).cost.toString();
            cell.imgExtraIcon.skin = clientCore.ItemsInfo.getItemIconUrl(clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID);
        }
    }

    export function newbieRenderFunc(cell: ui.moneyShop.render.NewbieRenderUI, idx: number) {
        let chargeId = cell.dataSource as number;
        if (NEED_CHECK_SEX.indexOf(chargeId) == -1)
            cell.imgIcon.skin = `moneyShop/newbie/item${NEWBIE_CHARGE_IDS.indexOf(chargeId) + 1}.png`;
        else
            cell.imgIcon.skin = `moneyShop/newbie/item${NEWBIE_CHARGE_IDS.indexOf(chargeId) + 1}_${clientCore.LocalInfo.sex}.png`;
        let info = clientCore.RechargeManager.getShopInfo(chargeId);
        cell.imgGet.visible = clientCore.RechargeManager.checkBuyLimitInfo(chargeId).payFinTimes > 0;
        cell.txtPrice.value = info.cost.toString();
    }

    export function listTodayRender(cell: ui.moneyShop.render.TodayRenderUI, idx: number) {
        let data = cell.dataSource as xls.rechargeToday;
        let info = this._rewardStateMap.get(data.id);
        let rechargeInfo = clientCore.RechargeManager.getShopInfo(data.productId);
        cell.imgIcon.skin = `res/otherLoad/moneyShopDailyGift/${data.id}.png`;
        cell.imgGet.visible = info.state == STATE.GETED_REWARD;
        cell.txtPrice.value = rechargeInfo?.cost?.toString();
        cell.imgState.skin = idx == 0 ? 'moneyShop/txtfree.png' : 'moneyShop/txtget.png';
        cell.txtDay.text = `有效期${7 - info.day}天`;
        cell.imgRed.visible = false;
        // cell.imgDismount.visible = data.openDate != ""; //配置了时间的话 可能就是要下架了

        switch (info.state) {
            case STATE.NO_REWARD:
                //还没买
                cell.boxPrice.visible = true;
                cell.boxDay.visible = false;
                cell.imgState.visible = false;
                cell.txtDes.text = data.id == 1 ? '限领一次' : '限购一次';
                break;
            case STATE.GETED_REWARD:
                //已领取本日的
                cell.imgState.visible = true;
                cell.boxPrice.visible = false;
                cell.boxDay.visible = true;
                cell.txtDes.text = '限领一次';
                break;
            case STATE.HAVE_REWARD:
                //可领取本日
                cell.imgState.visible = true;
                cell.boxPrice.visible = false;
                cell.boxDay.visible = true;
                cell.txtDes.text = '限领一次';
                if (info.id != 4) {
                    cell.imgRed.visible = true;
                }
                break;
            default:
                break;
        }
        if (idx == 0)
            cell.boxDay.visible = false;
        //id == 4特殊处理(每天只能买一次的礼包 )
        if (info.id == 4) {
            cell.imgGet.visible = info.day == 1;
            cell.txtDes.text = '每日限购一次';
            cell.boxPrice.visible = true;
            cell.boxDay.visible = false;
            cell.imgState.visible = false;
        }
    }

    export function listEventRenderFunc(cell: ui.moneyShop.render.EventRenderUI, idx: number) {
        let data = cell.dataSource as xls.rechargeEvent;
        cell.imgIcon.skin = `moneyShop/eventBag${data.id}.png`;
        if (data.tag.length > 0) {
            cell.imgTag.skin = `moneyShop/${data.tag}.png`;
        }
        cell.labName.text = data.name;
        cell.imgTag.visible = data.tag.length > 0;
        cell.imgGot.visible = clientCore.RechargeManager.checkBuyLimitInfo(data.chargeId).lastTime > clientCore.ServerManager.getWeekUpdataSec();
        let info = clientCore.RechargeManager.getShopInfo(data.chargeId);
        cell.txtPrice.value = info.cost.toString();
    }

    export function listDawnRenderFunc(cell: ui.moneyShop.render.DawnSuitRenderUI, idx: number) {
        let srvData = cell.dataSource as pb.PickUpFlowerSuit
        let data = xls.get(xls.dawnBlossoms).get(srvData.idx);
        if (data) {
            cell.txtLimit.text = srvData.limitCnt.toString();
            cell.txtName.text = data.suitName;
            cell.imgIcon.skin = pathConfig.getSuitImg(data.suitId, clientCore.LocalInfo.sex);
            cell.listStar.repeatX = clientCore.SuitsInfo.getSuitInfo(data.suitId).suitInfo.quality;
            cell.imgPrice.skin = clientCore.ItemsInfo.getItemIconUrl(data.price.v1);
            cell.boxDiscount.visible = srvData.isSpec == 1;
            cell.txtPrice.text = srvData.isSpec ? data.sellPrice.v2.toString() : data.price.v2.toString();
            cell.imgGet.visible = clientCore.SuitsInfo.getSuitInfo(data.suitId).allGet;
            if (srvData.isSpec) {
                cell.txtOri.text = data.price.v2.toString();
            }
        }
    }
}