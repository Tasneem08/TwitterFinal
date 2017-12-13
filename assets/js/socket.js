// NOTE: The contents of this file will only be executed if
// you uncomment its entry in "assets/js/app.js".

// To use Phoenix channels, the first step is to import Socket
// and connect at the socket path in "lib/web/endpoint.ex":
import {Socket} from "phoenix"

let socket = new Socket("/socket", {params: {token: window.userToken}})

// When you connect, you'll often need to authenticate the client.
// For example, imagine you have an authentication plug, `MyAuth`,
// which authenticates the session and assigns a `:current_user`.
// If the current user exists you can assign the user's token in
// the connection for use in the layout.
//
// In your "lib/web/router.ex":
//
//     pipeline :browser do
//       ...
//       plug MyAuth
//       plug :put_user_token
//     end
//
//     defp put_user_token(conn, _) do
//       if current_user = conn.assigns[:current_user] do
//         token = Phoenix.Token.sign(conn, "user socket", current_user.id)
//         assign(conn, :user_token, token)
//       else
//         conn
//       end
//     end
//
// Now you need to pass this token to JavaScript. You can do so
// inside a script tag in "lib/web/templates/layout/app.html.eex":
//
//     <script>window.userToken = "<%= assigns[:user_token] %>";</script>
//
// You will need to verify the user token in the "connect/2" function
// in "lib/web/channels/user_socket.ex":
//
//     def connect(%{"token" => token}, socket) do
//       # max_age: 1209600 is equivalent to two weeks in seconds
//       case Phoenix.Token.verify(socket, "user socket", token, max_age: 1209600) do
//         {:ok, user_id} ->
//           {:ok, assign(socket, :user, user_id)}
//         {:error, reason} ->
//           :error
//       end
//     end
//
// Finally, pass the token on connect as below. Or remove it
// from connect if you don't care about authentication.

socket.connect()

// Now that you are connected, you can join channels with a topic:
let channel = socket.channel("lobby", {});

/*message.on('keypress', event => {
  if (event.keyCode == 13) {
    channel.push('register_account', { name: name.val(), message: message.val() });
    message.val('');
  }
});*/

$(document).ready(function() { channel.push('update_socket', { username: userID });
});

if(document.getElementById("signup"))         // use this if you are using id to check
{
  let new_username = $('#new_username');
  let new_password    = $('#new_password');
  //window.location = "http://localhost:4000/dashboard.html?temp=" + new_username;
 
  document.getElementById("signup").onclick = function() {
 
    //console.log(window.location.href);
  channel.push('register_account', { username: new_username.val(), password: new_password.val() });
  
  //location.href="home.html"
};
}
if(document.getElementById("btnTweet"))         // use this if you are using id to check
{
  $(document).ready(function() { channel.push('update_socket', { username: userID });
});

  let tweetText    = $('#tweetContent');
  var userID =  window.location.hash.substring(1)
  document.getElementById("btnTweet").onclick = function() {
  channel.push('tweet', { tweetText: tweetText.val() , username: userID });
};
}

if(document.getElementById("btnFollow"))         // use this if you are using id to check
{
  let selfId = $('#selfId');
  let username2 = $('#username2');
  var userID =  window.location.hash.substring(1)
  //let username_orig = Request.querystring["temp"];
  //var text =
  
  document.getElementById("btnFollow").onclick = function() {
   console.log("user" + userID);
   console.log("posting subscribe.");
  
  channel.push('subscribeTo', { username2: username2.val(), selfId: userID });
};
}

if(document.getElementById("btnMyMentions"))         // use this if you are using id to check
{
  var userID =  window.location.hash.substring(1)
  
  document.getElementById("btnMyMentions").onclick = function() {
  channel.push('getMyMentions', { username: userID });
};
}

if(document.getElementById("btnhashtag"))         // use this if you are using id to check
{
  let hash = $('#hashtag');
  document.getElementById("btnhashtag").onclick = function() {
  channel.push('tweetsWithHashtag', { hashtag: hash.val() });
};
}

if(document.getElementById("signin"))         // use this if you are using id to check
{
  let username = $('#username');
  let password    = $('#password');
document.getElementById("signin").onclick = function() {
  // window.location.href = 'http://localhost:4000/dashboard' + '#' + username.val();
  channel.push('login', { username: username.val(), password: password.val() });
  //  location.href = "http://localhost:4000/dashboard";
};
}

if(document.getElementById("btnRetweet"))         // use this if you are using id to check
{
  document.getElementById("btnRetweet").onclick = function() {
    var userID =  window.location.hash.substring(1)
    var val_radio = $('input[name=radioTweet]:checked').attr("tweet");
   var org_user = $('input[name=radioTweet]:checked').attr("user");
    channel.push('reTweet', { username: userID,  tweet: val_radio, org: org_user});
}};

if(document.getElementById("btnQueryTweets"))         // use this if you are using id to check
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
    //window.location.href = "http://localhost:4000/";
    unlog.innerHTML+= (`<b>Incorrect username or password.Please try again!<br>`);
    //unlog.append(`<b>Incorrect username or password.Please try again!<br>`);
    console.log("unsuccessful");
    
   }
   else 
   {
     console.log("successful");
     unlog.innerHTML = '';
     window.location.href = 'http://localhost:4000/dashboard' + '#' + payload.user_name;
  }
});

channel.on('ReceiveTweet', payload => {
  //alert(`${payload.login_status}`)
  let tweet_list    = $('#tweet-list');
  var btn = document.createElement("INPUT");
  btn.setAttribute('type', 'radio');
  btn.setAttribute('name', 'radioTweet');
  btn.setAttribute('user', `${payload.tweeter}`);
  btn.setAttribute('tweet', `${payload.tweetText}`);
  console.log(`${payload.isRetweet}`);
  //btn.innerHTML = 'RETWEET';
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
  .receive("ok", resp => { console.log("Joined successfully", resp) })
  .receive("error", resp => { console.log("Unable to join", resp) })

export default socket