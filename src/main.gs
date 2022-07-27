//程式碼開始
var SS 						= SpreadsheetApp.getActive();

// load data from tab> config
var ss_config 				= SS.getSheetByName("config");
var ss_config_data 			= ss_config.getSheetValues(2, 2, 20, 2); //B2~B20
var CHANNEL_ACCESS_TOKEN 	= ss_config_data[0][0].replace(/\r?\n|\r/g, ""); //line bot token	，並消除換行符號（避免有人複製貼上時複製到換行符號）
var sheetID 				= ss_config_data[1][0]; // google sheet ID

// load data from tab: material
var ss_material 			= SS.getSheetByName("material");
var ss_material_data 		= ss_material.getSheetValues(2, 1, 62, 26); //A2~Z62
var columText	= 1; // text is on colum B
var columVideo	= 2; // video is on colum C
var columImage	= 4; // image/slide is start from colum E

// load data from tab: GroupDB
var ss_GroupDB 				= SS.getSheetByName("GroupDB");
var ss_GroupDB_data 		= ss_GroupDB.getSheetValues(2, 1, 51, 7); //A2~G51, max support group count = 50


var myID = "";
var confirmMessage = "您所輸入的資料如下：";
var cancelMessage = "您所輸入的資料已取消";
var welcomeTitle = "定時提醒系統，請輸入相關資料進行設定";
var finishTitle = "設定完成，時間到了會發出 Line 訊息通知您";
var ignoreWord = [];
var stopAlarmWord = "ok";    //停止提醒用的關鍵字
var enableWord = "enable";    //enable的關鍵字
var disableWord = "disable";    //disable的關鍵字

var spreadSheet = SpreadsheetApp.openById(sheetID);
var sheet = spreadSheet.getActiveSheet();
var lastRow = sheet.getLastRow();
var lastColumn = sheet.getLastColumn();
var sheetData = sheet.getSheetValues(1, 1, lastRow, lastColumn);

//設定分頁 GroupList
var sheet_GroupList = SpreadsheetApp.openById(sheetID).getSheetByName("GroupList");
var sheet_GroupList_lastRow = sheet_GroupList.getLastRow();
var sheet_GroupList_lastColumn = sheet_GroupList.getLastColumn();
var sheet_GroupList_Data = sheet_GroupList.getSheetValues(2, 1, sheet_GroupList_lastRow, sheet_GroupList_lastColumn);

function getSheetsName(){
  let ss = SpreadsheetApp.getActive();
  let sheets = ss.getSheets();
  for (let i = 0; i < sheets.length; i ++){
    Logger.log(sheets[i].getName())
  }
}

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

// send material_txt to LineGroup
function SendMaterial_txt(day, colum_text, targetID)
{
	if (ss_material_data[day][colum_text] != "")
	{
		Logger.log(ss_material_data[day][colum_text]);
		pushMessage(CHANNEL_ACCESS_TOKEN, targetID, ss_material_data[day][colum_text]);
	}
}

// send material_image to LineGroup
function SendMaterial_image(day, colum_image, targetID)
{
	for (x = colum_image; x <= ss_material.getLastRow(); x++)
	{
		if (ss_material_data[day][x] != "")
		{
			Logger.log(ss_material_data[day][x]);
			pushImage(CHANNEL_ACCESS_TOKEN, targetID, ss_material_data[day][x], ss_material_data[day][x]);
		}
	}
}

// send material_video to LineGroup
function SendMaterial_video(day, colum_video, targetID)
{
	if (ss_material_data[day][colum_video] != "" && ss_material_data[day][colum_video+1] != "")
	{
		Logger.log(ss_material_data[day][colum_video]);
		Logger.log(ss_material_data[day][colum_video+1]);
		pushVideo(CHANNEL_ACCESS_TOKEN, targetID, ss_material_data[day][colum_video], ss_material_data[day][colum_video+1]);
	}
}

//判斷使用者回答到第幾題
function getUserAnswer(groupID, clientMessage) {
  var returnData = [];

  for (var i = 0; i < lastRow; i++) {
    if (sheetData[i][0] == groupID && sheetData[i][lastColumn - 1] != "") {
      Logger.log('ignore to regist groupID(%s) due to it has regist before at row(%d)', groupID, i)
      return;
    }

    if (sheetData[i][0] == groupID && sheetData[i][lastColumn - 1] == "") {
      // 先嘗試找到空的欄位
      for (var j = 1; j <= lastColumn -1; j++) {
        if (sheetData[i][j] == "") {break;}
      }
      // 把前一個動作回傳的值 填入空欄位
      sheet.getRange(i + 1, j + 1).setValue(clientMessage);
      //如果使用者已經回答了觸發時間(Colum C的問題)，就把完成時間填上。不然就送出下一題給使用者
      if (j + 4 == lastColumn) {
        returnData = [i + 1, 0];
      }
      else {
        returnData = [i + 1, j + 2];
      }
      return returnData;
      break;
    }
  }
  //如果使用者還沒有回答過任何資料，就新增加一列在最後，把使用者ID輸入並開始送出題目
  sheet.insertRowAfter(lastRow);
  sheet.getRange(lastRow + 1, 1).setValue(groupID);
  returnData = [lastRow + 1, 2];
  return returnData;
}

//把試算表內的啟動時間轉換成正確的時間格式
function alarmTimeConvert(dateData, timeData) {
  var alarmTime = new Date ((+new Date(dateData)) + (+new Date(timeData)) - (+new Date('1899/12/30 00:00:00'))) ;
  return alarmTime;
}

//把「是否提醒」數值調成0
function disableAutoPost(groupID, sheetID) {
  for (var i = 2; i < lastRow; i++) {
    if (sheetData[i][0] == groupID && sheetData[i][4] == 1) {
      sheet.getRange(i + 1, 5).setValue('0');
    }
  }
}

//取得需要發送的訊息
function broadcastMaterial() {
  var TimeNow = new Date();
  var pushContents = [];
  var j = 0;
  for (var i = 2; i < lastRow; i++) {
    if (sheetData[i][4] === 0) {
      var startTime = alarmTimeConvert(sheetData[i][1], sheetData[i][2]);
      var endTime = alarmTimeConvert(sheetData[i][1], sheetData[i][6]);
      if (startTime < TimeNow && TimeNow < endTime) {
        pushContents[j] = [sheetData[i][0], sheetData[i][3]];
        j++;
      }
    }
  }
  if (pushContents.length != 0) {
    for (var i = 0; i < 1; i++) {
      for (var j = 0; j < pushContents.length; j++) {
        pushMessage(CHANNEL_ACCESS_TOKEN, pushContents[j][0], pushContents[j][1]);
      }
      Utilities.sleep(1000);
    }
  }
}

//取得需要發送的訊息
function getAlarmData() {
  var TimeNow = new Date();
  var pushContents = [];
  var j = 0;
  for (var i = 2; i < lastRow; i++) {
    if (sheetData[i][4] === 0) {
      var startTime = alarmTimeConvert(sheetData[i][1], sheetData[i][2]);
      var endTime = alarmTimeConvert(sheetData[i][1], sheetData[i][6]);
      if (startTime < TimeNow && TimeNow < endTime) {
        pushContents[j] = [sheetData[i][0], sheetData[i][3]];
        j++;
      }
    }
  }
  if (pushContents.length != 0) {
    for (var i = 0; i < 1; i++) {
      for (var j = 0; j < pushContents.length; j++) {
        pushMessage(CHANNEL_ACCESS_TOKEN, pushContents[j][0], pushContents[j][1]);
      }
      Utilities.sleep(1000);
    }
  }
}

//回送 Line Bot 訊息給使用者
function sendReplyMessage(CHANNEL_ACCESS_TOKEN, replyToken, replyMessage) {
  var url = 'https://api.line.me/v2/bot/message/reply';
  UrlFetchApp.fetch(url, {
    'headers': {
      'Content-Type': 'application/json; charset=UTF-8',
      'Authorization': 'Bearer ' + CHANNEL_ACCESS_TOKEN,
    },
    'method': 'post',
    'payload': JSON.stringify({
      'replyToken': replyToken,
      'messages': [{
        'type': 'text',
        'text':replyMessage,
      }],
    }),
  });
}

//分析確認按鈕按下的時機
function checkConfirmData(CHANNEL_ACCESS_TOKEN, groupID, clientMessage, replyToken) {
  var returnData = [];
  for (var i = lastRow - 1; i >= 0; i--) {
    if (sheetData[i][0] == groupID && sheetData[i][lastColumn - 4] != "" && sheetData[i][lastColumn - 1] == "") {
      if (clientMessage == "DecideConfirm") {
        sheet.getRange(i + 1, lastColumn - 1).setValue(1);
        sheet.getRange(i + 1, lastColumn).setValue(Date());
        returnData = [i + 1, 1];
      }
      else if (clientMessage == "DecideCancel"){
        returnData = [i + 1, -1];
        sheet.deleteRow(i + 1);
      }
      return returnData;
      break;
    }
  }
  //使用者亂按舊的確認或刪除按鈕時的處理方式
  returnData = [1, -2];
  return returnData;
}

//傳送選擇日期按鈕給使用者（使用 Line Template datetimepicker）
function sendDateMessage(CHANNEL_ACCESS_TOKEN, replyToken, replyMessage) {
  var dt = new Date();
  UrlFetchApp.fetch("https://api.line.me/v2/bot/message/reply", {
    "headers": {
      "Content-Type": "application/json; charset=UTF-8",
      "Authorization": "Bearer " + CHANNEL_ACCESS_TOKEN,
    },
    "method": "post",
    "payload": JSON.stringify({
      "replyToken": replyToken,
      "messages": [{
        "type": "template",
        "altText": replyMessage,
        "template": {
          "type": "buttons",
          "text": replyMessage,
          "actions": [
            {
              "type":"datetimepicker",
              "label":"點選並輸入提醒日期",
              "data":"DateMessage",
              "mode":"date",
            }
          ]
        }
      }],
    }),
  });
}

//傳送選擇時間按鈕給使用者（使用 Line Template datetimepicker）
function sendTimeMessage(CHANNEL_ACCESS_TOKEN, replyToken, replyMessage) {
  var dt = new Date();
  UrlFetchApp.fetch("https://api.line.me/v2/bot/message/reply", {
    "headers": {
      "Content-Type": "application/json; charset=UTF-8",
      "Authorization": "Bearer " + CHANNEL_ACCESS_TOKEN,
    },
    "method": "post",
    "payload": JSON.stringify({
      "replyToken": replyToken,
      "messages": [{
        "type": "template",
        "altText": replyMessage,
        "template": {
          "type": "buttons",
          "text": replyMessage,
          "actions": [
            {
              "type":"datetimepicker",
              "label":"點選並輸入提醒時間",
              "data":"TimeMessage",
              "mode":"time",
            }
          ]
        }
      }],
    }),
  });
}

//傳送確認按鈕給使用者（使用 Line Template Confirm）
function sendConfirmMessage(CHANNEL_ACCESS_TOKEN, replyToken, replyMessage) {

  UrlFetchApp.fetch("https://api.line.me/v2/bot/message/reply", {
    "headers": {
      "Content-Type": "application/json; charset=UTF-8",
      "Authorization": "Bearer " + CHANNEL_ACCESS_TOKEN,
    },
    "method": "post",
    "payload": JSON.stringify({
      "replyToken": replyToken,
      "messages": [{
        "type": "template",
        "altText": replyMessage,
        "template": {
          "type": "confirm",
          "text": replyMessage,
          "actions": [
            {
              "type": "postback",
              "label": "確認",
              "data": "DecideConfirm"
            },
            {
              "type": "postback",
              "label": "取消",
              "data": "DecideCancel"
            }
          ]
        }
      }],
    }),
  });
}
//new for image part
//程式碼開始

function getImageDatafromGoogleDrive() {
  var token = "V9HeRF7Ov7B2/Rpkvy3divGBDq1xAsN0ff7iaIvbWtg+zJezUmsGC1msld09T34b631elijkjjZWd/kU/gpA18bDPAZ/UJZI6e56B7naZPj3ntkcjyIUcDIKdyh6UVjEI9xsYlP9fn55OF3GPrwRxAdB04t89/1O/w1cDnyilFU=";
  var imageId = "1jGcxNDCZhMYPSkF6TWq6uAlmKJTCVcbI";

  var message = " ";
  var blob = DriveApp.getFileById(imageId).getBlob();
  var boundary = "Boris Lu @ http://www.youtube.com/c/borispcp";
  var imageData = Utilities.newBlob(
      "--" + boundary + "\r\n"
      + "Content-Disposition: form-data; name=\"message\"; \r\n\r\n" + message + "\r\n"
      + "--" + boundary + "\r\n"
      + "Content-Disposition: form-data; name=\"imageFile\"; filename=\"" + blob.getName() + "\"\r\n"
      + "Content-Type: " + blob.getContentType() +"\r\n\r\n"
      ).getBytes();
  imageData = imageData.concat(blob.getBytes());
  imageData = imageData.concat(Utilities.newBlob("\r\n--" + boundary + "--\r\n").getBytes());
  sendImagetoLineNotify(imageData, token, boundary);
}
//程式碼結束