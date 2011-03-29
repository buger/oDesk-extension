function generateHtmlForSearchResults(results, tags) {
    var items = [];

    for (var i=0; i<results.length && i<5; i++) {
        if (results[i].job_type) {
            var href = "http://www.odesk.com/jobs/"+results[i].ciphertext;
            var html = '<li><a href="'+href+'" target="_blank">'
                
            html += results[i].op_title+'</a>';            
            html += "<div class='job_description'>";
            html += "<span class='type'>"+results[i].job_type+"</span>";
            if (results[i].job_type === 'Fixed') {
                html += "<span>Est. Budget: $"+parseInt(results[i].amount)+".00</span>";
            } else {
                html += "<span>Est. Time: "+results[i].engagement_weeks+",</span>";
                html += "<span>"+results[i].op_engagement+"</span>";

                if (results[i].op_avg_hourly_rate_all) {
                    html += "<span>Avg. Hourly rate: $"+parseInt(results[i].op_avg_hourly_rate_all)+"</span>";
                }
            }
            html += "</div>";
            html += '</li>';
        } else {
            var href = "http://www.odesk.com/users/"+results[i].ciphertext;
            var html = '<li><a href="'+href+'" target="_blank">'
            if (!results[i].dev_portrait)
                results[i].dev_portrait = browser.extension.getURL("/empty_avatar.png?1");

            html += '<img class="avatar" src="'+results[i].dev_portrait+'"/>';            
            html += "<span class='rate'>$"+results[i].charge_rate_hourly+"/hr</span>";
            html += results[i].contact_name+'</a>';
            html += '</li>';
        }
        
        items.push(html);
    }

    tags = tags.map(function(skill){return "<li>"+skill+"</li>"}).join(''); 

    if (items.length == '0') {
        items.push("<li>No matches</li>");
    }

    items = '<ul>'+items.join('')+'</ul>';
    items = "<div class='odesk_search_items'>"+
               "<div class='header'>Tags: "+
                   "<ul class='odesk_tags'>"+tags+"</ul>"+
                "</div>"+
                "<div class='odesk_search_results'>"+
                    "<div class='search_type'>"+
                        "<a class='search_contractors' href='javascript:;'>Search contractors</a>"+
                        "<a class='search_jobs' href='javascript:;'>Search jobs</a>"+
                    "</div>"+items+                    
                "</div>"+
            "</div>"

    return items;
}

browser.onReady(function(){
});

Array.prototype.unique =
    function() {
        var a = [];
        var l = this.length;
        for(var i=0; i<l; i++) {
            for(var j=i+1; j<l; j++) {
                // If this[i] is found later in the array
                if (this[i] === this[j])
                    j = ++i;
            }
            
            a.push(this[i]);
        }        
        return a;
  };

browser.addMessageListener(function(msg, sender) {
    switch(msg.method) {
        case 'search':
            if (!msg.search_type) {
                msg.search_type = 'contractors';
            }

            if (msg.search_type == 'contractors') {
                oDesk.searchContractors(null, msg.tags.join('+'))
                    .success(function(contractors){
                        var html = generateHtmlForSearchResults(contractors, msg.tags);                    
                        browser.postMessage({ method: 'searchResult', html:html, search_type: msg.search_type }, sender);
                    });
            } else {
                 oDesk.searchJobs(null, msg.tags.join('+'))
                    .success(function(jobs){                        
                        console.log("Jobs:", jobs);

                        var html = generateHtmlForSearchResults(jobs, msg.tags)
                        browser.postMessage({ method: 'searchResult', html:html, search_type: msg.search_type }, sender);
                    });               
            }
            break;
        
        case 'autocompleteTag':            
            var tag = msg.tag.replace(/"/,'\'').toLowerCase();
            
            browser.webdb.query('SELECT * FROM (SELECT tag FROM (SELECT 1 as sort_field, tag FROM skills WHERE LOWER(tag) LIKE "'+tag+'%" UNION SELECT 0 as sort_field, tag FROM skills WHERE skill LIKE "'+tag+'%" UNION ALL SELECT 0 as sort_filed, tag FROM skills WHERE skill LIKE "%'+tag+'%") ORDER BY sort_field DESC LIMIT 6)',
                function(tx, resp) {
                    var tags = []
                    
                    for (var i=0; i<resp.rows.length; i++) {
                        tags.push(resp.rows.item(i).tag);
                    }
                    
                    browser.postMessage({ method: 'autocompleteTag', tags: tags.unique() }, sender);
                }
            );
            
            break;
    }
});

browser.webdb = {};
browser.webdb.db = null;

browser.webdb.open = function() {
  var dbSize = 5 * 1024 * 1024; // 5MB
  browser.webdb.db = openDatabase('Skills', '1.0', 'Skills', dbSize);
}

browser.webdb.onSuccess = function(tx, e) {
}

browser.webdb.onError = function(tx, e) {
  console.error('Something unexpected happened: ' + e.message );
}


browser.webdb.query = function(query, callback) {
    browser.webdb.db.transaction(function(tx) {
        tx.executeSql(query, [], callback, 
            browser.webdb.onError);
    });
}

browser.webdb.createTable = function() {
    browser.webdb.db.transaction(function(tx) {
        tx.executeSql('CREATE TABLE IF NOT EXISTS ' + 
                      'skills(ID INTEGER PRIMARY KEY ASC, skill STRING, tag STRING)', []);
    });
}

browser.webdb.open();
browser.webdb.createTable();

browser.webdb.query("SELECT * FROM skills LIMIT 1", 
    function(tx, result){
        if (result.rows.length === 0) {
            for (var i=0; i<window.skills_dictionary.length; i++) {
                tx.executeSql('INSERT INTO skills(skill, tag) VALUES (?,?)', 
                    [window.skills_dictionary[i][0], window.skills_dictionary[i][1]],
                    browser.webdb.onSuccess,
                    browser.webdb.onError);
            }
        }
    }
);

