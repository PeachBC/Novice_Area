//主動傳送 Line Bot 訊息給使用者
function pushMessage(CHANNEL_ACCESS_TOKEN, userID, pushContent) {
  var url = 'https://api.line.me/v2/bot/message/push';
  UrlFetchApp.fetch(url, {
    'headers': {
      'Content-Type': 'application/json; charset=UTF-8',
      'Authorization': 'Bearer ' + CHANNEL_ACCESS_TOKEN,
    },
    'method': 'post',
    'payload': JSON.stringify({
      'to': userID,
      'messages': [{
        'type': 'text',
        'text':pushContent,
      }],
    }),
  });
}

//主動傳送 Line Bot image給使用者
function pushImage(CHANNEL_ACCESS_TOKEN, targetID, imageURL, thumbnailURL) {
  var url = 'https://api.line.me/v2/bot/message/push';
  UrlFetchApp.fetch(url, {
    'headers': {
      'Content-Type': 'application/json; charset=UTF-8',
      'Authorization': 'Bearer ' + CHANNEL_ACCESS_TOKEN,
    },
    'method': 'post',
    'payload': JSON.stringify({
      'to': targetID,
      'messages': [{
		'type': 'image',
		'originalContentUrl': imageURL, // 圖片網址
		'previewImageUrl': thumbnailURL //縮圖網址
      }],
    }),
  });
}

//主動傳送 Line Bot video給使用者
function pushVideo(CHANNEL_ACCESS_TOKEN, targetID, videoURL, thumbnailURL) {
  var url = 'https://api.line.me/v2/bot/message/push';
  UrlFetchApp.fetch(url, {
    'headers': {
      'Content-Type': 'application/json; charset=UTF-8',
      'Authorization': 'Bearer ' + CHANNEL_ACCESS_TOKEN,
    },
    'method': 'post',
    'payload': JSON.stringify({
      'to': targetID,
      'messages': [{
        'type': 'video',
		'originalContentUrl': videoURL, // 影片網址
		'previewImageUrl': thumbnailURL //縮圖網址
      }],
    }),
  });
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

//回送 Line Bot 訊息給使用者
function sendReplyImage(CHANNEL_ACCESS_TOKEN, replyToken, imageURL, thumbnailURL) {
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
		'type': 'image',
		'originalContentUrl': imageURL, // 圖片網址
		'previewImageUrl': thumbnailURL //縮圖網址
      }],
    }),
  });
}

//回送 Line Bot 訊息給使用者
function sendReplyVideo(CHANNEL_ACCESS_TOKEN, replyToken, videoURL, thumbnailURL) {
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
        'type': 'video',
		'originalContentUrl': videoURL, // 影片網址
		'previewImageUrl': thumbnailURL //縮圖網址
      }],
    }),
  });
}

// send material_txt to LineGroup
function SendReplyMaterial_txt(day, colum_text, replyToken)
{
	if (ss_material_data[day][colum_text] != "")
	{
		Logger.log(ss_material_data[day][colum_text]);
		sendReplyMessage(CHANNEL_ACCESS_TOKEN, replyToken, ss_material_data[day][colum_text]);
	}
}

// send material_image to LineGroup
function SendReplyMaterial_image(day, colum_image, replyToken)
{
	for (x = colum_image; x <= ss_material.getLastRow(); x++)
	{
		if (ss_material_data[day][x] != "")
		{
			Logger.log(ss_material_data[day][x]);
			sendReplyImage(CHANNEL_ACCESS_TOKEN, replyToken, ss_material_data[day][x], ss_material_data[day][x]);
		}
	}
}

// send material_video to LineGroup
function SendReplyMaterial_video(day, colum_video, replyToken)
{
	if (ss_material_data[day][colum_video] != "" && ss_material_data[day][colum_video+1] != "")
	{
		Logger.log(ss_material_data[day][colum_video]);
		Logger.log(ss_material_data[day][colum_video+1]);
		sendReplyVideo(CHANNEL_ACCESS_TOKEN, replyToken, ss_material_data[day][colum_video], ss_material_data[day][colum_video+1]);
	}
}

//回送 Line Bot 訊息給使用者
function sendNotifyMessage(CHANNEL_ACCESS_TOKEN, replyMessage) {
  var url = 'https://notify-api.line.me/api/notify';
  UrlFetchApp.fetch(url, {
    'headers': {'Authorization': 'Bearer ' + CHANNEL_ACCESS_TOKEN},
    'method': 'post',
    'payload':{'message': replyMessage},
  });
}

//回送 Line Bot 訊息給使用者
function sendNotifyImage(CHANNEL_ACCESS_TOKEN, imageURL, thumbnailURL) {
  var url = 'https://notify-api.line.me/api/notify';
  UrlFetchApp.fetch(url, {
    'headers': {'Authorization': 'Bearer ' + CHANNEL_ACCESS_TOKEN},
    'method': 'post',
    'payload': {
		'message': ' ',
		'imageFullsize': imageURL,
		'imageThumbnail':thumbnailURL,
		},
  });
}

// send material_txt to LineGroup
function SendNotifyMaterial_txt(day, colum_text, notifytoken)
{
	if (ss_material_data[day][colum_text] != "")
	{
		Logger.log(ss_material_data[day][colum_text]);
		sendNotifyMessage(notifytoken, "\n"+ss_material_data[day][colum_text]);
	}
}

// send material_image to LineGroup
function SendNotifyMaterial_image(day, colum_image, notifytoken)
{
	for (x = colum_image; x <= ss_material.getLastRow() && ss_material_data[day][x] != ""; x++)
	{
		if (ss_material_data[day][x] != "")
		{
			Logger.log(ss_material_data[day][x]);
			sendNotifyImage(notifytoken, ss_material_data[day][x], ss_material_data[day][x]);
		}
	}
}

// 判斷日期
function checkHW_day(string)
{
  // 判斷是否有日期資訊
  var KeyWordHW_len = KeyWordHW.length;
  var retValue = string.toLowerCase().search(KeyWordHW);
  if(retValue < 0)
  {
    Logger.log("Not Match, return");
    return retValue;
  }
  else
  {
    Logger.log ("keyword match from : "+retValue);
    var data_2 = string.slice(retValue+KeyWordHW_len+1,retValue+KeyWordHW_len+2); // 判斷第二個字 是不是數字。進而判斷是 幾位數
    Logger.log ("data_2: "+data_2);
    if(data_2>=0 && data_2 <=9) // 2位數
    {
      var data_1 = string.slice(retValue+KeyWordHW_len,retValue+KeyWordHW_len+2);
      Logger.log ("兩位數, data_1: "+data_1);
    }
    else //一位數
    {
      var data_1 = string.slice(retValue+KeyWordHW_len,retValue+KeyWordHW_len+1);
      Logger.log ("一位數, data_1: "+data_1);
    }
    if (0 < data_1 && data_1 < 31) //介於0~31之間
    {
      return data_1;
    }
    else
    {
      return -1;
    }
  }
}

// send Learning_txt to LineGroup
function SendNotifyLearning_txt(day, colum_text, notifytoken)
{
	if (ss_learning_data[day][colum_text] != "")
	{
		Logger.log(ss_learning_data[day][colum_text]);
		sendNotifyMessage(notifytoken, "\n"+ss_learning_data[day][colum_text]);
	}
}