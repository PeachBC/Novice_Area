function testPrint()
{
    Logger.log(CHANNEL_ACCESS_TOKEN);
    Logger.log(sheetID);

	// hard code for test
	var day = 0; //y = day

	SendMaterial_txt(day, columText, 0);
	SendMaterial_video(day, columVideo, 0);
	SendMaterial_image(day, columImage, 0);
}