seajs.config({
    base:'/',
    alias: {
        //spaseed
        'mp': 'main/mp',
        'Node': 'main/Node',
        'App': 'main/App',
        'Router': 'main/H5Router',
        'View': 'main/View',

        '$': 'lib/dom',
        'Net': 'lib/Net',
        'Event': 'lib/Event',
        'Console': 'lib/Console',
        'env': 'lib/env',
        'cookie': 'lib/cookie',
        'querystring':'lib/querystring',
        'datamanager': 'lib/datamanager',
        'pageswitcher':'lib/pageswitcher',
        'formatcheck':'lib/formatcheck',
        'securerequest':'lib/securerequest',
        'emulatescroll':'lib/emulatescroll',
        'binder':'lib/binder',
        'stats':'lib/stats',
        'dialog':'lib/dialog',
        
        'config': 'config',
        'asyncrequest': 'lib/asyncrequest'
         
        'pagemanager': 'main/pagemanager',
    }
});