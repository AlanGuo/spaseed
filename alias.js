seajs.config({
    base:'/',
    alias: {
        //spaseed
        '$': 'lib/zepto',                  
        'util': 'lib/util',
        'net': 'lib/net',
        'ck': 'lib/cookie',
        'event': 'lib/event',
        'querystring':'lib/querystring',
        'dataManager': 'lib/datamanager',
        'pageswitcher':'lib/pageswitcher',
        
        'router': 'main/router',
        'entry': 'main/entry',
        'config': 'config',
        'asyncrequest': 'lib/asyncrequest'
         
        'pageManager': 'main/pagemanager',
    }
});