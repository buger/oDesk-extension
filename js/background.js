// Called when the url of a tab changes.
function checkForValidUrl(tabId, changeInfo, tab) {
    // If the letter 'g' is found in the tab's URL...
    if (tab.url.indexOf('stackoverflow') > -1) {
      // ... show the page action.
      chrome.pageAction.show(tabId);
    }
};

// Listen for any changes to the URL of any tab.
chrome.tabs.onUpdated.addListener(checkForValidUrl);

function generateHtmlForOdeskProviders(providers, skills) {
    var items = [];

    for (var i=0; i<providers.length && i<5; i++) {
        var href = "http://www.odesk.com/users/"+providers[i].ciphertext;
        var html = '<li><a href="'+href+'" target="_blank">'
        if (providers[i].dev_portrait)
            html += '<img src="'+providers[i].dev_portrait+'"/>';
        else 
            console.log(providers[i]);
            
        html += providers[i].contact_name+'</a></li>';

        items.push(html);
    }

    items = '<ul>'+items.join('')+'</ul>';

    items = "<div class='odesk_providers'><div class='header'>Matching skills: "+skills.join(', ')+"</div>"+items+"</div>"

    return items;
}

browser.onReady(function(){
});

browser.addMessageListener(function(msg, sender) {
    switch(msg.method) {
        case 'getProviders': 
            oDesk.searchProviders(null, msg.skills.join('+'))
                .success(function(providers){
                    var html = generateHtmlForOdeskProviders(providers, msg.skills);                    
                    browser.postMessage({ method: 'updateProviders', html:html }, sender);
                });
            break;
    }
});


