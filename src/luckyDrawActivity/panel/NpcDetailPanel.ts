namespace luckyDrawActivity {
    export class NpcDetailPanel extends ui.luckyDrawActivity.panel.NpcDetailPanelUI{
        constructor(){
            super();
        }
        init(){
            this.sideClose = true;
            this.mouseEnabled = false;

            let sp = new Laya.Sprite();
            sp.graphics.drawRect(0,0,Laya.stage.width,Laya.stage.height,"#000000");
            sp.alpha = 0.8;
            this.addChildAt(sp,0);
            sp.x = (this.width - Laya.stage.width)/2;
        }
        /**
         * 
         * @param index 1塔巴斯   2 琳恩
         */
        showNpc(index:number){
            this.imgNpc_1.visible = index == 1;
            this.imgNpc_2.visible = index == 2;
            let skillIDArr = [];
            if(index == 1){
                skillIDArr.push(1610214);
                skillIDArr.push(1615214);
            }
            else{
                skillIDArr.push(1610213);
                skillIDArr.push(1615213);
            }
            for (let i = 1;i<4;i++){
                if(i > skillIDArr.length){
                    this["boxSkill_"+i].visible = false;
                }
                else{
                    this["imgSkill_"+i].skin = "res/battle/skillIcon/"+skillIDArr[i-1]+".png";
                    this["txtSkillName_"+i].text = xls.get(xls.SkillBase).get(skillIDArr[i-1]).skillName;
                    this["txtSkillIntro_"+i].text = xls.get(xls.SkillBase).get(skillIDArr[i-1]).skillDesc;
                }
            }
        }
        destroy(){
            super.destroy();
        }
    }
}