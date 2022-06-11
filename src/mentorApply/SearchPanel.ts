namespace mentorApply {
    export class SearchPanel extends ui.mentorApply.SearchPanelUI {
        private _type:number;
        private _searchUserInfo:pb.IUserBase;
        constructor(){
            super();
        }

        init(){
            this.txtInput.visible = false;
            this.txtInput.restrict = "0-9";
        }
        /** 1收徒  2拜师 */
        show(type:number){
            this._type = type;
            this.imgTitle.skin = this._type == 1?"mentorApply/寻找徒弟.png":"mentorApply/寻找师傅.png";
            this.txtInput.visible = false;
            this.txtInput.text = "";
            this.imgInput.visible = true;
            clientCore.DialogMgr.ins.open(this);
        }

        addEventListeners(){
            BC.addEvent(this,this.imgInput,Laya.Event.MOUSE_DOWN,this,this.startInput);
            BC.addEvent(this,this.txtInput,Laya.Event.BLUR,this,this.loseFocus);
            BC.addEvent(this,this.btnSend,Laya.Event.CLICK,this,this.onSendClick);
            BC.addEvent(this,this.btnClose,Laya.Event.CLICK,this,this.onCloseClick);
        }
        onCloseClick(){
            clientCore.DialogMgr.ins.close(this);
        }
        onSendClick(){
            if(this.txtInput.text == ""){
                alert.showSmall("请输入要寻找的玩家ID！");
                return;
            }
            net.sendAndWait(new pb.cs_get_user_base_info({uids:[parseInt(this.txtInput.text)]})).then((data:pb.sc_get_user_base_info)=>{
                if(data.userInfos.length > 0){
                    this._searchUserInfo = data.userInfos[0];
                    alert.showSmall(`是否确认向${data.userInfos[0].nick}（id：${data.userInfos[0].userid}）发送${this._type == 1?"收徒":"拜师"}请求？`,{
                        callBack: { caller: this, funArr: [this.sureSendApply]},
                        btnType: alert.Btn_Type.SURE_AND_CANCLE,
                        needMask: true,
                        clickMaskClose: true,
                        needClose: true,
                    });
                }
                else{
                    alert.showFWords("搜索的ID不存在");
                }
                
            });
        }
        private sureSendApply(){
            net.sendAndWait(new pb.cs_apply_teachers_relation({type:this._type,otherId:this._searchUserInfo.userid})).then((data:pb.sc_apply_teachers_relation)=>{
                alert.showFWords("请求发送成功！");
            });
        }
        startInput(){
            this.imgInput.visible = false;
            this.txtInput.visible = true;
            this.txtInput.text = "";
            this.txtInput.focus = true;
        }

        loseFocus(){
            if(this.txtInput.text == ""){
                this.imgInput.visible = true;
                this.txtInput.visible = false;
            }
        }

        destroy(){
            BC.removeEvent(this);
            super.destroy();

        }

    }
}