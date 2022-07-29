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
var CHANNEL_ACCESS_TOKEN_LINENOTIFY 	= ss_GroupDB_data[0][5].replace(/\r?\n|\r/g, ""); //F2, line notify token	，並消除換行符號（避免有人複製貼上時複製到換行符號）

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


//接收使用者訊息
function doPost(e) {
	var userData = JSON.parse(e.postData.contents);
	console.log(userData);

	// 取出 replayToken 和發送的訊息文字
	var replyToken = userData.events[0].replyToken;
	var groupID = userData.events[0].source.groupId;

	Logger.log(CHANNEL_ACCESS_TOKEN);
	Logger.log(sheetID);
	checkGroup(groupID);
	var Today = new Date;
	var Today_date = Today.getDate();
	var Today_Month = Today.getMonth()+1;

	var clientMessage_DAY = userData.events[0].message.text;
	// passive reply
	SendReplyMaterial_video(clientMessage_DAY, columVideo, replyToken);
	//SendReplyMaterial_video(Today_date, columVideo, replyToken);
}

function checkGroup(groupID) {
  for (var i = 0; i < ss_GroupDB.getLastRow(); i++) {
    if (ss_GroupDB_data[i][0] == groupID && ss_GroupDB_data[i][1] !="") {
      Logger.log('ignore to regist groupID(%s) due to it has regist before at row(%d)', groupID, i)
      return;
    }
  }
	// 如果群組未註冊過
	// 註冊群組ID
	ss_GroupDB.insertRowAfter(ss_GroupDB.getLastRow());
	ss_GroupDB.getRange(ss_GroupDB.getLastRow() + 1, 1).setValue(groupID);

	var now = new Date();
	var nowDate = now.getDate();
	var nowMonth = now.getMonth()+1;

	ss_GroupDB.getRange(ss_GroupDB.getLastRow(), 2).setValue(1);			// enable 
	ss_GroupDB.getRange(ss_GroupDB.getLastRow(), 3).setValue(nowMonth+1);	// 開始月份
	ss_GroupDB.getRange(ss_GroupDB.getLastRow(), 4).setValue(nowMonth+2);	// 結束月份
	ss_GroupDB.getRange(ss_GroupDB.getLastRow(), 7).setValue(nowMonth+"/"+nowDate);		// 註冊時間
}

//把「是否提醒」數值調成0
function disableAutoPost(groupID, sheetID) {
  for (var i = 2; i < lastRow; i++) {
    if (sheetData[i][0] == groupID && sheetData[i][4] == 1) {
      sheet.getRange(i + 1, 5).setValue('0');
    }
  }
}

function TimerNotify() {
	// colum C = StartDate, Colum E = StartTime
	//var hd = new Date ((+new Date(ss_GroupDB_data[0][2])) + (+new Date(ss_GroupDB_data[0][4])) - (+new Date('1899/12/30 00:00:00'))).valueOf() ;

	var Today = new Date;
	var Today_date = Today.getDate();

	SendNotifyMaterial_txt(Today_date, columText);
	SendNotifyMaterial_image(Today_date, columImage);
}
//程式碼結束