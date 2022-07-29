//程式碼開始
var SS 						= SpreadsheetApp.getActive();

// load data from tab> config
var ss_config 				= SS.getSheetByName("config");
var ss_config_data 			= ss_config.getSheetValues(2, 2, 20, 2); //B2~B20
var CHANNEL_ACCESS_TOKEN 	= ss_config_data[0][0].replace(/\r?\n|\r/g, ""); //line bot token	，並消除換行符號（避免有人複製貼上時複製到換行符號）

var sheetID 				= ss_config_data[1][0]; // google sheet ID

// load data from tab: material
var ss_material 			= SS.getSheetByName("material");
var ss_material_data 		= ss_material.getSheetValues(2, 1, 63, 26); //A2~Z63
var columText	= 1; // text is on colum B
var columVideo	= 2; // video is on colum C
var columImage	= 4; // image/slide is start from colum E

// load data from tab: GroupDB
var ss_GroupDB 				= SS.getSheetByName("GroupDB");
var ss_GroupDB_data 		= ss_GroupDB.getSheetValues(2, 1, 51, 70); //A2~70,51, max support group count = 50
var CHANNEL_ACCESS_TOKEN_LINENOTIFY 	= ss_GroupDB_data[0][5].replace(/\r?\n|\r/g, ""); //F2, line notify token	，並消除換行符號（避免有人複製貼上時複製到換行符號）
var columGroupID	= 0; // GroupID is on colum A
var columEnable		= 1; // text is on colum B
var columStartMonth	= 2; // startMonth is on Colum C
var columEndMonth	= 3; // EndMonth is on Colum D
var columnotifyToken= 5; // notifyToken is on Colum F
var columRegistTime	= 6; // RegistTime is on colum G

var ColumRecord		= 8; // 紀錄 開始的欄位, colum H
var secondRoundBase	= 31;

var keyWord1 = "大家早安";    //關鍵字
var keyWord2 = "大家午安";    //關鍵字
var keyWord_regist = ".";    //關鍵字


//接收使用者訊息
function doPost(e) {
	var userData = JSON.parse(e.postData.contents);

	// 取出 replayToken
	var replyToken = userData.events[0].replyToken;
	var groupID = userData.events[0].source.groupId;

	var Today = new Date;
	var Today_date = Today.getDate();
	var Today_Month = Today.getMonth()+1;
	var DateBase = 0;

	// 確認關鍵字
	var clientMessage = userData.events[0].message.text;
	if (clientMessage.toLowerCase() != keyWord1.toLowerCase() && clientMessage.toLowerCase() != keyWord2.toLowerCase() && clientMessage.toLowerCase() != keyWord_regist.toLowerCase())
	{
		// ignore;
		return;
	}

	// check which group is trigger bot
	var groupRow = checkGroup(groupID);

	// keyWord_regist 註冊用 for notify token
	if (clientMessage.toLowerCase() == keyWord_regist.toLowerCase())
	{
		// just for regist;
		return;
	}

	if (Today_date > 30)
	{
        Logger.log(Today_date + " is out of range.");
		return;
	}

	// 確認 是否enable 且 有token
	if (ss_GroupDB_data[groupRow][columEnable] != 1 || ss_GroupDB_data[groupRow][columnotifyToken] =="")
	{
		Logger.log("disable");
		return;
	}

	// 判斷 要發哪天文章
	if (Today_Month == ss_GroupDB_data[groupRow][columStartMonth])
	{
		DateBase = 0;
	}
	else if (Today_Month == ss_GroupDB_data[groupRow][columEndMonth])
	{
		DateBase = secondRoundBase;
	}
	else
	{
		Logger.log(Today_Month+" is not in the range between"+ ss_GroupDB_data[groupRow][columStartMonth]+" to "+ss_GroupDB_data[groupRow][columEndMonth]);
		return;
	}

	var Day = Today_date + DateBase;

	//例外處理 for day 1 (if 大家早安, 發 day 0文章)
	if (Day == 1 && clientMessage.toLowerCase() == keyWord1.toLowerCase())
	{
		Day = 0;
	}

	var dayinfo = Day + ColumRecord;

	// 判斷是否發過文
	if (ss_GroupDB_data[groupRow][dayinfo-1] != "")
	{
		Logger.log("已發過文");
		return;
	}
	// 發文
	//SendReplyMaterial_txt(Day, columText, replyToken);
	SendReplyMaterial_video(Day, columVideo, replyToken);

	// 發文後 做紀錄
	ss_GroupDB.getRange(groupRow+2, dayinfo).setValue(1);
}

function checkGroup(groupID) {
  for (var i = 0; i < ss_GroupDB.getLastRow(); i++) {
    if (ss_GroupDB_data[i][columGroupID] == groupID && ss_GroupDB_data[i][columRegistTime] !="") {
      Logger.log('ignore to regist groupID(%s) due to it has regist before at row(%d)', groupID, i)
      return i;
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
	return ss_GroupDB.getLastRow();
}

function CheckAndNotify()
{
	var Today = new Date;
	var Today_date = Today.getDate();
	var Today_Month = Today.getMonth()+1;

	Logger.log(Today_date + "= Today_date.");

	if (Today_date > 30)
	{
		Logger.log(Today_date + " is out of range.");
		return;
	}
	for (var i = 0; i < ss_GroupDB.getLastRow()-1; i++)
	{
		// 確認 有enable 且 有token
		if (ss_GroupDB_data[i][columEnable] == 1 && ss_GroupDB_data[i][columnotifyToken] !="")
		{
			// 判斷 要發哪天文章
			if (Today_Month == ss_GroupDB_data[i][columStartMonth])
			{
				DateBase = 0;
			}
			else if (Today_Month == ss_GroupDB_data[i][columEndMonth])
			{
				DateBase = secondRoundBase;
			}
			else
			{
				Logger.log(Today_Month+" is not in the range between"+ ss_GroupDB_data[i][columStartMonth]+" to "+ss_GroupDB_data[i][columEndMonth]);
				continue;
			}
			var Day = Today_date + DateBase;
			
			var dayinfo = Day + ColumRecord;

			if (ss_GroupDB_data[i][dayinfo-1] == 1)
			{
				Logger.log("已發過影片 > 發文");
				SendNotifyMaterial_txt(Day, columText, ss_GroupDB_data[i][columnotifyToken]);
				SendNotifyMaterial_image(Day, columImage, ss_GroupDB_data[i][columnotifyToken]);

				ss_GroupDB.getRange(i+2, dayinfo).setValue(2);
			}
			else
			{
				Logger.log("已發過/未發過影片 跟 文字 & 圖片. Day:"+Day);
			}

			//例外處理 for day 1 (if 大家早安, 發 day 0文章)
			if (Day == 1)
			{
				Day = 0;
				dayinfo = Day + ColumRecord;

				if (ss_GroupDB_data[i][dayinfo-1] == 1)
				{
					Logger.log("已發過影片 > 發文");
					SendNotifyMaterial_txt(Day, columText, ss_GroupDB_data[i][columnotifyToken]);
					SendNotifyMaterial_image(Day, columImage, ss_GroupDB_data[i][columnotifyToken]);

					ss_GroupDB.getRange(i+2, dayinfo).setValue(2);
				}
				else
				{
					Logger.log("已發過/未發過影片 跟 文字 & 圖片. Day:"+Day);
				}
			}

		}
		else
		{
			Logger.log("Row:"+ i +" "+ ss_GroupDB_data[i][columEnable] + " " + ss_GroupDB_data[i][columnotifyToken]+ ", disable or no token");
		}
	}
}
//程式碼結束