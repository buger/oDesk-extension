$.facebox.settings.closeImage = chrome.extension.getURL('/facebox/closelabel.png');
$.facebox.settings.loadingImage = chrome.extension.getURL('/facebox/loading.gif');

browser.addMessageListener(function(msg) {
    switch (msg.method) {
        case 'updateProviders':
            console.log('updading providers', msg);

            $.facebox(msg.html);
            break;

        default:
            break;
    }
});

browser.onReady(function(){});

$(document).ready(function() {
    $('.post-taglist, .summary .tags').each(function(){
        $('<a class="odesk_provider_search">Search Providers</a>').appendTo(this);
    });

    $('.odesk_provider_search').live('click', function(){
        $.facebox.loading();

        var skills = $(this.parentNode).find('a[rel=tag]')
            .map(function(){ return $(this).text().toString() }).toArray();

        browser.postMessage({ method: 'getProviders', skills: skills });
    });
});
