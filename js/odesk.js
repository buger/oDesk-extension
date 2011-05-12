(function(window, $, undefined){
        var oDesk = {
            api_key: '',
            api_url: "http://www.odesk.com/api/profiles/v1/"
        }
        
        oDesk.callMethod = function(method, options) {
            if (!options)
                options = {}
            
            options.url = this.api_url + method;

            return $.ajax(options);
        }
        
        function XMLToJSON(xml) {
            var json = {};
            var childNodes = xml.childNodes;

            for(var i=0; i<childNodes.length; i++) {                
                if (childNodes[i].childNodes.length > 0) {
                    if (childNodes[i].childNodes[0].nodeValue) 
                        json[childNodes[i].tagName] = childNodes[i].childNodes[0].nodeValue;                    
                    else
                        json[childNodes[i].tagName] = XMLToJSON(childNodes[i]);
                }                
            }

            return json;
        }

        oDesk.searchContractors = function(categories, search_term) {
            var query_params = {};
        
            if (categories)     
                for (var i=1; i<categories.length+1; i++) {
                    query_params['c'+i] = categories[i];
                }
            
            query_params['q'] = search_term;
            
            var parse_providers = function(xml) {
                var providers = xml.getElementsByTagName("provider");

                var json = [];

                for (var i=0; i<providers.length; i++) {
                    json.push(XMLToJSON(providers[i]));
                }
                
                console.log(json);

                return json;
            }

            return this.callMethod("search/providers", {data: query_params, dataFilter: parse_providers});
        }

        oDesk.searchJobs = function(categories, search_term) {
            var query_params = {};
        
            if (categories)     
                for (var i=1; i<categories.length+1; i++) {
                    query_params['c'+i] = categories[i];
                }
            
            query_params['q'] = search_term;
            
            var parse_jobs = function(xml) {
                var jobs = xml.getElementsByTagName("job");

                var json = [];

                for (var i=0; i<jobs.length; i++) {
                    json.push(XMLToJSON(jobs[i]));
                }
                
                console.log(json)

                return json;
            }

            return this.callMethod("search/jobs", {data: query_params, dataFilter: parse_jobs});
        }

        window.oDesk = oDesk;
}(window, jQuery))
