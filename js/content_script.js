$.facebox.settings.closeImage = chrome.extension.getURL('/facebox/closelabel.png');
$.facebox.settings.loadingImage = chrome.extension.getURL('/facebox/loading.gif');

var logo = chrome.extension.getURL('odesk-logo.png');

browser.addMessageListener(function(msg) {
    switch (msg.method) {
        case 'searchResult':
            renderResults(msg);
            break;

        case 'autocompleteTag':
            response_func(msg.tags);
            break;

        case 'showSearch':
            $.facebox.loading();
            browser.postMessage({ method: 'search', tags: msg.tags });
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
