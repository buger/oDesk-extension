$.facebox.settings.closeImage = chrome.extension.getURL('/facebox/closelabel.png');
$.facebox.settings.loadingImage = chrome.extension.getURL('/facebox/loading.gif');

var logo = chrome.extension.getURL('odesk-logo.png');

var response_func;

browser.addMessageListener(function(msg) {
    switch (msg.method) {
        case 'searchResult':
            if ($('#facebox').is(':visible')) {
                $('#facebox .fb_content').html(msg.html);
            } else {
                $.facebox(msg.html);
            }
            
            var search_type;

            var search_by_tags = function(){
                var tags = $('#facebox .odesk_tags input[type=hidden]')
                    .map(function(){ return this.value }).toArray();
                 
                if (!search_type) {
                    search_type = $('#facebox .search_type .inactive').hasClass('search_jobs') ? 'jobs' : 'contractors';

                    console.log($('#facebox .search_type .inactive').hasClass('search_jobs'), search_type);
                }               

                $('#facebox .fb_content .odesk_search_results')
                    .html('<div class="fb_loading"><img src="'+$.facebox.settings.loadingImage+'"/></div>');


                browser.postMessage({ method: 'search', tags: tags, search_type: search_type });
            }

            if (msg.search_type === 'contractors') {
                $('#facebox .search_contractors').addClass('inactive');
                $('#facebox .search_jobs').bind('click', function(){
                    search_type = 'jobs';
                    search_by_tags();
                });
            } else {
                $('#facebox .search_jobs').addClass('inactive');
                $('#facebox .search_contractors').bind('click', function(){
                    search_type = 'contractors';
                    search_by_tags('contractors');
                });
            }

            $("#facebox .odesk_tags").tagit({
                availableTags: [],
                tagSource: function(request, response){
                    response_func = response;

                    browser.postMessage({ method: 'autocompleteTag', tag: request.term });
                },
                onTagAdded: search_by_tags,
                onTagRemoved: search_by_tags
            });

            $("#facebox .tagit-input").focus();
            break;

        case 'autocompleteTag':
            response_func(msg.tags);
            break;

        default:
            break;
    }
});

browser.onReady(function(){});

$(document).ready(function() {
    $('.post-taglist, .summary .tags').each(function(){
        $('<a class="odesk_provider_search" title="Search on oDesk"><img src="'+logo+'" style="width: 18px; height: 18px; vertical-align: middle;"/></a>').appendTo(this);
    });

    $('.odesk_provider_search').live('click', function(){
        $.facebox.loading();

        var tags = $(this.parentNode).find('a[rel=tag]')
            .map(function(){ return $(this).text().toString() }).toArray();

        browser.postMessage({ method: 'search', tags: tags });
    });
});
