var loading_image = chrome.extension.getURL('/facebox/loading.gif');
var response_func;

function renderResults(msg) {
    $("#facebox .fb_content").html(msg.html);
    
    var search_type;

    var search_by_tags = function(){
        var tags = $('#facebox .odesk_tags input[type=hidden]')
            .map(function(){ return this.value }).toArray();
         
        if (!search_type) {
            search_type = $('#facebox .search_type .inactive').hasClass('search_jobs') ? 'jobs' : 'contractors';

            console.log($('#facebox .search_type .inactive').hasClass('search_jobs'), search_type);
        }               

        $('#facebox .fb_content .odesk_search_results')
            .html('<div class="fb_loading"><img src="'+loading_image+'"/></div>');


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
}
