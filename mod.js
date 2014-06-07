$(main);

var search;
var hash;

function main() {
    //handle search and hash extraction for file: protocol
    if(window.location.protocol == "file:") {
	search = window.location.href.match(/\?.+/);
	if(search) {search = search[0].substr(1);}
	hash = window.location.href.match(/#[^\?]+/);
	if(hash) {hash = hash[0].substr(1);}
    }
    else {
	search = window.location.search && window.location.search.substr(1);
	hash = window.location.hash && window.location.hash.substr(1);
    }
    if($("body.contents").length) {contents_main();}
    else if($("body.index").length) {index_main();}
    else {
	//disable ipad.css
	$("link[href='common/ipad.css']")[0].disabled=true;
	//fix "popup" protocol
	$("img").each(fix_popup_image);
	//add keyhandling
	$(document).keypress(keypress_handler);
	//do manual specific processing
	var manual = window.location.href.match(/\/EZY-[^\/]+/)[0].substr(1);
	var ezy_manuals = ["EZY-ALL-A", "EZY-A3XX-B", "EZY-ALL-C", "EZY-ALL-CSPM", "EZY-ALL-ABS"];
	for(var c = 0; c < ezy_manuals.length; c++) {
	    if(manual == ezy_manuals[c]) {ezy_main();}
	}
	var airbus_manuals = ["EZY-A3N-FCOM", "EZY-A3N-MEL", "EZY-A3N-FCTM", "EZY-A3N-QRH"];
	for(var c = 0; c < airbus_manuals.length; c++) {
	    if(manual == airbus_manuals[c]) {airbus_main();}
	}
	//add link to contents page
	if(search) {manual = manual + "&" + search;}
	$(".navtop").append($("<a class='clink' href='../contents.html?" + manual + "'>Contents</a>"));
	//scroll hash back into view - may have been messed around by re-ordering etc
	scroll_to_hash();
    }
}


function ezy_main() {
    $("body").addClass("ezy");
    //wrap #content to enable width control
    $("#content").wrap("<div class='mw_wrapper'></div>");
    //fix titles
    fix_title_ezy();
}


function airbus_main() {
    $("body").addClass("airbus");
    rejig_effectivity();
    fix_title_airbus();
    //hide "Applicable to: ALL"
    $("div.vstidenttext").each(hide_if_all);
    $("#content").addClass("show");
}


function contents_main() {
    var search_fields = search.split("&");
    var manual = search_fields[0];
    if(search_fields.length == 2) {
	$("input[name='msn']").val(search_fields[1]);
    }
    master_toc(manual, function(t) {
		   $("#toc").append(t);
		   $("#toc li").each(fold_toc_section);
		   $("#toc a").click(
		       function(ev) {
			   ev.preventDefault();
			   var href = manual + "/" + 
			       $(this).attr("href") + "?" + $("input[name='msn']").val();
			   if(search_fields.length > 1) {document.location = href;}
			   else window.open(href);
		       });
		   $("#all_link").click(
		       function(ev) {
			   ev.preventDefault();
			   document.location = $(this).attr("href") + "?" + $("input[name='msn']").val();
		       });
               });
}


function master_toc(manual, callback_func) {
    jQuery.getJSON(
	manual + "/" + manual + "_toc.json",
	function(m) {
	    var toc = $("<ul id='master_toc'></ul>");
    	    for(var c = 0; c < m.children.length; c++) {
    		toc.append(recursive_process_master_toc(m.children[c]));
		$("h1").text(m.title);
		document.title = m.title;
    	    }
	    callback_func(toc);
	});
}


function recursive_process_master_toc(node) {
    var item = $("<li><a href='" + node.filename + "#" + node.anchor + "'>" + node.title + "</a></li>");
    if(node.children) {
    	var child_item = $("<ul></ul>");
    	for(var c = 0; c < node.children.length; c++) {
    	    child_item.append(recursive_process_master_toc(node.children[c]));
    	}
	item.append(child_item);
    }
    return item;
}


function fold_toc_section() {
    var section = $(this);
    section.addClass("folded");
    if(section.children("ul").length) {
	var control = $("<span class='control'></span>");
	section.prepend(control);
	control.click(function() {section.toggleClass("folded");});
    }
}    


function index_main() {
    if(search) {
	$("a").each(
	    function() {
		var href = $(this).attr("href");
		if(href.search("contents.html") != -1) {
		    $(this).attr("href", href + "&" + search);
		}
	    });
	}
}


function fix_popup_image() {
    $(this).click(
	function() {
	    window.open($(this).parent().attr("href").replace(/popup:\/\//, ""));
	    return false;
	});
}


function fix_title_airbus() {
    var last_plp = $(".product").find(".psl:last");
    var title = last_plp.children("a").attr("name");
    var containing_bookmarks = last_plp.prevAll(".bookmark_title");
    if(containing_bookmarks.length) {
    	var title_regexp = RegExp(title.match(/^[A-Z\-]+/)[0] + "[0-9\- ]+");
	var bookmark_text = "";
	for(var c = containing_bookmarks.length - 1; c >= 0; c--) {
	    bookmark_text += "." + $(containing_bookmarks[c]).text().replace(title_regexp, "");
	}
    	title += " — " + bookmark_text.substr(1);
    }
    else {
	title += " (cont)";
    }
    if(title == "PLP-TOC") {
	title = document.title;
    }
    else {
	document.title = title;
    }
    $("#pageheader").prepend("<div id='page_title'>" + title + "</div>");
   
}


function fix_title_ezy() {
    var title = $(".title:first").text();
    if(title) {
	document.title = title;
    }
    else {
	title = document.title;
    }
    $("#pageheader").prepend("<div id='page_title'>" + title + "</div>");
   
}


function rejig_effectivity() {
    var msn = search || "2037";
    //update all links with msn
    $("a").each(
	function() {
	    var href = $(this).attr("href");
	    if(! href) {return;}
	    var search_pos = href.search(/\?/);
	    if(search_pos !== -1) {
		href = href.substr(0, search_pos);
	    }
	    $(this).attr("href", href + "?" + msn);
	});
    var section_groups = {};
    $("div.effectivity").each(
	function() {
	    var ident = $(this).find(".dusol").attr("id");
	    var group_ident = ident.replace(/dusol-/, "").split(".")[0];
	    if(section_groups[group_ident] == undefined) {
		section_groups[group_ident] = {};
	    }
	    section_groups[group_ident][ident] = $(this);
	});
    for(var i in section_groups) {
	var effective=undefined;
	var not_effective = [];
	for(var j in section_groups[i]) {
	    var effectivity = section_groups[i][j].attr("id");
	    if(effectivity.search(RegExp("-" + msn + "-")) != -1) {
		section_groups[i][j].addClass("effective");
		effective = section_groups[i][j];
	    }
	    else {
		section_groups[i][j].addClass("not_effective hidden");
		not_effective.push(section_groups[i][j]);
	    }
	}
	if(!effective) {
	    effective = $("<div class='nodu effective'>"
			  + "Section not applicable to selected MSN"
			  + "</div>");
	    effective.insertBefore(not_effective[0]);
	}
	for(var c = 0; c < not_effective.length; c++) {
	    not_effective[c].remove();
	    not_effective[c].insertAfter(effective);
	    $("<div class='effectivity_toggle hiding'>"
	      + "<a class='show' href='#'>Show alternative (" + 
	      not_effective[c].find(".dusol").attr("id").match(/\.[0-9]+/)[0].substr(1)
	      + ")</a><a class='hide' href='#'>Hide</a>"
	      + "</div>").insertAfter(not_effective[c]);
	}
    }
    $(".effectivity_toggle a.show").click(
	function() {
	    $(this).parent().removeClass("hiding");
	    $(this).parent().prev().removeClass("hidden");
	    return false;});
    $(".effectivity_toggle a.hide").click(
	function() {
	    $(this).parent().addClass("hiding");
	    $(this).parent().prev().addClass("hidden");
	    return false;});
}


function hide_if_all() {
    if($(this).text() == "Applicable to: ALL") {
	$(this).css("display", "none");
    }
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
	var l = $("#content, .mw_wrapper").toggleClass("wide");
	scroll_to_hash();
    }
    return true;
}



function scroll_to_hash() {
    if(hash) {
	var hash_element = document.getElementById(hash);
	if(! hash_element) {return;}
	$(hash_element).addClass("show");
	var effectivity_parent = $(hash_element).parents(".effectivity");
	if(effectivity_parent.length) {
	    effectivity_parent.removeClass("hidden");
	    effectivity_parent.next().removeClass("hiding");
	}
	hash_element.scrollIntoView(); 
    }
}