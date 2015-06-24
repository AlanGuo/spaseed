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
        'datamanager': 'lib/datamanager',
        'pageswitcher':'lib/pageswitcher',
        'model':'lib/model',
        'requestconstructor':'lib/requestconstructor',
        'requestmanager':'lib/requestmanager',
        'formatcheck':'lib/formatcheck',
        'binder':'lib/binder',
        'stats':'lib/stats',
        'dialog':'lib/dialog',
        
        'router': 'main/router',
        'entry': 'main/entry',
        'config': 'config',
        'asyncrequest': 'lib/asyncrequest'
         
        'pagemanager': 'main/pagemanager',
    }
});