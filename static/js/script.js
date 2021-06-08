//Change baseURL before running
const baseURL = "http://localhost:5000";

function generatePost(id, postTitle, postContent, likeStr, liked = false, userName = '') {
  let div = document.createElement('div');
  div.className = "post" + id; 
  
  if (userName !== '') {
    let user = document.createElement('h3');
    let userText = document.createTextNode(userName + " posted:");
    user.append(userText);
    div.append(user);
  }
  let title = document.createElement('h4');
  let titleText = document.createTextNode(postTitle);
  title.append(titleText);
  div.append(title);

  let content = document.createElement('p');
  let link = document.createElement('a');
  let contentText = document.createTextNode(postContent);
  link.append(contentText);
  link.href = '/postDetailed/' + id;
  link.className = "content";
  content.append(link)
  div.append(content);

  let like = document.createElement('input');
  like.type = 'submit';
  if (liked === false)
    like.value = 'Like';
  else
    like.value = 'Liked'
  like.id = 'likeButton' + id;
  like.onclick = () => {addLike(id);};
  div.append(like);

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

function queryLikes(postID) {
  let url = baseURL + '/like/' + postID;
  let request = new XMLHttpRequest();
  request.open('GET', url, false);
  request.send();
  return request.responseText;
}

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
  if (detailed === false) {
    if (likeList.length === 1) 
      return likeList[0] + ' liked this post.'
    else if (likeList.length === 2)
      return likeList[0] + ', ' + likeList[1] + ' liked this post.'
    else
      return likeList[0] + ', ' + likeList[1] + ', and '+ (likeList.length - 2).toString() + ' other people liked this post.'
  }
  else
    return likeList;
}
function goBack() {
  window.location.replace(document.referrer);
}
function getCookie(cookieName) {
  const cookieValue = document.cookie
    .split('; ')
    .find(row => row.startsWith(cookieName + '='));
  if (cookieValue !== undefined)
    return cookieValue.split("=")[1];
  return "";
}
function setCookie(cookieName, cookieValue) {
  let d = new Date();
  d.setTime(d.getTime() + (5*24*60*60*1000));
  let expires = "expires=" + d;
  document.cookie = cookieName + "=" + cookieValue + ";" + expires + ";path=/; SameSite=None; Secure";
}

function deleteCookie(cookieName) {
  let d = new Date()
  d.setTime(d.getTime() - 1)
  let expires = "expires=" + d;
  document.cookie = cookieName + "=;" + expires + ";path=/"
}

function CheckIfOthers(val) {
  let element=document.getElementById('others');
  if (val === 'Others')
    element.style.display = 'inline';
  else  
    element.style.display = 'none';
 }  

 function signUp() {
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

function logIn() {
  const input = {
    userName: '',
    password: ''
  }
  for (let prop in input) {
    element = document.getElementById(prop);
    input[prop] = element.value;
  }
  url = baseURL +'/account/' + input.userName;
  let request = new XMLHttpRequest();
  request.open('GET', url, true);
  request.setRequestHeader('Content-type','application/json; charset=utf-8');
  request.onload = function () {
    let account = JSON.parse(request.responseText);
    if (request.readyState == 4 && request.status == "200") {
      if (account.password === input.password) {
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
        window.alert("Wrong password!")
    } else {
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

function home() {
  userName = getCookie('userName')
  document.title = userName + "'s homepage";
  url = baseURL + '/post';
  let request = new XMLHttpRequest();
  request.open('GET', url, true);
  request.setRequestHeader('Content-type','application/json; charset=utf-8');
  request.onload = function () {
    let posts = JSON.parse(request.responseText);
    if (request.readyState == 4 && request.status == "200") {
      for (let i in posts) {
        let likes = JSON.parse(queryLikes(posts[i].id));
        let newLikeStr = "No one liked this post yet."
        if (likes.length !== undefined) {
          newLikeStr = generateLikeStr(likes, userName);
        }
        generatePost(posts[i].id, posts[i].title, posts[i].content, newLikeStr, newLikeStr.includes("You"), posts[i].userName);
      }
    } else {
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

function wall() {
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
        let likes = JSON.parse(queryLikes(posts[i].id));
        let newLikeStr = "No one liked this post yet."
        if (likes.length !== undefined) {
          newLikeStr = generateLikeStr(likes, userName);
        }
        generatePost(posts[i].id, posts[i].title, posts[i].content, newLikeStr, newLikeStr.includes("You"));
      }
    } else {
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

function createPost() {
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

  url = baseURL + '/post';
  let request = new XMLHttpRequest();
  request.open('PUT', url, true);
  request.setRequestHeader('Content-type','application/json; charset=utf-8');
  request.onload = function () {
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

function postDetailed() {
  let postID = window.location.href.split('/').pop();
  url = baseURL + '/post/' + postID;

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

function addLike(postID) {
  const output = {
    postID: postID,
    accID: getCookie('id'),
    userName: getCookie('userName')
  }
  myJson = JSON.stringify(output);

  url = baseURL + '/like/' + postID;
  let request = new XMLHttpRequest();
  request.open('PUT', url, true);
  request.setRequestHeader('Content-type','application/json; charset=utf-8');
  request.onload = function () {
    let like = JSON.parse(request.responseText);
    if (request.readyState == 4 && request.status == "201") {
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

function updateInfo() {
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

function logOut() {
  deleteCookie('userName');
  deleteCookie('id');
  signOutGG();
  logOutFB();
  window.location.href = '/login';
}

function onSignInGG(googleUser) {
  let profile = googleUser.getBasicProfile();
  let email = profile.getEmail();
  url = baseURL + '/account/email/' + email;
  let request = new XMLHttpRequest();
  request.open('GET', url, true);
  request.setRequestHeader('Content-type','application/json; charset=utf-8');
  request.onload = function () {
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

function onSignUpGG(googleUser) {
  let profile = googleUser.getBasicProfile();
  let email = profile.getEmail();
  url = baseURL + '/account/email/' + email;
  let request = new XMLHttpRequest();
  request.open('GET', url, true);
  request.setRequestHeader('Content-type','application/json; charset=utf-8');
  request.onload = function () {
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
      setCookie('email', email);
      setCookie('name', profile.getName());
      displayInfo();
    }
  }
  request.send();
}
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
  }                                  // Not logged into your webpage or we are unable to tell.
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
    appId      : '1391529697889548',
    cookie     : true,                     // Enable cookies to allow the server to access the session.
    xfbml      : true,                     // Parse social plugins on this webpage.
    version    : 'v10.0'           // Use this Graph API version for this call.
  });


  FB.getLoginStatus(function(response) {   // Called after the JS SDK has been initialized.
    statusChangeCallback(response);        // Returns the login status.
  });
};

function onSignInFB() {                      // Testing Graph API after login.  See statusChangeCallback() for when this call is made.
  FB.api('/me', 'GET',{"fields":"name,email"}, function(response) {
    let email = response.email;
    url = baseURL + '/account/email/' + email;
    let request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.setRequestHeader('Content-type','application/json; charset=utf-8');
    request.onload = function () {
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

function onSignUpFB() {
  FB.api('/me', 'GET',{"fields":"name,email"}, function(response) {
    let email = response.email;
    url = baseURL + '/account/email/' + email;
    let request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.setRequestHeader('Content-type','application/json; charset=utf-8');
    request.onload = function () {
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
        setCookie('email', email);
        setCookie('name', response.name);
        displayInfo();
      }
    }
    request.send();
  });
}

function logOutFB() {
    FB.logout();
}