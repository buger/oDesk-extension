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
                    json[childNodes[i].tagName] = childNodes[i].childNodes[0].nodeValue;
                }                
            }

            return json;
        }

        oDesk.searchProviders = function(categories, search_term) {
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

                return json;
            }

            return this.callMethod("search/providers", {data: query_params, dataFilter: parse_providers});
        }

        window.oDesk = oDesk;
}(window, jQuery))
