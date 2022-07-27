
//接收使用者訊息
function doPost(e) {
	var userData = JSON.parse(e.postData.contents);
	console.log(userData);

	// 取出 replayToken 和發送的訊息文字
	var replyToken = userData.events[0].replyToken;
	var groupID = userData.events[0].source.groupId;
	var sTest = "";
	sTest = "TestABCD\n"
	pushMessage(CHANNEL_ACCESS_TOKEN, groupID, sTest);

// todo, 用群組ID 找對應的 發文開始日期, 發文時間
// 計算第幾天
	// colum C = StartDate, Colum E = StartTime
	var hd = new Date ((+new Date(ss_GroupDB_data[0][2])) + (+new Date(ss_GroupDB_data[0][4])) - (+new Date('1899/12/30 00:00:00'))).valueOf();
	var td=new Date().valueOf();	// current date
	var sec=1000;
	var min=60*sec;
	var hour=60*min;
	var day=24*hour;
	var diff=td-hd;
	var days=Math.floor(diff/day);
	var hours=Math.floor(diff%day/hour);
	var minutes=Math.floor(diff%day%hour/min);
	Logger.log('%s days %s hours %s minutes',days,hours,minutes);
    Logger.log(td);

	var day = days;
	if (hour > 0 ||  minutes > 0)
	{
		day++;
		Logger.log("day diff:"+day);
	}
// 發送每天訊息
	SendMaterial_txt(day, columText, groupID);
	SendMaterial_video(day, columVideo, groupID);
	SendMaterial_image(day, columImage, groupID);

  try {
    var clientMessage = userData.events[0].message.text;
    if (clientMessage.toLowerCase() != enableWord.toLowerCase() && clientMessage.toLowerCase() != disableWord.toLowerCase()) {
      // ignore;
      return;
    }
    if (clientMessage.toLowerCase() == disableWord.toLowerCase()) {
      disableAutoPost(groupID, sheetID);
      return;
    }
    var replyData = getUserAnswer(groupID, clientMessage);
  }
  catch(err) {
    var clientMessage = userData.events[0].postback.data;
    switch (clientMessage) {
      case "DateMessage":
        clientMessage = userData.events[0].postback.params.date;
        var replyData = getUserAnswer(groupID, clientMessage);
        break;

      case "TimeMessage":
        clientMessage = userData.events[0].postback.params.time;
        var replyData = getUserAnswer(groupID, clientMessage);
        break;

      default:
        var replyData = checkConfirmData(CHANNEL_ACCESS_TOKEN, groupID, clientMessage, replyToken);
    }
  }

  var QandO = [sheetData[0], sheetData[1], sheetData[replyData[0] - 1]];
  switch (replyData[1]) {

    case -2:
      return;
    case -1:
      var replyMessage = cancelMessage;
      break;
    case 0:
      var replyMessage = confirmMessage + "\n";
      replyMessage += "提醒時間：" + alarmTimeConvert(QandO[2][1], clientMessage) + "\n"; // 有BUG 無法正常顯示
      replyMessage += "提醒事項：" + clientMessage;
      sendConfirmMessage(CHANNEL_ACCESS_TOKEN, replyToken, replyMessage);
      return;
    case 1:
      var replyMessage = finishTitle;
      break;
    case 2:
      pushMessage(CHANNEL_ACCESS_TOKEN, groupID, welcomeTitle);
      var replyMessage =  QandO[0][replyData[1] - 1];
      sendDateMessage(CHANNEL_ACCESS_TOKEN, replyToken, replyMessage);
      return;
    case 3:
      var replyMessage =  QandO[0][replyData[1] - 1];
      sendTimeMessage(CHANNEL_ACCESS_TOKEN, replyToken, replyMessage);
      return;
    default:
      var replyMessage = QandO[0][replyData[1] - 1] + "\n" + QandO[1][replyData[1] - 1]; /// 打印D1 D2
  }
  sendReplyMessage(CHANNEL_ACCESS_TOKEN, replyToken, replyMessage);
}
