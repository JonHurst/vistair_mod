$(main);


function main() {
    if($("body.contents").length) {return contents_main();}
    if($("body.index").length) {return index_main();}
    //disable ipad.css
    $("link[href='common/ipad.css']")[0].disabled=true;
    //fix "popup" protocol
    $("img").each(fix_popup_image);
    //add keyhandling
    $(document).keypress(keypress_handler);
    //do manual specific processing
    var href = window.location.href;
    var ezy_manuals = [/EZY-ALL-A/, /EZY-A3XX-B/, /EZY-ALL-C/, /EZY-ALL-CSPM/, /EZY-ALL-ABS/];
    for(var c = 0; c < ezy_manuals.length; c++) {
	if(href.search(ezy_manuals[c]) != -1) {return ezy_main();}
    }
    var airbus_manuals = [/EZY-A3N-FCOM/, /EZY-A3N-MEL/, /EZY-A3N-FCTM/, /EZY-A3N-QRH/];
    for(var c = 0; c < airbus_manuals.length; c++) {
	if(href.search(airbus_manuals[c]) != -1) {return airbus_main();}
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
    //scroll hash back into view - may have been messed around by re-ordering
    scroll_to_hash();
}


function contents_main() {
    var manual = window.location.search;
    if(window.location.protocol == "file:") {
	var query_pos = window.location.href.search(/\?/);
	if(query_pos != -1) {
	    manual = window.location.href.substring(query_pos + 1);
	}
    }
    master_toc(manual, function(t) {
		   $("#toc").append(t);
		   $("#toc li").each(fold_toc_section);
		   $("#toc a").each(
		       function() {
			   var href = $(this).attr("href");
			   $(this).attr("href", manual + "/" + href);
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
    var msn = "2037";
    var query_pos = window.location.href.search(/\?/);
    if(query_pos != -1) {
	var query = window.location.href.substring(query_pos + 1);
	var pairs = query.split("&");
	for(var c = 0; c < pairs.length; c++) {
	    if(pairs[c].substring(0, 4) != "msn=") {
		continue;
	    }
	    msn = pairs[c].substring(4);
	    $("a").each(
		function() {
		    var href = $(this).attr("href");
		    if(! href) {return;}
		    if(href.search(/\?/) == -1) {
			$(this).attr("href", href + "?msn=" + msn);
		    }
		    else {
			$(this).attr("href", href + "&msn=" + msn);
		}
	    });
	    break;
	}
    }
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
    for(i in section_groups) {
	var effective=undefined;
	var not_effective = [];
	for(j in section_groups[i]) {
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
	      not_effective[c].find(".dusol").attr("id")  + ")</a>"
	      + "<a class='hide' href='#'>Hide</a>"
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
    }
    return true;
}



function scroll_to_hash() {
    var hash_pos = window.location.href.search(/\#/);
    if(hash_pos != -1) {
	var hash = window.location.href.substring(hash_pos + 1).split("?")[0];
	var hash_element = document.getElementById(hash);
	console.log(hash_element);
	$(hash_element).addClass("show");
	var effectivity_parent = $(hash_element).parents(".effectivity");
	if(effectivity_parent.length) {
	    effectivity_parent.removeClass("hidden");
	    effectivity_parent.next().removeClass("hiding");
	}
	hash_element.scrollIntoView(); 
    }
}