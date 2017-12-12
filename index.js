// index.js

const _ = require('lodash')

const GetBucketValues = require('./cache/get-bucket-values')

const whenQuit = (getBucketValues, err) => getBucketValues.whenQuit().then(() => Promise.reject(err))

exports.whenHandler = (event) => {
    if (!event) return Promise.reject(new Error('Invalid event - ' + JSON.stringify(event)))        
    if (!_.isObject(event)) return Promise.reject(new Error('Invalid event - ' + JSON.stringify(event)))        
    console.info(JSON.stringify(event))
    const getBucketValues = new GetBucketValues()
    try
    {
        let p;
        if (event.bucket === 'collections')
            p = getBucketValues.whenGetCollections()
        else if (event.bucket === 'regions')
            p = getBucketValues.whenGetRegions()
        else if (event.bucket === 'cuisines')
            p = getBucketValues.whenGetCuisines()
        else
            return Promise.reject(new Error('Invalid event - ' + JSON.stringify(event)))
        return p.then(results => getBucketValues.whenQuit()
                                                .then(() => Promise.resolve(results)))
                .catch(err => whenQuit(getBucketValues, err))
    }
    catch (err)
    {
        return whenQuit(getBucketValues, err)
    }
}

exports.handler = (event, context, callback) => {
    exports.whenHandler(event)
            .then(result => callback(null, result))
            .catch(err => callback(err))    
}