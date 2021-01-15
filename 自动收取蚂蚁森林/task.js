var triggerTime = "07:01";

var hour_min = triggerTime.split(":");

var hour = hour_min[0];

var min = hour_min[1];

function getHourMinNow(){
    var now = new Date();
    return [now.getHours(),now.getMinutes()]
}

while(true){

    var hour_min_now = getHourMinNow();
    if(hour_min_now[0] == hour && hour_min_now[1] == min){
        console.log("now time:"+hour+":"+min);
        break;
    }else{
        sleep(59*1000); // sleep 59s
        console.log("sleeping about 59s.");
    }

}


