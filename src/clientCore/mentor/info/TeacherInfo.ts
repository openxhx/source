namespace clientCore.mentor {
    export class TeacherInfo extends MentorBaseInfo {

        /**我在导师这的成长值 */
        get growPoint() {
            return this._srvData.grow;
        }
        

    }
}