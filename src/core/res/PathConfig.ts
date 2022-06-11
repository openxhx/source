
namespace pathConfig {
    export const xlsjsonPath = "res";
    export function getActivityAnimate(name: string) {
        return 'res/animate/activity/' + name + '.sk';
    }
    export function getClothIcon(id: number) {
        return 'res/cloth/icon/' + id + '.png';
    }
    export function getJsonPath(jsonName: string): string {
        return "res/json/" + jsonName + ".json";
    }
    export function getXlsJsonPath(jsonName: string): string {
        return "res/config/xls/" + jsonName + ".json";
    }
    export function getMapPath(id: number): string {
        return "res/map/map_" + id + ".png";
    }
    export function getCutMapPath(id: number, dic: number): string {
        return "res/map/map_" + id + "/" + dic + ".jpg";
    }
    export function getMapData(id: number): string {
        return `res/map/map_${id}/data.json`;
    }
    export function getSimpleMap(id: number): string {
        return `res/map/map_${id}/simple.png`
    }
    export function getMapGrid(id: number, row: number, col: number): string {
        return `res/map/map_${id}/${row}_${col}.png`;
    }
    export function getBuildingPath(id: number, level: number = 1): string {
        if (level > 5)
            level = 5;
        return "res/itemUI/building/" + id + "/" + level + ".png";
    }
    export function getBuildingIconPath(id: Number): string {
        return "res/itemIcon/building/" + id + ".png";
    }
    export function getFamilyBuildingPath(id: number): string {
        return "res/itemIcon/familyBuilding/" + id + ".png";
    }
    export function getSeedPath(id: number, level: number = 1): string {
        if (level > 5)
            level = 5;
        return "res/itemUI/seed/" + id + '/' + level + ".png";
    }
    export function getSeedIconPath(id: number): string {
        return "res/itemIcon/seed/" + id + ".png";
    }

    /**花精灵,花精灵王icon */
    export function getFairyIconPath(id: number): string {
        return 'res/itemIcon/fairySprite/' + id + '.png';
    }

    export function getExpandAreaPath(id: number): string {
        // if (id < 200)
        //     return "res/map/expandUI/" + 101 + ".png";
        // if (id < 300)
        //     return "res/map/expandUI/" + 201 + ".png";
        return "res/map/expandUI/" + id + ".png";
    }

    /**
     * 图鉴中角色小图
     * @param id 
     */
    export function getWikiRole(id: number): string {
        return 'res/roleWiki/role/' + id + '.png';
    }

    export function getPetSound(type: string, petType: number): string {
        return `res/sound/pet/${type}_${petType == 0 ? "free" : "vip"}.ogg`
    }

    /**
     * 图鉴中图片 大小各一张
     * @param id 
     */
    export function getWikiImg(id: number): { big: string, small: string } {
        return { big: 'res/roleWiki/big/' + id + '.png', small: 'res/roleWiki/small/' + id + '.png' };
    }

    /** 套装大图 */
    export function getSuitImg(id: number, sex: number): string {
        let xlsData: xls.suits = xls.get(xls.suits).get(id);
        let imgId: number = sex == 1 ? xlsData.imageId.v1 : xlsData.imageId.v2;
        return 'res/suit/' + imgId + '.png';
    }

    /** 剧情回忆大图 */
    export function getMemoryImg(id: number): string {
        return 'res/memory/story_' + id + '.png';
    }

    /** 获得建筑的种植属性图标 1-地面 2-水域 3-空中*/
    export function getBuildType(mapArea: number): string {
        return `commonRes/mapArea_${mapArea}.png`;
    }

    export function getAnimateJsonPath(id: string): string {
        return 'res/json/animate/' + id + '.json';
    }
    /**
     *  使用这个前必须加载npcBase表
     * 
     *  npc形象 传入的 都是下划线隔开的 前面的是角色id（npcBase表中的id） 后面的是表情idx
     *  @returns 返回路径数组 第一个元素是npc大图 第二个是表情图
     */
    export function getNpcPath(id: string): string | string[] {
        let idArr = id.split("_");
        let npcId = parseInt(idArr[0]);
        let emojId = idArr[1];
        let prefix = "res/npc/" + xls.get(xls.npcBase).get(npcId).display + '/';
        //特殊处理，历史问题这几个范围ID没有表情图，直接返回0
        let spRange = [[1400001, 1400004], [2810001, 2810221]];
        for (const range of spRange) {
            if (npcId >= range[0] && npcId <= range[1]) {
                return [prefix + `0.png`, prefix + `0.png`];
            }
        }
        if (!emojId) {
            return [prefix + `0.png`];
        }
        return [prefix + `0.png`, prefix + `${emojId}.png`];
    }
    export function getAnimateBgPath(id: number | string): string {
        return "res/bg/animateMovie/" + id + ".png";
    }
    export function getAnimateMusicPath(id: string): string {
        return "res/music/animteMovie/" + id + ".mp3";
    }
    /**配表动画文字框底 */
    export function getAnimateTalkFrame(mode: 'aside' | 'shock' | 'normal') {
        return 'unpack/animateMovie/img_' + mode + '.png';
    }
    /**怪物立绘 */
    export function getMonsterUI(id: number): string {
        return 'res/itemUI/monster/' + id + '.png';
    }
    /**角色立绘 */
    export function getRoleUI(id: number): string {
        return 'res/itemUI/role/' + id + '.png';
    }
    /**角色动态立绘 */
    export function getRoleAniUI(id: number): string {
        return 'res/itemUI/roleAni/' + id + '.sk';
    }
    /** 主角神祈立绘*/
    export function getPrayUI(id: number): string {
        return `res/itemUI/role/${id}.png`;
    }
    /**怪物方形头像 */
    export function getMonsterIcon(id: number): string {
        return 'res/itemIcon/monster/' + id + '.png';
    }
    export function getRoleName(id: number) {
        return 'res/itemUI/roleName/' + id + '.png';
    }

    /**
     * 获取聊天相关图标
     * @param chatType 聊天类型 
     * @param groupID 组ID
     * @param imgID 具体图片ID
     */
    export function getChatIMG(chatType: number, groupID: number, imgID: string): string {
        return "res/chat/" + chatType + "/" + groupID + "/" + imgID + ".png";
    }

    /** 系统气泡*/
    export function defaultBubble(): string {
        return "res/chat/bubbles/default.png";
    }

    /**
     * 获得角色战斗动作
     * @param id 
     */
    export function getRoleBattleSk(id: number): string {
        return "res/battle/role/" + id + ".sk";
    }

    /** 普通技能icon */
    export function getSkillIcon(skillId: number) {
        if (skillId > 1620000)
            return `res/itemIcon/pray/${skillId}.png`;
        return `res/battle/skillIcon/${skillId}.png`;
    }

    /**获取神祇技能icon */
    export function getPraySkillIcon(skillId: number) {
        return `res/itemIcon/pray/${skillId}.png`;
    }

    /**
     * 获取攻击特效
     * @param id 
     */
    export function getSkillEffect(id: string | number): string {
        return "res/battle/effect/" + id + ".sk";
    }

    export function getPraySkillEffect(id: string | number, sex: number): string {
        return `res/battle/effect/${id}${sex == 1 ? '' : 'M'}.sk`;
    }

    /**
     * 获取角色头像
     * @param roleID 
     */
    export function getRoleIcon(roleID: number): string {
        return "res/itemIcon/role/" + roleID + ".png";
    }


    /**
     * 获取小的战斗属性ico(RoleInfo中的ExtArrName)
     * @param type 
     */
    export function getRoleSmallAttrIco(type: number): string {
        return `commonRes/exAttr_${type}.png`;
    }

    /**
     * 获取人物属性ico(RoleInfo中的IdentityEnum枚举)
     */
    export function getRoleAttrIco(Identity: number): string {
        return `commonRes/attrIcon_${Identity}.png`;
    }

    /**
    * 获取人物属性垫底图(RoleInfo中的IdentityEnum枚举)
    */
    export function getRoleAttrBg(Identity: number): string {
        return `commonRes/attrBg_${Identity}.png`;
    }

    /** 职业属性*/
    export function getRoleBattleTypeIcon(type: number): string {
        return `commonRes/battleType_${type}.png`;
    }

    /** 获取角色品质框   */
    export function getRoleQuality(quality: number): string {
        return `commonRes2/roleFrame_${quality}.png`;
    }

    /** 获取角色品质框底图   */
    export function getRoleQualityBG(quality: number): string {
        return `commonRes2/roleFrameBg_${quality}.png`;
    }

    /** 获取角色品质框装饰图   */
    export function getRoleQualityDeco(quality: number): string {
        return `commonRes2/deco_${quality}.png`;
    }

    export function getRoleCircleBg(quality: number) {
        return `commonRes2/frame${quality}.png`;
    }

    /**获取角色方形立绘 */
    export function getRoleRectImg(id: number): string {
        return `res/itemUI/roleRect/${id}.png`;
    }

    /**获取模块全屏背景图路径 */
    export function getModuleBgImg(bg: string): string {
        return `res/bg/module/${bg}.png`;
    }

    export function getMissonSmallMap(missonId: number): string {
        return `res/adventure/bgMissionS/${missonId}.png`;
    }

    export function getMissonBigMap(missonId: number): string {
        return `res/adventure/bgMission/${missonId}.png`;
    }

    /** 获取战斗buff Ico*/
    export function getBuffIcon(id: number): string {
        return `res/battle/buffIcon/${id}.png`;
    }

    export function getBgmUrl(str: string) {
        return `res/music/bgm/${str}.mp3`;
    }

    export function getSoundUrl(str: string) {
        return `res/sound/${str}.ogg`;
    }

    /**公告面板图片 */
    export function getNoticeImg(str: string) {
        return str ? `res/noticeImg/${str}.png` : '';
    }

    /** 获取家族徽章或者家族徽章底图*/
    export function getFamilyBadgeUrl(id: number): string {
        return `res/itemIcon/badge/${id}.png`;
    }

    /**获取收藏的角色cg */
    export function getCollectionRoleBase(id: number) {
        return `res/collection/cg/${id}/`;
    }

    /**获取收藏的角色cg */
    export function getCollectionRoleIcon(id: number) {
        return `res/collection/cg/icon/${id}.png`;
    }

    /**秘闻录章节图片 title和role */
    export function getAdventureAct(id: number) {
        return {
            title: `res/adventure/miwenlu/title/${id}.png`,
            role: `res/adventure/miwenlu/role/${id}.png`
        }
    }

    /**系统开放图片集 */
    export function getSystemOpen(id: number) {
        return {
            icon: `res/systemOpen/${id}_icon.png`,
            txt: `res/systemOpen/${id}_txt.png`
        }
    }

    /**
     * 获取徽章icon
     * @param id 表中id
     * @param step 第几步（0开始）
     */
    export function getBadgeIcon(id: number, step: number) {
        let bg = `res/collection/badge/lv${Math.ceil((step + 1) / 2)}.png`;
        let icon = `res/collection/badge/${id}.png`;
        return { bg: bg, icon: icon };
    }

    /**
     * 根据组件ID和性别获取聊天表情
     * @param id 
     * @param sex 1-女 2-男
     */
    export function getChatEmoji(sex: number, id: number): string {
        let data: xls.chatType = xls.get(xls.chatType).get(id);
        let prc: number = sex == 1 ? data.f_chatPic : data.m_chatPic;
        return `res/chat/emoji/${prc}.png`;
    }

    /**
     * 根据组件ID获取聊天气泡
     * @param id 
     * @param sex 1-女 2-男
     */
    export function getChatBubble(sex: number, id: number): string {
        let data: xls.chatType = xls.get(xls.chatType).get(id);
        let prc: number = sex == 1 ? data.f_chatPic : data.m_chatPic;
        return `res/chat/bubbles/${prc}.png`;
    }

    /** 获取技能音效地址*/
    export function getBattleSound(id: number): string {
        return `res/battle/sound/${id}.ogg`;
    }

    /** 约会章节背景*/
    export function getAffairBG(id: number): string {
        return `res/itemUI/dateScr/${id}.png`
    }

    /**配表动画中的语音 */
    export function getAnimateTalkSound(name: string) {
        return `res/sound/talk/${name}.ogg`;
    }

    export function getFlowerWikiIcon(id: number) {
        return `res/itemIcon/flowerWiki/${id}.png`;
    }

    export function getTitlePath(titleId: number): string {
        return `res/title/${titleId}.png`;
    }

    /** 获得战斗文本*/
    export function getBattleTx(id: number): string {
        return `res/battle/battleWorld/${id}.png`;
    }

    /**
     * 获取花宝的资源
     * @param type 
     */
    export function getPetAnimate(type: number, lv?: number): string {
        if (type == 0) {
            return `res/animate/pet/huabao${lv}.sk`;
        }
        return `res/animate/pet/huabao${3 + type}.sk`;
    }

    export function getflowerPetRes(bigType: number, littleType: number): string {
        switch (bigType) {
            case 1:
                if (littleType == 1) return 'res/animate/pet/1/huabao1.sk';
            case 2:
                if (littleType == 1) return 'res/animate/pet/2/huabao2.sk';
            case 3:
                return `res/animate/pet/3/huabao${littleType + 2}.sk`;
            case 4:
                return `res/animate/pet/4/huabao${littleType + 6}.sk`;
        }
    }

    /**获取套装icon */
    export function getSuitIcon(id: number, sex: number) {
        return `res/itemIcon/suits/${sex == 1 ? 'female' : 'male'}/${id}.png`;
    }

    /**
     * 获取科技点ICO
     * @param scienceId 
     */
    export function getScienceIco(scienceId: number): string {
        return `res/itemIcon/scienceTree/${scienceId}.png`;
    }

    /**地图装饰大ui */
    export function getDecorationBigUI(id: number) {
        return `res/itemLargeUI/decoration/${id}.png`;
    }

    /**
     * 获得称号地址
     * @param id 
     */
    export function getTitleUrl(id: number): string {
        return `res/title/${id}.png`
    }

    /**
     * 获得排行奖励
     * @param type 
     */
    export function getRankReward(rank: number, type: number, sex: number): string {
        switch (rank) {
            case 1:
                if (type <= 2) {
                    return `res/rank/${rank}/${sex}/${type}.png`;
                }
                return `res/rank/${rank}/${type}.png`;
            case 2:
                if (type <= 3) {
                    return `res/rank/${rank}/${type}.png`;
                }
                return `res/rank/${rank}/${sex}/${type}.png`;
            case 3:
                if (type >= 2 && type <= 3) {
                    return `res/rank/${rank}/${sex}/${type}.png`;
                }
                return `res/rank/${rank}/${type}.png`;
        }
    }

    export function getRiderSkUrl(id: number | string) {
        return `res/itemUI/rider/${id}.sk`;
    }

    export function getPartyEggAdv(type: string): string {
        return `res/party/partyEgg/adChange/${type}.png`;
    }

    /**获取cp戒指特效 */
    export function getCpRingSk(id: number) {
        return `res/animate/cpRing/${id}.sk`;
    }

    /**获取cp信纸 */
    export function getCpLetterImg(id: number) {
        return `res/itemUI/cpLetter/${id}.png`;
    }

    /**获取奇趣道具动画 */
    export function getFunnyToySk(id: number) {
        return `res/animate/funnyToy/${id}.sk`;
    }

    /**获取cp展示名字背景图 */
    export function getCpTitle(id: number) {
        return `res/otherLoad/cpTitle/${id}.png`;
    }

    /** 获取限时活动ICON*/
    export function getLimitActivityIco(id: string): string {
        return `res/limitActivity/${id}.png`;
    }

    /** 获取地图特效*/
    export function getMapAnimate(name: string): string {
        return `res/animate/map/${name}.sk`;
    }
    /**获取摆在人身上的奇趣道具 */
    export function getFunnyToyPeopleImg(id: number) {
        return `res/itemUI/funnyProp/${id}.png`;
    }
}