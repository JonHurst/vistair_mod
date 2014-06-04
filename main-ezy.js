$(main);


function main() {
    //wrap #content to enable width control
    $("#content").wrap("<div class='mw_wrapper'></div>");
    //add keyhandling
    $(document).keypress(keypress_handler);
    //fix "popup" protocol
    $("img").each(fix_popup_image);
    //open toc links in new tab
    $("div.tocsection a").click(force_new);
    //fix titles
    fix_title();
    //fold toc
    $(".tocentry").each(fold_toc_section);

}


function keypress_handler(ev) {
    if(ev.which == 110) {
	var l = $(".navbottom a").attr("href");
	if(l) {window.location = l;}
    }
    else if(ev.which == 112) {
	var l = $(".navtop a").attr("href");
	if(l) {window.location = l;}
    }
    else if(ev.which == 119) {
	var l = $(".mw_wrapper").toggleClass("wide");
    }
    return true;
}


function fix_popup_image() {
    $(this).click(
	function() {
	    window.open($(this).parent().attr("href").replace(/popup:\/\//, ""));
	    return false;
	});
}


function force_new()
{
    var href = $(this).attr("href");
    window.open(href);
    return false;
}


function fix_title() {
    var title = $(".title:first").text();
    if(title) {
	document.title = title;
    }
    else {
	title = document.title;
    }
    $("#pageheader").prepend("<div id='page_title'>" + title + "</div>");
   
}


function fold_toc_section() {
    var vte = $(this);
    vte.addClass("folded");
    if(vte.next(".tocsection").length) {
	var control = $("<span class='control'></span>");
	vte.find(".index_text").prepend(control);
	control.click(function() {vte.toggleClass("folded");});
    }
}