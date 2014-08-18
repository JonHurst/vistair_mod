var default_msn = "2037";
var ezy_manuals = ["EZY-ALL-A_old", "EZY-ALL-A-JUN14", "EZY-A3XX-B_old", "EZY-A3XX-B-JUN14", "EZY-ALL-C-JUN14", "EZY-ALL-CSPM", "EZY-ALL-ABS"];
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
	//add keyhandling
	$(document).keypress(keypress_handler);
	//fix titles
	insert_titles();
	//get manual name
	var manual = window.location.href.match(/\/EZY-[^\/]+/)[0].substr(1);
	//do manual specific processing
	if(ezy_manualp(manual)) ezy_main();
	else if(airbus_manualp(manual)) airbus_main();
	//fix "popup" protocol
	$("img").each(fix_popup_image);
	//scroll hash back into view - may have been messed around by re-ordering etc
	scroll_to_hash();
    }
}


function ezy_main() {
    $("body").addClass("ezy");
    //wrap #content to enable width control
    $("#content").wrap("<div class='mw_wrapper'></div>");
}


function airbus_main() {
    $("body").addClass("airbus");
    rejig_effectivity();
    //hide "Applicable to: ALL"
    $("div.vstidenttext").each(hide_if_all);
    //New version includes L1, L2 and L3 as anchor and sometimes includes
    //document text within anchor. Therefore remove L1, L2 and L3 if found
    //at start of anchor text.
    $("a").each(function() {
                    var t = $(this).text();
                    if(t.match(/^L[1-3]/))
                        $(this).text(t.slice(2));
                });
    //Update anchors are now a.xref with hash as an elder sibling
    $("a.xref").each(function() {
		     if($(this).text().match(/^H\d{1,4}$/))
			 $(this).addClass("hide");
		     });
    $("#content").addClass("show");
}


function msn_cookie() {
    var msn = false;
    var cookies = document.cookie;
    if(cookies) {
	var cookie_list = cookies.split("; ");
	for(var c = 0; c < cookie_list.length; c++) {
           if(cookie_list[c].substr(0, 4) == "msn=") {
		msn = cookie_list[c].substr(4);
		break;
           }
       }
    }
    return msn;
}


function contents_main() {
    var manual = search;
    master_toc(manual, function(t) {
                   $("#loading").remove();
                   $("#toc").append(t);
                   $("a.toc_entry").click(
                       function(ev) {
                           ev.preventDefault();
                           window.open($(this).attr("href"));
                       });
                   $("#toc li").each(fold_toc_section);});
}


function master_toc(manual, callback_func) {
    function recursive_process_master_toc(node) {
        var item = $("<li><a class='toc_entry' href='" + manual + "/" +
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
    var curr_msn = msn_cookie() || default_msn;
    $("<span id='msn_field'>" +curr_msn + " </span>").insertBefore("#change_msn");
    $("#change_msn").click(
        function(ev) {
            ev.preventDefault();
            var newmsn = prompt("New MSN");
            if(newmsn) {
                curr_msn = newmsn;
                document.cookie = "msn=" + newmsn + "; max-age=86400";
                $("#msn_field").text(newmsn + " ");
            }
        });
}


function fix_popup_image() {
    var containing_anchor = $(this).parents("a").first();
    var newhref = containing_anchor.attr("href").replace(/popup:\/\//, "");
    containing_anchor.attr("href", newhref);
    containing_anchor.click(
        function() {
            window.open($(this).attr("href"));
            return false;
        });
}


function insert_titles() {
    var manual = window.location.href.match(/\/EZY-[^\/]+/)[0].substr(1);
    var manual_title = document.title;
    var thisfile = window.location.href.match(/\/[^\/]+\.html/)[0].substr(1);
    var long_title = $("<div id='long_title'> </div>");
    function recursive_find_section(n) {
        if(n.filename && n.filename == thisfile) {
            long_title.prepend($("<br/><span>" + n.title + "</span>"));
            document.title = n.title;
            return true;
        }
        if(! n.children) {return false;}
        for(var c = 0; c < n.children.length; c++) {
            if(recursive_find_section(n.children[c])) {
                if(n.filename) {
                    var fn = n.filename;
                    if(n.anchor) fn += "#" + n.anchor;
                    long_title.prepend($("<span class='nowrap'><a href='" + fn +  "'>" + n.title + "</a> »</span><span> </span>"));
                }
                return true;
            }
        }
        return false;
    }
    jQuery.getJSON(
        manual + "_toc.json",
        function(m) {
            recursive_find_section(m);
            long_title.prepend(
                $("<span><a href='../contents.html?" + manual +"'>"
                  + manual_title + "</a> » </span>"));
            long_title.prepend(
                $("<span><a href='../index.html'>All</a> » </span>"));
            $("#pageheader").prepend(long_title);
        });
}


function rejig_effectivity() {
    var msn = msn_cookie() || default_msn;
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
    if($(this).text().search(/Applicable to: ALL/) != -1) {
        $(this).css("display", "none");
    }
}


function keypress_handler(ev) {
    if(ev.which == 110) {
        var l = $(".navbottom a:last").attr("href");
        if(l) {window.location = l;}
    }
    else if(ev.which == 112) {
        var l = $(".navtop a:last").attr("href");
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
        //hash now sometimes refers to name attribute of an <a>
        var hash_element = $("a[name='" + hash + "']").get(0);
        if(! hash_element) {
            hash_element = document.getElementById(hash);
        }
        if(! hash_element) {return;}
        var effectivity_parent = $(hash_element).parents(".effectivity");
        if(effectivity_parent.length) {
            effectivity_parent.removeClass("hidden");
            effectivity_parent.next().removeClass("hiding");
        }
	$(hash_element).parents("div:first").find("a.xref").removeClass("hide");
	hash_element.scrollIntoView();
    }
}