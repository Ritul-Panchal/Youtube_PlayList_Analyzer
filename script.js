// a.  Name of the playlist, views
// b. Total No of views : 
// c. Actual views :
// d. Total No of videos : 279
// Average length of video : 24 minutes, 31 seconds
// Total length of playlist : 4 days, 18 hours, 2 minutes, 27 seconds
// At 1.25x : 3 days, 19 hours, 13 minutes, 57 seconds
// At 1.50x : 3 days, 4 hours, 1 minute, 38 seconds
// At 1.75x : 2 days, 17 hours, 9 minutes, 58 seconds
// At 2.00x : 2 days, 9 hours, 1 minute, 13 seconds

// console.table => video name, number, length

const puppy = require("puppeteer");
(async function openBrowser() {
    const browser = await puppy.launch({
        headless : false,
        defaultViewport : false,
        args : [
            "--start-maximized"
        ]
    })


    let page = await browser.newPage();
    page.goto("https://www.youtube.com/playlist?list=PLzkuLC6Yvumv_Rd5apfPRWEcjf9b1JRnq");
    await page.waitForSelector('#title .yt-simple-endpoint.style-scope.yt-formatted-string');
    let element = await page.$('#title .yt-simple-endpoint.style-scope.yt-formatted-string');
    let value = await page.evaluate(el => el.textContent, element);
    console.log("Name of the playlist : " + value);
    await page.waitForSelector(".style-scope.ytd-playlist-sidebar-primary-info-renderer .style-scope.yt-formatted-string");
    let barList = await page.$$('.style-scope.ytd-playlist-sidebar-primary-info-renderer .style-scope.yt-formatted-string');
    let totalVideos = await page.evaluate(el => el.textContent, barList[1]);
    console.log("Total number of videos : " + totalVideos + " videos");
    await page.waitForSelector('.style-scope.ytd-playlist-sidebar-primary-info-renderer');
    let viewsList = await page.$$('.style-scope.ytd-playlist-sidebar-primary-info-renderer');
    let totalViews = await page.evaluate(el => el.textContent, viewsList[6]);
    console.log("Total views : " + totalViews);

    let loopCount = Math.floor(totalVideos / 100);
    for (let i = 0; i < loopCount; i++){
        await page.waitForSelector(".circle.style-scope.tp-yt-paper-spinner");
        await page.click(".circle.style-scope.tp-yt-paper-spinner");
        await waitTillHTMLRendered(page);
        console.log("loaded teh new videos");
    }



    await page.waitForSelector("a[id = 'video-title']");
    let videoNameList = await page.$$("a[id = 'video-title']");
    let timeList = await page.$$('span[id = "text"]');

    videoArr = [];
    for (let i = 0; i < timeList.length; i++){
        let data = await page.evaluate((el1, el2) => {
            return {
                videoName : el1.textContent.trim(),
                time : el2.textContent.trim()
            }
        }, videoNameList[i], timeList[i]);

        videoArr.push(data);
    }

    console.table(videoArr);

})();


const waitTillHTMLRendered = async (page, timeout = 30000) => {
    const checkDurationMsecs = 1000;
    const maxChecks = timeout / checkDurationMsecs;
    let lastHTMLSize = 0;
    let checkCounts = 1;
    let countStableSizeIterations = 0;
    const minStableSizeIterations = 3;
  
    while(checkCounts++ <= maxChecks){
      let html = await page.content();
      let currentHTMLSize = html.length; 
  
      let bodyHTMLSize = await page.evaluate(() => document.body.innerHTML.length);
  
      console.log('last: ', lastHTMLSize, ' <> curr: ', currentHTMLSize, " body html size: ", bodyHTMLSize);
  
      if(lastHTMLSize != 0 && currentHTMLSize == lastHTMLSize) 
        countStableSizeIterations++;
      else 
        countStableSizeIterations = 0; //reset the counter
  
      if(countStableSizeIterations >= minStableSizeIterations) {
        console.log("Page rendered fully..");
        break;
      }
  
      lastHTMLSize = currentHTMLSize;
      await page.waitFor(checkDurationMsecs);
    }  
  };