
var dict ={};
var ids = {}; //max_id_str and since_id_str are used to prevent paging probem

var firstTimeFlag = true //First iteration requires only count parameter. Next calls will require max_id_str and since_id_str
console.log("Twitter bot is starting!!!");

var Twit = require('twit');

var config = require('./config');
var T = new Twit(config);

//Stream to reply Thank you to the users the momemnt they follow you
var stream = T.stream('user');
stream.on('follow', followed);
function followed(eventMsg){
  var name = eventMsg.source.name;
  var screenName = eventMsg.source.screen_name;
  tweetThanks('@'+screenName+' Thank you for the follow!');
}
 function tweetThanks(text){
   var tweet = {
     status: text
   }
   T.post('statuses/update', tweet, sent);

   function sent(err, data, response){
     if(!err){
       console.log("Reply sent!");
     }else{
       //Handle the error
     }
   }
 }

//Set Interval : Call method searchIt after decided interval
searchIt();
setInterval(searchIt, 1000*60*60*1);
// search twitter for all tweets containing the word 'Arsenal' since July 11, 2011
function searchIt(){
  console.log("ids is " + ids)
  console.log("First time flag is "+firstTimeFlag);
  var params = {
    q : 'Arsenal since:2017-07-11',
    count: 100
  }
  if(!firstTimeFlag){
    //Setting the params attribute.
    params.max_id_str = ids.maxId;
    params.since_id_str = ids.sinceId;

  }
  T.get('search/tweets', params, recData);
  console.log(params);
  function recData(err, data, response){
      var id;
      var details = data.statuses;
      var lastId;
      var retweet = {}
    for(var i = 0 ; i< details.length ; i++){
      tweetId = details[i].id_str;
      console.log(tweetId);

       if(i==0){
         ids.maxId = details[i].id_str;
       }
        if(details[i].retweet_count > 400)
        {

          if(tweetId in dict){
            //Duplicate tweet. Do nothing!
          }
          else{
            //retweet the tweet
            retweet.id = tweetId;
            T.post('statuses/retweet/:id', retweet, function (err, data, response) {
                if(err){
                  console.log("Error caused by " + tweetId);
                  //console.log(err);
                //  console.log(dict);
                }else{

                  console.log('Sucessful!!');
                  console.log("to go inside dict :" +tweetId);
                  dict[tweetId] = 1;
                  console.log("**");
                  console.log(dict);
                }
          });
  }
  ids.sinceId = details[i].id_str;
    }

    firstTimeFlag = false;
  }
}
}
