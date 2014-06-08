var default_msn = "2037";
var ezy_manuals = ["EZY-ALL-A", "EZY-A3XX-B", "EZY-ALL-C", "EZY-ALL-CSPM", "EZY-ALL-ABS"];
var airbus_manuals = ["EZY-A3N-FCOM", "EZY-A3N-MEL", "EZY-A3N-FCTM", "EZY-A3N-QRH"];

function ezy_manualp(manual) {
    for(var c = 0; c < ezy_manuals.length; c++) {
	if(manual == ezy_manuals[c]) return true;
	}
    return false;
}

function airbus_manualp(manual) {
    for(var c = 0; c < airbus_manuals.length; c++) {
	if(manual == airbus_manuals[c]) return true;
	}
    return false;
}


$(main);

var search = "";
var hash = "";

function main() {
    //search and hash extraction
    search = window.location.href.match(/\?.+/);
    if(search) {search = search[0].substr(1);}
    hash = window.location.href.match(/#[^\?]+/);
    if(hash) {hash = hash[0].substr(1);}
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
	if(ezy_manualp(manual)) ezy_main();
	else if(airbus_manualp(manual)) airbus_main();
	//add link to contents page
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
    var manual = search;
    if(!airbus_manualp(manual)) $("#msn").remove();
    master_toc(manual, function(t) {
		   $("#loading").remove();
		   $("#toc").append(t);
		   $("#toc li").each(fold_toc_section);
		   $("#toc a").click(
		       function(ev) {
			   ev.preventDefault();
			   var href = $(this).attr("href");
			   if(airbus_manualp(manual)) href+= "?" + $("input[name='msn']").val();
			   window.open(href);
		       });
               });
}


function master_toc(manual, callback_func) {
    function recursive_process_master_toc(node) {
	var item = $("<li><a href='" + manual + "/" + 
		     node.filename + "#" + node.anchor + 
		     "'>" + node.title + "</a></li>");
	if(node.children) {
    	    var child_item = $("<ul></ul>");
    	    for(var c = 0; c < node.children.length; c++) {
    		child_item.append(recursive_process_master_toc(node.children[c]));
    	    }
	    item.append(child_item);
	}
	return item;
    }
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


function fold_toc_section() {
    var section = $(this);
    section.addClass("folded");
    if(section.children("ul").length) {
	var control = $("<div class='control'></div>");
	section.prepend(control);
	control.click(function() {section.toggleClass("folded");});
    }
}


function index_main() {
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
    if(title) document.title = title;
    insert_long_title();
}


function insert_long_title() {
    var thisfile = window.location.href.match(/\/[^\/]+\.html/)[0].substr(1);
    var long_title = $("<div id='long_title'> </div>");
    var msn = search || default_msn;
    function recursive_find_section(n) {
	if(n.filename && n.filename == thisfile) {
	    long_title.prepend($("<br/><span>" + n.title + "</span>"));
	    return true;
	}
	if(! n.children) {return false;}
	for(var c = 0; c < n.children.length; c++) {
	    if(recursive_find_section(n.children[c])) {
		if(n.filename) {
		    var fn = n.filename;
		    if(n.anchor) fn += "#" + n.anchor;
		    var title_link = $("<a>" + n.title + "</a><span> » </span>");
		    title_link.attr("href", fn + "?" + msn);
		    long_title.prepend(title_link);
		}
		return true;
	    }
	}
	return false;
    }
    jQuery.getJSON(
	window.location.href.match(/\/EZY-[^\/]+/)[0].substr(1) + "_toc.json",
	function(m) {
	    recursive_find_section(m);
	    $("#pageheader").prepend(long_title);
	});
}


function fix_title_ezy() {
    var title = $(".title:first").text();
    if(title)
	document.title = title;
    insert_long_title();
}


function rejig_effectivity() {
    var msn = search || default_msn;
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