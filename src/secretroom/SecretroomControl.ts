namespace secretroom{
    export class SecretroomControl implements clientCore.BaseControl{
        constructor(){}

        /**
         * 获取房间提示等级
         * @param roomId 
         */
        getLevel(roomId: number): Promise<number>{
            return net.sendAndWait(new pb.cs_halloween_notice_level({roomId: roomId})).then((msg: pb.sc_halloween_notice_level)=>{
                return Promise.resolve(msg.noticeLevel);
            })
        }

        /**
         * 提升房间提示等级
         * @param roomId 
         * @param handler 
         */
        upLevel(roomId: number): Promise<number>{
            return net.sendAndWait(new pb.cs_halloween_buy_notice({roomId: roomId})).then((msg: pb.sc_halloween_buy_notice)=>{
                return Promise.resolve(msg.noticeLevel);
            });
        }
    }
}