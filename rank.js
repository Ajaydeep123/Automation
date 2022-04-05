const puppeteer = require("puppeteer");
let email = "asrajay968@gmail.com";
let password = "Ajay968@";
let cTab;
let { answer } = require("./answers");
let browserOPenPromise = puppeteer.launch({
  headless: false,
  defaultViewport: null,
  args: ["--start-maximized"],
//   executablePath: "/path/to/Chrome",
});
browserOPenPromise
//when browserOpenPromise get fulfilled, it returns an instance of browser, which we need to recieve

    .then(function (browser) {
      //we catched the browser instance as a parameter here.
    console.log("Browser is open");

    //.pages -> it returns an array of all the open pages inside the browser.
    let allTabsPromise = browser.pages();
    return allTabsPromise;
})
.then(function(allTabsArr){
  cTab = allTabsArr[0];
  console.log("New Tab");

  //Url to navigate the page to
  let visitingLoginPagePromise = cTab.goto("https://www.hackerrank.com/auth/login");
  return visitingLoginPagePromise;
})
.then(function(){
  console.log("HackerRank login page opened");
  let emailWillBeTypedPromise = cTab.type("input[name='username']", email);
  return emailWillBeTypedPromise;
})
.then(function(){
  console.log("Email is Typed ");
  let passwordWillBeTypedPromise =cTab.type("input[type='password']",password);
  return passwordWillBeTypedPromise;
})
.then(function(){
  console.log("password has been typed");
  let willBeLoggedInPromise = cTab.click(
    ".ui-btn.ui-btn-large.ui-btn-primary.auth-button.ui-btn-styled"
  );
  return willBeLoggedInPromise;
})
.then(function () {
  console.log("logged into hackerrank successfully");
  /* Now that we have logged in the hackerrank successfully, next we want to select our particular
  topic of interest. But, here's the issue~> when the webpage loads there is a lag of around 1 2 seconds and
  as the compiler do not wait for the selector. hence, returning error that node is not found.
  To resolve this issue we create our own promise.
  */
 let algorithmTabWillBeOPenedPromise = waitAndClick( "div[data-automation='algorithms']");
 //unlike promises above, here waitAndClick is not a promise, its a normal function so we need to make it a promise.

 return algorithmTabWillBeOPenedPromise;
})
.then(function(){
  console.log("Algorithms page is opened");
  let allQuesPromise = cTab.waitForSelector( 'a[data-analytics="ChallengeListChallengeName"]');
  return allQuesPromise
})

.then(function(){
  function getAllQuesLinks(){
    let allElemArr = document.querySelectorAll('a[data-analytics="ChallengeListChallengeName"]');
    let linksArr=[];
    for(let i=0;i<allElemArr.length;i++){
      linksArr.push(allElemArr[i].getAttribute('href'));
    }
    return linksArr;
  }
  let linksArrPromise= cTab.evaluate(getAllQuesLinks);
  return linksArrPromise;
})
.then(function(linksArr){
  console.log("links to all the ques received");
  let questionWillBeSolvedPromise = questionSolver(linksArr[0],0);
  for(let i=1;i<linksArr.length;i++){
    questionWillBeSolvedPromise=questionWillBeSolvedPromise.then(function(){
      return questionSolver(linksArr[i],i);
    })
  }
  return questionWillBeSolvedPromise;
})
.then(function(){
  console.log("question is solved");
})
.catch(function (err) {
  console.log(err);
});

function waitAndClick(algobtn){
  let waitClickPromise= new Promise(function(resolve, reject){
    let waitForSelectorPromise = cTab.waitForSelector(algobtn);
    waitForSelectorPromise.then(function () {
      console.log("Algo btn is found");
      let clickPromise = cTab.click(algobtn);
      return clickPromise;  
    })
    .then(function(){
      console.log("Algo btn is clicked");
      resolve();
    })
    .catch(function (err) {
      reject(err);
      
    })
  });
  return waitClickPromise;
}
function questionSolver(url, idx) {
  return new Promise(function (resolve, reject) {
    let fullLink = `https://www.hackerrank.com${url}`;
    let goToQuesPagePromise = cTab.goto(fullLink);
    goToQuesPagePromise
      .then(function () {
        console.log("question opened");
        //tick the custom input box mark
        let waitForCheckBoxAndClickPromise = waitAndClick(".checkbox-input");
        return waitForCheckBoxAndClickPromise;
      })
      .then(function () {
        //select the box where code will be typed
        let waitForTextBoxPromise = cTab.waitForSelector(".custominput");
        return waitForTextBoxPromise;
      })
      .then(function () {
        let codeWillBeTypedPromise = cTab.type(".custominput", answer[idx]);
        return codeWillBeTypedPromise;
      })
      .then(function () {
        //control key is pressed promise
        let controlPressedPromise = cTab.keyboard.down("Control");
        return controlPressedPromise;
      })
      .then(function () {
        let aKeyPressedPromise = cTab.keyboard.press("a");
        return aKeyPressedPromise;
      })
      .then(function () {
        let xKeyPressedPromise = cTab.keyboard.press("x");
        return xKeyPressedPromise;
      })
      .then(function () {
        let ctrlIsReleasedPromise = cTab.keyboard.up("Control");
        return ctrlIsReleasedPromise;
      })
      .then(function () {
        //select the editor promise
        let cursorOnEditorPromise = cTab.click(
          ".monaco-editor.no-user-select.vs"
        );
        return cursorOnEditorPromise;
      })
      .then(function () {
        //control key is pressed promise
        let controlPressedPromise = cTab.keyboard.down("Control");
        return controlPressedPromise;
      })
      .then(function () {
        let aKeyPressedPromise = cTab.keyboard.press("A",{delay:100});
        return aKeyPressedPromise;
      })
      .then(function () {
        let vKeyPressedPromise = cTab.keyboard.press("V",{delay:100});
        return vKeyPressedPromise;
      })
      .then(function () {
        let controlDownPromise = cTab.keyboard.up("Control");
        return controlDownPromise;
      })
      .then(function () {
        let submitButtonClickedPromise = cTab.click(".hr-monaco-submit");
        return submitButtonClickedPromise;
      })
      .then(function () {
        console.log("code submitted successfully");
        resolve();
      })
      .catch(function (err) {
        reject(err);
      });
  });
}