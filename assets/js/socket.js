
import {Socket} from "phoenix"

let socket = new Socket("/socket", {params: {token: window.userToken}})

socket.connect()

// Now that you are connected, you can join channels with a topic:
let channel = socket.channel("lobby", {});

$(document).ready(function() { channel.push('update_socket', { username: userID });
});

if(document.getElementById("signup"))         
{
  let new_username = $('#new_username');
  let new_password    = $('#new_password');
 
  document.getElementById("signup").onclick = function() {
  channel.push('register_account', { username: new_username.val(), password: new_password.val() });
};
}

if(document.getElementById("btnTweet")) 
{
  $(document).ready(function() { 
  channel.push('update_socket', { username: userID });
});

  let tweetText  = $('#tweetContent');
  var userID =  window.location.hash.substring(1)
  document.getElementById("btnTweet").onclick = function() {
  channel.push('tweet', { tweetText: tweetText.val() , username: userID });
};
}

if(document.getElementById("btnFollow")) 
{
  let selfId = $('#selfId');
  let username2 = $('#username2');
  var userID =  window.location.hash.substring(1)
  document.getElementById("btnFollow").onclick = function() {
  channel.push('subscribeTo', { username2: username2.val(), selfId: userID });
};
}

if(document.getElementById("btnMyMentions"))
{
  var userID =  window.location.hash.substring(1)
  document.getElementById("btnMyMentions").onclick = function() {
  channel.push('getMyMentions', { username: userID });
};
}

if(document.getElementById("btnhashtag"))
{
  let hash = $('#hashtag');
  document.getElementById("btnhashtag").onclick = function() {
  channel.push('tweetsWithHashtag', { hashtag: hash.val() });
};
}

if(document.getElementById("signin"))
{
  let username = $('#username');
  let password    = $('#password');
  document.getElementById("signin").onclick = function() {
  channel.push('login', { username: username.val(), password: password.val() });
};
}

if(document.getElementById("btnRetweet"))
{
  document.getElementById("btnRetweet").onclick = function() {
    var userID =  window.location.hash.substring(1)
    var val_radio = $('input[name=radioTweet]:checked').attr("tweet");
    var org_user = $('input[name=radioTweet]:checked').attr("user");
    channel.push('reTweet', { username: userID,  tweet: val_radio, org: org_user});
}};

if(document.getElementById("btnQueryTweets"))
{
  var userID =  window.location.hash.substring(1)
  document.getElementById("btnQueryTweets").onclick = function() {
  channel.push('queryTweets', { username: userID });
}
};

channel.on('Login', payload => {

  var unlog    = document.getElementById("unlog");
  unlog.innerHTML = '';
   if(`${payload.login_status}` == "Login unsuccessful")
   {
    unlog.innerHTML+= (`<b>Incorrect username or password.Please try again!<br>`);
   }
   else 
   {
     unlog.innerHTML = '';
     window.location.href = 'http://localhost:4000/dashboard' + '#' + payload.user_name;
  }
});

channel.on('ReceiveTweet', payload => {
  let tweet_list    = $('#tweet-list');
  var btn = document.createElement("INPUT");
  btn.setAttribute('type', 'radio');
  btn.setAttribute('name', 'radioTweet');
  btn.setAttribute('user', `${payload.tweeter}`);
  btn.setAttribute('tweet', `${payload.tweetText}`);
  tweet_list.append(btn);
  if(`${payload.isRetweet}` == "false")
  {
    tweet_list.append(`<b>${payload.tweeter} tweeted:</b> ${payload.tweetText}<br>`);
  }
  if(`${payload.isRetweet}` == "true")
  {
    tweet_list.append(`<b>${payload.tweeter} retweeted ${payload.org}'s post:</b> ${payload.tweetText}<br>`);
  }
  tweet_list.prop({scrollTop: tweet_list.prop("scrollHeight")});
});

channel.on('ReceiveMentions', payload => {
  var area   = document.getElementById("mentionsArea");
  var myTweets = payload.tweets;
  var arrayLength = myTweets.length;
  area.innerHTML = '';
  for (var i = 0; i < arrayLength; i++) {
    area.innerHTML+=(`<b>${payload.tweets[i].tweeter} tweeted:</b> ${payload.tweets[i].tweet}`);
    area.innerHTML+="<br>";
  }
  $(area).prop({scrollTop: $(area).prop("scrollHeight")});
});

channel.on('ReceiveQueryResults', payload => {
  var area   = document.getElementById("queryArea");
  var myTweets = payload.tweets;
  var arrayLength = myTweets.length;
  area.innerHTML = '';
  for (var i = 0; i < arrayLength; i++) {
    area.innerHTML+=(`<b>${payload.tweets[i].tweeter} tweeted:</b> ${payload.tweets[i].tweet}`);
    area.innerHTML+="<br>";
  }
  $(area).prop({scrollTop: $(area).prop("scrollHeight")});
});


channel.on('AddToFollowsList', payload => {
  var area   = document.getElementById("followsArea");
  var follows = payload.follows;
  var arrayLength = follows.length;
  area.innerHTML = '';
  for (var i = 0; i < arrayLength; i++) {
    area.innerHTML+=(`${payload.follows[i]}`);
   area.innerHTML+="<br>";
  }
$(area).prop({scrollTop: $(area).prop("scrollHeight")});
});

channel.on('ReceiveHashtags', payload => {
  var hasharea   = document.getElementById("hashtagArea");
  var myTweets2 = payload.tweets;
  var arrayLength2 = myTweets2.length;
  hasharea.innerHTML = '';
  for (var i = 0; i < arrayLength2; i++) {
    hasharea.innerHTML+=(`<b>${payload.tweets[i].tweeter} tweeted:</b> ${payload.tweets[i].tweet}`);
    hasharea.innerHTML+="<br>";
  }
  $(hasharea).prop({scrollTop: $(hasharea).prop("scrollHeight")});
});

channel.join()
  .receive("ok", resp => { console.log("Joined successfully.", resp) })
  .receive("error", resp => { console.log("Unable to join.", resp) })

export default socket