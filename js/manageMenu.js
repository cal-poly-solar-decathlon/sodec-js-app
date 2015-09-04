/**
 * Created by skahal on 9/1/15.
 */

$(function() {
    var pgurl = window.location.href.substr(window.location.href
            .lastIndexOf("/")+1);
    $("#nav ul li a").each(function(){
        if($(this).attr("href") == pgurl || $(this).attr("href") == '' )
            $(this).addClass("active");
    })
});