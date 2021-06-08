//Change baseURL before running
const baseURL = "http://localhost:5000";
//Add your facebook appID
const fbAppID = '1391529697889548';

/* ---------------------------------------------------------- */

// Common functions start here

//Create html element for posts data GET from database.
function generatePost(id, postTitle, postContent, likeStr, liked = false, userName = '') {
  //div element
  let div = document.createElement('div');
  div.className = "post" + id; 
  
  //Username of post owner
  if (userName !== '') {
    let user = document.createElement('h3');
    let userText = document.createTextNode(userName + " posted:");
    user.append(userText);
    div.append(user);
  }

  //Post title
  let title = document.createElement('h4');
  let titleText = document.createTextNode(postTitle);
  title.append(titleText);
  div.append(title);

  //Post content
  let content = document.createElement('p');
  let link = document.createElement('a');
  let contentText = document.createTextNode(postContent);
  link.append(contentText);
  link.href = '/postDetailed/' + id;
  link.className = "content";
  content.append(link)
  div.append(content);

  //Like button
  let like = document.createElement('input');
  like.type = 'submit';
  if (liked === false)
    like.value = 'Like';
  else
    like.value = 'Liked'
  like.id = 'likeButton' + id;
  like.onclick = () => {addLike(id);};
  div.append(like);

  //Like string 
  let likeString = document.createElement('p');
  let likeLink = document.createElement('a');
  let likeText = document.createTextNode(likeStr);
  likeLink.append(likeText);
  if (likeStr !== 'No one liked this post yet.')
    likeLink.href = '/likeList/' + id;
  likeLink.className = 'likeStr';
  likeLink.id = 'likeStr' + id;
  likeString.append(likeLink)
  div.append(likeString);

  document.body.append(div);
}

//Function to query all like information of post
function queryLikes(postID) {
  let url = baseURL + '/like/' + postID;
  let request = new XMLHttpRequest();
  request.open('GET', url, false);
  request.send();
  return request.responseText;
}

//Create like string for each post
function generateLikeStr(likes, userName, detailed = false) {
  let likeList = ['You'];
  let you = false;
  for (let i in likes) {
    if (likes[i].userName === userName)
      you = true;
    else
      likeList.push(likes[i].userName);
  }
  if (you === false) 
    likeList.shift();
  
  //Return like string
  if (detailed === false) {
    if (likeList.length === 1) 
      return likeList[0] + ' liked this post.'
    else if (likeList.length === 2)
      return likeList[0] + ', ' + likeList[1] + ' liked this post.'
    else
      return likeList[0] + ', ' + likeList[1] + ', and '+ (likeList.length - 2).toString() + ' other people liked this post.'
  }
  //Return list of people who liked if demanded
  else
    return likeList;
}

//Go back to previous page
function goBack() {
  window.location.replace(document.referrer);
}

//Set new Cookie
function setCookie(cookieName, cookieValue) {
  let d = new Date();
  d.setTime(d.getTime() + (5*24*60*60*1000));
  let expires = "expires=" + d;
  document.cookie = cookieName + "=" + cookieValue + ";" + expires + ";path=/; SameSite=None; Secure";
}

//Get cookie 
function getCookie(cookieName) {
  const cookieValue = document.cookie
    .split('; ')
    .find(row => row.startsWith(cookieName + '='));
  if (cookieValue !== undefined)
    return cookieValue.split("=")[1];
  return "";
}

//Delete Cookie
function deleteCookie(cookieName) {
  let d = new Date()
  d.setTime(d.getTime() - 1)
  let expires = "expires=" + d;
  document.cookie = cookieName + "=;" + expires + ";path=/"
}

//Display text box to type Occupation
function CheckIfOthers(val) {
  let element=document.getElementById('others');
  if (val === 'Others')
    element.style.display = 'inline';
  else  
    element.style.display = 'none';
 }  

//Display info from cookies
function displayInfo() {
  emailElement = document.getElementById('email');
  if (emailElement !== null) {
    emailElement .value = getCookie('email');
    deleteCookie('email');
  }
  document.getElementById('name').value = getCookie('name');
  document.getElementById('phoneNumber').value = getCookie('phoneNumber');
  occupation = document.getElementById('occupation');
  occupationValue = getCookie('occupation');
  if (occupationValue === 'Student' || getCookie('occupation') === 'Teacher')
    occupation.value = occupationValue
  else if (occupationValue !== '' && occupation !== null) {
    occupation.value = 'Others';
    others = document.getElementById('others');
    others.value = occupationValue;
    others.style.display = 'inline';
  }
  deleteCookie('name');
  deleteCookie('phoneNumber');
  deleteCookie('occupation');
}
/* ---------------------------------------------------------- */

//Functions for each html page start here

//Processing data from sign up page
 function signUp() {
  //Getting data from html
  const output = {
    name: '',
    userName: null,
    password: null,
    email: null,
    phoneNumber: '',
    occupation: ''
  }
  other = document.getElementById('others');
  for (let prop in output) {
    element = document.getElementById(prop);
    if (prop !== "occupation") {
      if (element.value !== '')
        output[prop] = element.value;
    }
    else if (element.value !== "Others")
      output[prop] = element.value;
    else if (other.value !== "Others" && other.value !== "")
      output[prop] = other.value ;
  }
  myJson = JSON.stringify(output);
  //Calling api to put new account info to database
  url = baseURL + '/account';
  let request = new XMLHttpRequest();
  request.open('PUT', url, true);
  request.setRequestHeader('Content-type','application/json; charset=utf-8');
  request.onload = function () {
    let account = JSON.parse(request.responseText);
    if (request.readyState == 4 && request.status == "201") {
      window.alert("Account created");
      window.location.href = "/login";
    } else {
      if (typeof account.message !== 'object')
        window.alert(account.message);
      else {
        for (let prop in account.message)
          window.alert(account.message[prop]);
      }
    }
  }
  request.send(myJson);
}

//Processing data in log in page
function logIn() {
  //Take username and password from html input
  const input = {
    userName: '',
    password: ''
  }
  for (let prop in input) {
    element = document.getElementById(prop);
    input[prop] = element.value;
  }
  //Call api to check if username and password are correct
  url = baseURL +'/account/' + input.userName;
  let request = new XMLHttpRequest();
  request.open('GET', url, true);
  request.setRequestHeader('Content-type','application/json; charset=utf-8');
  request.onload = function () {
    let account = JSON.parse(request.responseText);
    if (request.readyState == 4 && request.status == "200") {
      if (account.password === input.password) {
        //If username and password are correct
        setCookie("userName", account.userName);
        setCookie("id", account.id);
        let updateInfoNeeded = false;
        for (let prop in account) {
          if (prop === 'name' || prop === 'phoneNumber' || prop === 'occupation')
            setCookie(prop, account[prop]);
            if (account[prop] === '' || account[prop] === null)
              updateInfoNeeded = true;
        }
        if (updateInfoNeeded === true)
          window.location.href = '/updateInfo';
        else
          window.location.href = '/home';
      } else
          //If username or password is wrong
          window.alert("Wrong password!")
    } else {
      //Errors handling
      if (typeof account.message !== 'object')
        window.alert(account.message);
      else {
        for (let prop in account.message)
          window.alert(account.message[prop]);
      }
    }
  }
  request.send();
}

//Proccessing data for home page
function home() {
  //Calling api to render posts
  userName = getCookie('userName')
  document.title = userName + "'s homepage";
  url = baseURL + '/post';
  let request = new XMLHttpRequest();
  request.open('GET', url, true);
  request.setRequestHeader('Content-type','application/json; charset=utf-8');
  request.onload = function () {
    let posts = JSON.parse(request.responseText);
    if (request.readyState == 4 && request.status == "200") {
      //Render posts
      for (let i in posts) {
        let likes = JSON.parse(queryLikes(posts[i].id));
        let newLikeStr = "No one liked this post yet."
        if (likes.length !== undefined) {
          newLikeStr = generateLikeStr(likes, userName);
        }
        generatePost(posts[i].id, posts[i].title, posts[i].content, newLikeStr, newLikeStr.includes("You"), posts[i].userName);
      }
    } else {
      //Errors handling
      if (typeof posts.message !== 'object')
        window.alert(posts.message);
      else{
        for (let prop in posts.message)
          window.alert(post.message[prop]);
      }
    }
  }
  request.send();
}

//Processing data for wall page
function wall() {
  //Calling api
  userName = getCookie('userName')
  document.title = userName + "'s personal page";
  url = baseURL + '/post/' + userName;
  let request = new XMLHttpRequest();
  request.open('GET', url, true);
  request.setRequestHeader('Content-type','application/json; charset=utf-8');
  request.onload = function () {
    let posts = JSON.parse(request.responseText);
    if (request.readyState == 4 && request.status == "200") {
      for (let i in posts) {
        //Render post
        let likes = JSON.parse(queryLikes(posts[i].id));
        let newLikeStr = "No one liked this post yet."
        if (likes.length !== undefined) {
          newLikeStr = generateLikeStr(likes, userName);
        }
        generatePost(posts[i].id, posts[i].title, posts[i].content, newLikeStr, newLikeStr.includes("You"));
      }
    } else {
      //Errors handling
      if (typeof posts.message !== 'object')
        window.alert(posts.message);
      else{
        for (let prop in posts.message)
          window.alert(post.message[prop]);
      }
    }
  }
  request.send();
}

//Processing data for create post page
function createPost() {
  //Getting input from html
  const output = {
    userName: getCookie('userName'),
    accID: getCookie('id'),
    title: null,
    content: null
  }
  postTitle = document.getElementById('title').value;
  postContent = document.getElementById('content').value;
  if (postTitle !== '') 
    output.title = postTitle
  if (postContent !== '') 
    output.content = postContent

  myJson = JSON.stringify(output);
  //Calling api to put post data
  url = baseURL + '/post';
  let request = new XMLHttpRequest();
  request.open('PUT', url, true);
  request.setRequestHeader('Content-type','application/json; charset=utf-8');
  request.onload = function () {
    //Post rendering and Errors handling
    let post = JSON.parse(request.responseText);
    if (request.readyState == 4 && request.status == "201") {
      window.alert('Posted!');
      window.location.replace(document.referrer);
    } else {
      if (typeof post.message !== 'object')
        window.alert(post.message);
      else{
        for (let prop in post.message)
          window.alert(post.message[prop]);
      }
    }
  }
  request.send(myJson);
}

//Full post page
function postDetailed() {
  let postID = window.location.href.split('/').pop();
  url = baseURL + '/post/' + postID;
  //Call api to get full post
  let request = new XMLHttpRequest();
  request.open('GET', url, true);
  request.setRequestHeader('Content-type','application/json; charset=utf-8');
  request.onload = function () {
    let post = JSON.parse(request.responseText);
    if (request.readyState == 4 && request.status == "200") {
      let likes = JSON.parse(queryLikes(post.id));
      let newLikeStr = "No one liked this post yet."
      if (likes.length !== undefined) {
        newLikeStr = generateLikeStr(likes, getCookie('userName'));
      }
      generatePost(postID, post.title, post.content, newLikeStr, newLikeStr.includes("You"));
    } else {
      if (typeof post.message !== 'object')
        window.alert(post.message);
      else{
        for (let prop in post.message)
          window.alert(post.message[prop]);
      }
    }
  }
  request.send();
}

//Full list of people who like
function likeList() {
  let postID = window.location.href.split('/').pop()
  let likes = JSON.parse(queryLikes(postID));
  let liked = generateLikeStr(likes, getCookie('userName'), true);
  for (let person in liked) {
    let p = document.createElement('p');
    let pText = document.createTextNode(liked[person])
    p.append(pText);
    document.body.append(p);
  }
}

//Add new like to posts
function addLike(postID) {
  const output = {
    postID: postID,
    accID: getCookie('id'),
    userName: getCookie('userName')
  }
  myJson = JSON.stringify(output);
  //Call api to put new like
  url = baseURL + '/like/' + postID;
  let request = new XMLHttpRequest();
  request.open('PUT', url, true);
  request.setRequestHeader('Content-type','application/json; charset=utf-8');
  request.onload = function () {
    let like = JSON.parse(request.responseText);
    if (request.readyState == 4 && request.status == "201") {
      //Render liked button and Errors handling
      likeButton = document.getElementById('likeButton' + postID)
      likeButton.value = 'Liked';
      likeString = document.getElementById('likeStr' + postID);
      let likes = JSON.parse(queryLikes(postID));
      likeString.innerHTML = generateLikeStr(likes, output.userName);
      likeString.href = '/likeList/' + postID;
    } else {
      if (typeof like.message !== 'object')
        window.alert(like.message);
      else{
        for (let prop in like.message)
          window.alert(like.message[prop]);
      }
    }
  }
  request.send(myJson);
}

//Update account infomation page
function updateInfo() {
  //Take input from html
  const output = {
    name: '',
    phoneNumber: '',
    occupation: ''
  }
  other = document.getElementById('others');
  for (let prop in output) {
    element = document.getElementById(prop);
    if (element.value === '' || element.value === undefined) {
      window.alert('Please fill in all missing infomation!')
      return;
    }
    if (prop !== "occupation") 
      output[prop] = element.value;
    else if (element.value !== "Others")
      output[prop] = element.value;
    else if (other.value !== "Others" && other.value !== "")
      output[prop] = other.value ;
  }
  //Call api to PATCH account infomation
  myJson = JSON.stringify(output);
  url = baseURL + '/account/' + getCookie('id');
  let request = new XMLHttpRequest();
  request.open('PATCH', url, true);
  request.setRequestHeader('Content-type','application/json; charset=utf-8');
  request.onload = function () {
    let account = JSON.parse(request.responseText);
    if (request.readyState == 4 && request.status == "200") {
      window.alert('Update Information Successfully!');
      window.location.href = '/home';
    } else {
      //Errors handling
      if (typeof account.message !== 'object')
        window.alert(account.message);
      else {
        for (let prop in account.message)
          window.alert(account.message[prop]);
      }
    }
  }
  request.send(myJson);
}

//Log out and delete cookies
function logOut() {
  deleteCookie('userName');
  deleteCookie('id');
  signOutGG();
  logOutFB();
  window.location.href = '/login';
}


/* ---------------------------------------------------------- */
//Facebook and Google Sign In 

//Sign in with google
function onSignInGG(googleUser) {
  //Get information from google account
  let profile = googleUser.getBasicProfile();
  let email = profile.getEmail();
  //Call api to get account information from database
  url = baseURL + '/account/email/' + email;
  let request = new XMLHttpRequest();
  request.open('GET', url, true);
  request.setRequestHeader('Content-type','application/json; charset=utf-8');
  request.onload = function () {
    let account = JSON.parse(request.responseText);
    if (request.readyState == 4 && request.status == "200") {
      //Matching google account and webpage account
      setCookie("userName", account.userName);
      setCookie("id", account.id);
      let updateInfoNeeded = false;
      for (let prop in account) {
        if (prop === 'name' || prop === 'phoneNumber' || prop === 'occupation')
          setCookie(prop, account[prop]);
          if (account[prop] === '')
            updateInfoNeeded = true;
      }
      if (updateInfoNeeded === true)
        window.location.href = '/updateInfo';
      else {
        deleteCookie('name');
        deleteCookie('phoneNumber');
        deleteCookie('occupation');
        window.location.href = '/home';
      }
    } else {
      //Error handling
      if (typeof account.message !== 'object')
        window.alert(account.message);
      else {
        for (let prop in account.message)
          window.alert(account.message[prop]);
      }
      setCookie('email', email);
      setCookie('name', profile.getName())
      window.location.href = '/signup';
    }
  }
  request.send();
}

//Sign up with google
function onSignUpGG(googleUser) {
  //Get account info from google
  let profile = googleUser.getBasicProfile();
  let email = profile.getEmail();
  url = baseURL + '/account/email/' + email;
  let request = new XMLHttpRequest();
  request.open('GET', url, true);
  request.setRequestHeader('Content-type','application/json; charset=utf-8');
  request.onload = function () {
    //Matching google account and webpage account
    let account = JSON.parse(request.responseText);
    if (request.readyState == 4 && request.status == "200") {
      setCookie("userName", account.userName);
      setCookie("id", account.id);
      let updateInfoNeeded = false;
      for (let prop in account) {
        if (prop === 'name' || prop === 'phoneNumber' || prop === 'occupation')
          setCookie(prop, account[prop]);
          if (account[prop] === '')
            updateInfoNeeded = true;
      }
      if (updateInfoNeeded === true)
        window.location.href = '/updateInfo';
      else {
        deleteCookie('name');
        deleteCookie('phoneNumber');
        deleteCookie('occupation');
        window.location.href = '/home';
      }
    } else {
      //If account doesn't exist process to sign up new account for user
      setCookie('email', email);
      setCookie('name', profile.getName());
      displayInfo();
    }
  }
  request.send();
}
//Sign out of google
function signOutGG() {
  var auth2 = gapi.auth2.getAuthInstance();
  auth2.signOut();
}

function statusChangeCallback(response, logInPage) {  // Called with the results from FB.getLoginStatus().
  if (response.status === 'connected') {   // Logged into your webpage and Facebook.
    if (logInPage === true)
      onSignInFB();
    else
      onSignUpFB();  
  }                                        // Not logged into your webpage or we are unable to tell.
}


function checkLoginStateLogIn() {               // Called when a person is finished with the Login Button.
  FB.getLoginStatus(function(response) {   // See the onlogin handler
    statusChangeCallback(response, true);
  });
}

function checkLoginStateSignUp() {               // Called when a person is finished with the Login Button.
  FB.getLoginStatus(function(response) {   // See the onlogin handler
    statusChangeCallback(response, false);
  });
}

window.fbAsyncInit = function() {
  FB.init({
    appId      : fbAppID,
    cookie     : true,                     // Enable cookies to allow the server to access the session.
    xfbml      : true,                     // Parse social plugins on this webpage.
    version    : 'v10.0'                   // Use this Graph API version for this call.
  });


  FB.getLoginStatus(function(response) {   // Called after the JS SDK has been initialized.
    statusChangeCallback(response);        // Returns the login status.
  });
};

//Sign in with facebook
function onSignInFB() {              
  //Get info from facebook account        
  FB.api('/me', 'GET',{"fields":"name,email"}, function(response) {
    let email = response.email;
    //Call api to get account info from database
    url = baseURL + '/account/email/' + email;
    let request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.setRequestHeader('Content-type','application/json; charset=utf-8');
    request.onload = function () {
      let account = JSON.parse(request.responseText);
      if (request.readyState == 4 && request.status == "200") {
        //Matching facebook account with website account
        setCookie("userName", account.userName);
        setCookie("id", account.id);
        let updateInfoNeeded = false;
        for (let prop in account) {
          if (prop === 'name' || prop === 'phoneNumber' || prop === 'occupation')
            setCookie(prop, account[prop]);
            if (account[prop] === '')
              updateInfoNeeded = true;
        }
        if (updateInfoNeeded === true)
          window.location.href = '/updateInfo';
        else {
          deleteCookie('name');
          deleteCookie('phoneNumber');
          deleteCookie('occupation');
          window.location.href = '/home';
          }
      } else {
        //Errors handling
        if (typeof account.message !== 'object')
          window.alert(account.message);
        else {
          for (let prop in account.message)
            window.alert(account.message[prop]);
        }
        setCookie('email', email);
        setCookie('name', response.name);
        window.location.href = '/signup';
      }
    }
    request.send();
  });
}

//Sign up with facebook
function onSignUpFB() {
  //Get account info from facebook
  FB.api('/me', 'GET',{"fields":"name,email"}, function(response) {
    let email = response.email;
    //Call api to get account info from database
    url = baseURL + '/account/email/' + email;
    let request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.setRequestHeader('Content-type','application/json; charset=utf-8');
    request.onload = function () {
      let account = JSON.parse(request.responseText);
      if (request.readyState == 4 && request.status == "200") {
        //Matching facebook account and website account
        setCookie("userName", account.userName);
        setCookie("id", account.id);
        let updateInfoNeeded = false;
        for (let prop in account) {
          if (prop === 'name' || prop === 'phoneNumber' || prop === 'occupation')
            setCookie(prop, account[prop]);
            if (account[prop] === '')
              updateInfoNeeded = true;
        }
        if (updateInfoNeeded === true)
          window.location.href = '/updateInfo';
        else {
          deleteCookie('name');
          deleteCookie('phoneNumber');
          deleteCookie('occupation');
          window.location.href = '/home';
        }
      } else {
        //If account doesn't exist, process to sign up new account for user.
        setCookie('email', email);
        setCookie('name', response.name);
        displayInfo();
      }
    }
    request.send();
  });
}

//Log out of FB
function logOutFB() {
    FB.logout();
}