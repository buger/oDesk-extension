

browser.addMessageListener(function(msg) {
    switch (msg.method) {
        case 'searchResult':
            msg.time = new Date().getTime();
            store.set('latest_search', msg);            
            renderResults(msg);
            break;

        case 'autocompleteTag':
            response_func(msg.tags);
            break;

        default:
            break;
    }
});

browser.onReady(function(){
    var latest_search = store.get('latest_search');
    
    //caching for 10 minutes
    if (latest_search) {
        if (((new Date().getTime()) - latest_search.time) < 10*60*1000) {
            renderResults(latest_search)
        } else {
            browser.postMessage({ method: 'search', tags: latest_search.tags || [] });   
        }
    } else {
        browser.postMessage({ method: 'search', tags: [] });   
    }
});



