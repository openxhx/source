namespace godMirror {
    export class GodMirrorModel {
        static leftView: pb.IMirrorRankInfo;
        static rightView: pb.IMirrorRankInfo;
        static leftUpTime: number;
        static rightUpTime: number;
        private static _upCDTime: number;
        private static _lastTime: number;
        private static _supportPanel: GodMirrorSupportPanel;

        static readConfig() {
            this._upCDTime = xls.get(xls.godMirror).get(1).cooldownTime * 3600;
            this._lastTime = xls.get(xls.godMirror).get(1).durationTime * 3600;
        }

        /**上传倒计时剩余 */
        static get uploadCd() {
            let uploadTime = Math.max(this.leftUpTime, this.rightUpTime);
            let restTime = Math.max(0, this._upCDTime - (clientCore.ServerManager.curServerTime - uploadTime));
            return restTime;
        }

        /**根据上传时间戳获取展示剩余时间 */
        static getShowTime(uploadTime: number) {
            let restTime = Math.max(0, this._lastTime - (clientCore.ServerManager.curServerTime - uploadTime));
            return restTime;
        }

        static refreshTimeInfo() {
            return net.sendAndWait(new pb.cs_flora_of_mirror_panel()).then((data: pb.sc_flora_of_mirror_panel) => {
                this.leftUpTime = data.timeOne;
                this.rightUpTime = data.timeTwo;
            })
        }

        static refreshSelfView() {
            this.leftView = this.rightView = null;
            return net.sendAndWait(new pb.cs_get_flora_of_mirror_user_info({ uid: clientCore.LocalInfo.uid })).then((data: pb.sc_get_flora_of_mirror_user_info) => {
                this.leftView = _.find(data.info, o => o.type == 1);
                this.rightView = _.find(data.info, o => o.type == 2);
            })
        }

        static uploadView() {
            let flag = this.leftView ? 2 : 1;
            net.sendAndWait(new pb.cs_flora_of_mirror_set_image({ type: flag })).then((data: pb.sc_flora_of_mirror_set_image) => {
                alert.showFWords('上传成功');
                if (flag == 1) {
                    this.leftView = data.info;
                    this.leftUpTime = data.time
                }
                else {
                    this.rightView = data.info;
                    this.rightUpTime = data.time
                }
            })
        }

        /**
         * 拉票
         * @param data 数据信息
         */
        static async getSupport(data: pb.IMirrorRankInfo) {
            let result = await this.showSupport();
            if (result) {
                await net.sendAndWait(new pb.cs_flora_of_mirror_get_support({ imageInfo: data.userid + '_' + data.type, times: result })).then((d: pb.sc_flora_of_mirror_get_support) => {
                    data = _.merge(data, d.mirrorInfo);
                    alert.showFWords('拉票成功')
                })
            }
            return data;
        }

        private static showSupport() {
            this._supportPanel = this._supportPanel || new GodMirrorSupportPanel();
            this._supportPanel.show();
            return new Promise<number>((ok) => {
                this._supportPanel.on(Laya.Event.COMPLETE, this, (num: number) => {
                    ok(num);
                });
                this._supportPanel.on(Laya.Event.END, this, () => {
                    ok(0);
                });
            })
        }

        /**
         * 点赞或者领红包
         * @param data 数据信息
         */
        static async likeOrGetReward(data: pb.IMirrorRankInfo) {
            if (data) {
                //有红包领红包
                if (data.redPacket > 0 && data.redPacketFlag == 0) {
                    //领红包
                    await net.sendAndWait(new pb.cs_flora_of_mirror_get_red_packet({ imageInfo: data.userid + '_' + data.type })).then((d: pb.sc_flora_of_mirror_get_red_packet) => {
                        alert.showReward(d.items);
                        data = _.merge(data, d.mirrorInfo);
                        data.redPacketFlag = 1;
                    })
                    return data;
                }
                //可以点赞
                else if (!data.isLiked) {
                    let likeLimit = xls.get(xls.godMirror).get(1).likeLimit;
                    if (data.userid == clientCore.LocalInfo.uid) {
                        alert.showFWords('给自己点赞的请自重……');
                    }
                    else if (data.likedTimes >= likeLimit) {
                        alert.showFWords('该玩家被点赞次数已达上限');
                    }
                    else {
                        //点赞
                        await net.sendAndWait(new pb.cs_flora_of_mirror_give_like({ imageInfo: data.userid + '_' + data.type })).then((d: pb.sc_flora_of_mirror_give_like) => {
                            data = _.merge(data, d.mirrorInfo);
                            alert.showFWords('点赞成功！');
                        })
                    }
                }
                return data;
            }
            else {
                return null;
            }
        }

        static destory() {
            this._supportPanel?.destroy();
            this._supportPanel = null;
        }
    }
}