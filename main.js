$(main);


function folded_msn() {
    return /-2037-/;
}


function main() {
    fix_title();
    //fix "popup" protocol
    $("img").each(fix_popup_image);
    //anchors in vsttoc sections open links in new tabs
    $("div.vsttoc a").click(force_new);
    //fold toc
    $(".vsttocentry-psl-withtab").each(fold_toc_section);
    //hide "Applicable to: ALL"
    $("div.vstidenttext").each(hide_if_all);
    //add keyhandling
    $(document).keypress(keypress_handler);
    //rejig effectivity
    rejig_effectivity();
}


function fix_title() {
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

function fix_popup_image() {
    var popup_href = $(this).parent().attr("href");
    popup_href = popup_href.replace(/popup:\/\//, "");
    $(this).parent().attr("href", popup_href);
    $(this).parent().click(force_new);
}

function force_new()
{
    var href = $(this).attr("href");
    window.open(href); 
    return false;
}

function rejig_effectivity() {
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
	    if(effectivity.search(folded_msn()) != -1) {
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
	window.location = $(".navbottom a").attr("href");
    }
    else if(ev.which == 112) {
	window.location = $(".navtop a").attr("href");
    }
    return true;n
}

function fold_toc_section() {
    var vte = $(this);
    vte.addClass("folded");
    if(vte.next(".vsttocsection").length) {
	var control = $("<span class='control'></span>");
	vte.find(".vsttocentrytext").prepend(control);
	control.click(function() {vte.toggleClass("folded");});
    }
}