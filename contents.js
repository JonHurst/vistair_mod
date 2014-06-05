$(main);

function main() {
    var manual = window.location.search;
    if(window.location.protocol == "file:") {
	var query_pos = window.location.href.search(/\?/);
	if(query_pos != -1) {
	    manual = window.location.href.substring(query_pos + 1);
	}
    }
    master_toc(manual, function(t) {
		   $("#contents").append(t);
		   $("#contents li").each(fold_toc_section);
		   $("#contents a").each(
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
    // var item = $("<li>" + node.title + "</li>");
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
    var vte = $(this);
    vte.addClass("folded");
    if(vte.children("ul").length) {
	var control = $("<span class='control'></span>");
	vte.prepend(control);
	control.click(function() {vte.toggleClass("folded");});
    }
}